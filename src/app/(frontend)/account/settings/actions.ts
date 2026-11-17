'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { parseProfile, passwordProblem } from '@/lib/account-settings'
import { passwordCheckRateLimited } from '@/lib/rate-limit'

export type ActionResult = { ok: boolean; message: string }

const SIGNED_OUT: ActionResult = { ok: false, message: 'Your session has ended. Please sign in again.' }
const FAILED: ActionResult = { ok: false, message: 'Something went wrong. Please try again.' }

async function currentCustomer() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })
  return { payload, requestHeaders, user: user?.collection === 'customers' ? user : null }
}

export async function updateProfile(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const { payload, user } = await currentCustomer()
  if (!user) return SIGNED_OUT
  const parsed = parseProfile({ name: form.get('name'), phone: form.get('phone') })
  if ('error' in parsed) return { ok: false, message: parsed.error }
  try {
    // Only name/phone are written; access control still applies to this customer.
    await payload.update({
      collection: 'customers',
      id: user.id,
      data: parsed.data,
      user,
      overrideAccess: false,
    })
  } catch {
    payload.logger.error({ msg: 'account settings: profile update failed' })
    return FAILED
  }
  revalidatePath('/account')
  return { ok: true, message: 'Your details have been saved.' }
}

export async function changePassword(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const { payload, requestHeaders, user } = await currentCustomer()
  if (!user) return SIGNED_OUT
  const current = form.get('currentPassword')
  const next = form.get('newPassword')
  const confirm = form.get('confirmPassword')
  if (typeof current !== 'string' || !current)
    return { ok: false, message: 'Enter your current password.' }
  const problem = passwordProblem(next)
  if (problem) return { ok: false, message: problem }
  if (next !== confirm) return { ok: false, message: 'New passwords do not match.' }
  if (next === current)
    return { ok: false, message: 'Choose a password different from your current one.' }
  if (await passwordCheckRateLimited(requestHeaders))
    return { ok: false, message: 'Too many attempts. Please wait a minute and try again.' }

  // Re-verify through Payload's own login (same hashing incl. the Workers PBKDF2
  // patch, same lockout counter). It adds a session, which the update below drops.
  try {
    await payload.login({ collection: 'customers', data: { email: user.email, password: current } })
  } catch {
    // Wrong password or locked account: same answer either way.
    return { ok: false, message: 'Current password is incorrect.' }
  }
  try {
    // Payload keeps only the caller's session (user._sid) and revokes all other
    // sessions when the password changes, so other devices are signed out.
    await payload.update({
      collection: 'customers',
      id: user.id,
      data: { password: next as string },
      user,
      overrideAccess: false,
    })
  } catch {
    payload.logger.error({ msg: 'account settings: password change failed' })
    return FAILED
  }
  return { ok: true, message: 'Password changed. Other devices have been signed out.' }
}
