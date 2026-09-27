import React from 'react'

/**
 * Official Aura Logo component for Payload Admin.
 * Supports light and dark mode automatically via Payload theme variables.
 */
export const Logo: React.FC = () => {
  return (
    <div className="aura-admin-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          flexShrink: 0,
        }}
      >
        {/* Official Aura Symbol — already cropped to 420x420 viewBox */}
        <img
          alt="Aura Symbol"
          src="/brand/aura-symbol.svg"
          style={{
            width: '28px',
            height: '28px',
            display: 'block',
          }}
        />
      </span>
      {/* Light mode wordmark */}
      <span
        className="aura-wordmark-light"
        style={{
          display: 'block',
          width: `${Math.round((18 / 0.135) * 0.495)}px`,
          height: '18px',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <img
          alt="Aura"
          src="/brand/aura-wordmark.svg"
          style={{
            width: `${18 / 0.135}px`,
            height: `${18 / 0.135}px`,
            marginLeft: `-${(18 / 0.135) * 0.245}px`,
            marginTop: `-${(18 / 0.135) * 0.4325}px`,
            maxWidth: 'none',
            display: 'block',
          }}
        />
      </span>
      {/* Dark mode wordmark */}
      <span
        className="aura-wordmark-dark"
        style={{
          display: 'none',
          width: `${Math.round((18 / 0.135) * 0.495)}px`,
          height: '18px',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <img
          alt="Aura"
          src="/brand/aura-wordmark-offwhite.svg"
          style={{
            width: `${18 / 0.135}px`,
            height: `${18 / 0.135}px`,
            marginLeft: `-${(18 / 0.135) * 0.245}px`,
            marginTop: `-${(18 / 0.135) * 0.4325}px`,
            maxWidth: 'none',
            display: 'block',
          }}
        />
      </span>
    </div>
  )
}

export default Logo
