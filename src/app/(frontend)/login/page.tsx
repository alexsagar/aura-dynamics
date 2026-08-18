'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/storefront/ui/Button'
import { useAuth } from '@/providers/AuthProvider'

const P_LOGIN_HERO = 'https://images.unsplash.com/photo-1612825173281-9a193378527e?q=80&w=1200&auto=format&fit=crop'
const P_REGISTER_HERO = 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=1200&auto=format&fit=crop'

export default function AuthPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  
  const [isLogin, setIsLogin] = useState(true)

  // Login State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoginLoading, setIsLoginLoading] = useState(false)

  // Register State
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regError, setRegError] = useState('')
  const [isRegLoading, setIsRegLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoginLoading(true)
    setLoginError('')

    try {
      const res = await fetch('/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json() as any
      if (res.ok && data.user) {
        setUser(data.user)
        router.push('/account')
        router.refresh()
      } else {
        setLoginError(data.message || 'Invalid email or password.')
      }
    } catch (err) {
      setLoginError('An error occurred. Please try again.')
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegLoading(true)
    setRegError('')

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword, name: regName }),
      })
      const data = await res.json() as any
      if (res.ok && data.doc) {
        const loginRes = await fetch('/api/customers/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: regEmail, password: regPassword }),
        })
        const loginData = await loginRes.json() as any
        if (loginRes.ok && loginData.user) {
          setUser(loginData.user)
          router.push('/account')
          router.refresh()
        }
      } else {
        setRegError(data.errors?.[0]?.message || 'Registration failed.')
      }
    } catch (err) {
      setRegError('An error occurred. Please try again.')
    } finally {
      setIsRegLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      
      {/* 
        Left Side (Register Form) 
        This is physically on the left. The sliding image covers it when in Login mode.
      */}
      <div className="absolute left-0 top-0 flex h-full w-full md:w-1/2 flex-col justify-center px-8 pt-32 pb-20 md:px-24">
        <div className={`mx-auto w-full max-w-md transition-opacity duration-700 ${!isLogin ? 'opacity-100 z-10 delay-300' : 'opacity-0 -z-10'}`}>
          <h1 className="mb-2 text-4xl font-medium tracking-[-0.02em]">Create Account.</h1>
          <p className="mb-10 text-lg text-muted">Join the Aura ecosystem.</p>

          <form onSubmit={handleRegister} className="flex flex-col gap-6">
            {regError && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">{regError}</div>}
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">Full Name</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="rounded-full border border-black/10 bg-white px-6 py-3 outline-none transition-colors focus:border-black"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="rounded-full border border-black/10 bg-white px-6 py-3 outline-none transition-colors focus:border-black"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">Password</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="rounded-full border border-black/10 bg-white px-6 py-3 outline-none transition-colors focus:border-black"
                required
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="mt-4" disabled={isRegLoading}>
              {isRegLoading ? 'Creating...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-12 text-center text-muted">
            Already have an account?{' '}
            <button onClick={() => setIsLogin(true)} type="button" className="font-semibold text-black hover:underline">
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* 
        Right Side (Login Form) 
        This is physically on the right. The sliding image covers it when in Register mode.
      */}
      <div className="absolute right-0 top-0 flex h-full w-full md:w-1/2 flex-col justify-center px-8 pt-32 pb-20 md:px-24">
        <div className={`mx-auto w-full max-w-md transition-opacity duration-700 ${isLogin ? 'opacity-100 z-10 delay-300' : 'opacity-0 -z-10'}`}>
          <h1 className="mb-2 text-4xl font-medium tracking-[-0.02em]">Welcome back.</h1>
          <p className="mb-10 text-lg text-muted">Sign in to manage your orders.</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {loginError && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">{loginError}</div>}
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="rounded-full border border-black/10 bg-white px-6 py-3 outline-none transition-colors focus:border-black"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="rounded-full border border-black/10 bg-white px-6 py-3 outline-none transition-colors focus:border-black"
                required
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="mt-4" disabled={isLoginLoading}>
              {isLoginLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-12 text-center text-muted">
            Don't have an account?{' '}
            <button onClick={() => setIsLogin(false)} type="button" className="font-semibold text-black hover:underline">
              Create one
            </button>
          </div>
        </div>
      </div>

      {/* 
        The Sliding Image Panel
        Starts on the Left (translate-x-0) when isLogin is TRUE.
        Moves to the Right (translate-x-full) when isLogin is FALSE.
      */}
      <div 
        className={`absolute top-0 left-0 hidden h-full w-1/2 bg-black transition-transform duration-1000 cubic-bezier(0.87,0,0.13,1) md:block z-20 ${
          isLogin ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)' }}
      >
        <div className="relative size-full overflow-hidden bg-black">
          {/* Login Hero (visible when on Left) */}
          <img
            src={P_LOGIN_HERO}
            alt="Aura Login"
            className={`absolute inset-0 size-full object-cover mix-blend-luminosity transition-opacity duration-1000 ${
              isLogin ? 'opacity-80' : 'opacity-0'
            }`}
          />
          {/* Register Hero (visible when on Right) */}
          <img
            src={P_REGISTER_HERO}
            alt="Aura Register"
            className={`absolute inset-0 size-full object-cover mix-blend-luminosity transition-opacity duration-1000 ${
              !isLogin ? 'opacity-80' : 'opacity-0'
            }`}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
          
          <div className="absolute bottom-16 left-16 right-16 text-white">
            <h2 className="text-4xl font-medium tracking-[-0.02em]">
              {isLogin ? 'Welcome back to Aura.' : 'Join the revolution.'}
            </h2>
            <p className="mt-2 text-lg text-white/70">
              {isLogin ? 'The premier 3D printing ecosystem in Nepal.' : 'Start your journey with industrial precision.'}
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
