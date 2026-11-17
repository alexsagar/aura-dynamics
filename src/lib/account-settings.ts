export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

/** Returns an error message, or null when the password is acceptable. */
export function passwordProblem(password: unknown): string | null {
  if (typeof password !== 'string') return 'Enter a password.'
  if (password.length < PASSWORD_MIN_LENGTH)
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`
  if (password.length > PASSWORD_MAX_LENGTH)
    return `Use at most ${PASSWORD_MAX_LENGTH} characters.`
  return null
}

export const NAME_MAX_LENGTH = 80
export const PHONE_MAX_LENGTH = 20
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]*$/

export type ProfileInput = { name: string; phone: string }

/** Trims and validates the editable profile fields. */
export function parseProfile(raw: { name?: unknown; phone?: unknown }):
  | { ok: true; data: ProfileInput }
  | { ok: false; error: string } {
  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  const phone = typeof raw.phone === 'string' ? raw.phone.trim() : ''
  if (!name) return { ok: false, error: 'Enter your name.' }
  if (name.length > NAME_MAX_LENGTH)
    return { ok: false, error: `Name must be ${NAME_MAX_LENGTH} characters or fewer.` }
  if (phone && (phone.length > PHONE_MAX_LENGTH || !PHONE_PATTERN.test(phone)))
    return { ok: false, error: 'Enter a valid phone number.' }
  return { ok: true, data: { name, phone } }
}
