import type { Metadata } from 'next'
import { ResetPasswordForm } from './ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset password',
  robots: { index: false, follow: false },
  // Defence in depth: the token lives in the URL fragment, which is never sent as a referrer anyway.
  referrer: 'no-referrer',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
