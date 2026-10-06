'use client'

import React from 'react'

/**
 * Root error boundary. Must render its own <html>/<body> because it replaces
 * the root layout when a top-level error occurs. Kept deliberately minimal and
 * self-contained (no providers, context or external UI) so it renders reliably
 * even when the app shell itself failed.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          background: '#F7F8F5',
          color: '#323845',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#667085', lineHeight: 1.6, margin: '0 0 24px' }}>
            An unexpected error occurred. Please try again — if the problem continues, head back to
            the homepage.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => reset()}
              style={{
                background: '#1E8148',
                color: '#fff',
                border: 'none',
                borderRadius: 999,
                padding: '12px 24px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                background: 'transparent',
                color: '#323845',
                border: '1px solid #E5E7EB',
                borderRadius: 999,
                padding: '12px 24px',
                fontSize: '0.95rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Back home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
