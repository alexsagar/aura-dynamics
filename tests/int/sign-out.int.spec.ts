import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'

const setUser = vi.fn()
vi.mock('@/providers/AuthProvider', () => ({ useAuth: () => ({ setUser }) }))

const { SignOutButton } = await import('@/app/(frontend)/account/SignOutButton')

const replace = vi.fn()
beforeEach(() => {
  setUser.mockClear()
  replace.mockClear()
  vi.stubGlobal('location', { ...window.location, replace })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('SignOutButton', () => {
  it('logs out, clears the client user and does a full navigation to /login (drops the router cache)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    render(React.createElement(SignOutButton))
    fireEvent.click(screen.getByRole('button', { name: 'Sign Out' }))
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'))
    expect(fetch).toHaveBeenCalledWith('/api/customers/logout', { method: 'POST' })
    expect(setUser).toHaveBeenCalledWith(null)
  })

  it('a failed logout keeps the user signed in and says so', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    render(React.createElement(SignOutButton))
    fireEvent.click(screen.getByRole('button', { name: 'Sign Out' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Sign out failed')
    expect(setUser).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
  })
})
