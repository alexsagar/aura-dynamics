'use client'

import React, { useActionState, useEffect, useRef } from 'react'
import { Button } from '@/components/storefront/ui/Button'
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, NAME_MAX_LENGTH, PHONE_MAX_LENGTH } from '@/lib/account-settings'
import { changePassword, updateProfile, type ActionResult } from './actions'

const label = 'text-sm font-semibold tracking-[0.1em] text-muted uppercase'
const input =
  'rounded-full border border-black/10 bg-white px-6 py-3 outline-none transition-colors focus:border-black'

function Status({ state }: { state: ActionResult | null }) {
  if (!state) return null
  return (
    <div
      role={state.ok ? 'status' : 'alert'}
      className={`rounded-xl border p-4 text-sm ${
        state.ok ? 'border-green-100 bg-green-50 text-green-700' : 'border-red-100 bg-red-50 text-red-600'
      }`}
    >
      {state.message}
    </div>
  )
}

function Field({
  id,
  text,
  ...props
}: { id: string; text: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={label}>
        {text}
      </label>
      <input id={id} className={input} {...props} />
    </div>
  )
}

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [state, action, pending] = useActionState(updateProfile, null)
  return (
    <form action={action} className="flex flex-col gap-6">
      <Status state={state} />
      <Field id="profile-name" text="Name" name="name" defaultValue={name} autoComplete="name" maxLength={NAME_MAX_LENGTH} required />
      <Field id="profile-phone" text="Phone (optional)" name="phone" type="tel" defaultValue={phone} autoComplete="tel" maxLength={PHONE_MAX_LENGTH} />
      <Button type="submit" variant="primary" disabled={pending} className="self-start">
        {pending ? 'Saving...' : 'Save details'}
      </Button>
    </form>
  )
}

export function PasswordForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(changePassword, null)
  const form = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state?.ok) form.current?.reset()
  }, [state])
  return (
    <form ref={form} action={action} className="flex flex-col gap-6">
      <Status state={state} />
      {/* Lets password managers pair the new password with the right account. */}
      <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
      <Field id="current-password" text="Current password" name="currentPassword" type="password" autoComplete="current-password" required />
      <Field
        id="new-password"
        text="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        maxLength={PASSWORD_MAX_LENGTH}
        aria-describedby="new-password-hint"
        required
      />
      <p id="new-password-hint" className="-mt-4 text-sm text-muted">
        At least {PASSWORD_MIN_LENGTH} characters.
      </p>
      <Field id="confirm-password" text="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" required />
      <Button type="submit" variant="primary" disabled={pending} className="self-start">
        {pending ? 'Saving...' : 'Change password'}
      </Button>
    </form>
  )
}
