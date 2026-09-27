import React from 'react'

/**
 * Official Aura Icon component for Payload Admin (navigation sidebar).
 */
export const Icon: React.FC = () => {
  return (
    <div
      className="aura-admin-icon"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
      }}
    >
      <img
        alt="Aura"
        src="/brand/aura-symbol.svg"
        style={{
          width: '24px',
          height: '24px',
          display: 'block',
        }}
      />
    </div>
  )
}

export default Icon
