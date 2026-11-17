import { getBranding } from '@/lib/site/get-branding'
import { AuthForm } from './AuthForm'

export default async function AuthPage() {
  const { loginImage, registerImage } = await getBranding()
  return <AuthForm loginImage={loginImage} registerImage={registerImage} />
}
