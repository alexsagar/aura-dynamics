import React from 'react'

/**
 * Operational header component for Payload Admin Dashboard.
 * Displays accurate environment context, currency, storage adapter state,
 * and operational store policies without duplicating native collection navigation.
 */
export const BeforeDashboard: React.FC = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const envLabel = isProduction
    ? 'Production'
    : process.env.CLOUDFLARE_ENV === 'staging'
      ? 'Staging'
      : 'Development'
  const storageLabel = isProduction ? 'Cloudflare R2' : 'Local R2 Emulator'

  return (
    <div className="aura-dashboard-wrapper">
      <div className="aura-dashboard-header">
        <div className="aura-dashboard-header-text">
          <span className="aura-dashboard-eyebrow">Aura Dynamics</span>
          <h1 className="aura-dashboard-title">Store Management</h1>
          <p className="aura-dashboard-subtitle">
            Centralized store administration. Use the sections below or sidebar navigation to manage catalog items, customer orders, storefront editorial content, and system settings.
          </p>
        </div>
        <div className="aura-dashboard-badges">
          <span className={`aura-pill aura-pill-env aura-pill-${envLabel.toLowerCase()}`}>
            Environment: {envLabel}
          </span>
          <span className="aura-pill">Currency: NPR (Rs.)</span>
          <span className="aura-pill">Storage: {storageLabel}</span>
        </div>
      </div>

      {/* Operational Policies & Guidelines Notice */}
      <div className="aura-notice-box">
        <div className="aura-notice-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span className="aura-notice-title">Operational Policies & Guidelines</span>
        </div>
        <ul className="aura-notice-list">
          <li>
            <strong>Currency Policy:</strong> All catalog pricing is strictly denominated in Nepalese Rupees (NPR).
          </li>
          <li>
            <strong>Product Imagery:</strong> Temporary product photos are illustrative placeholders; replace with verified local stock photography before final production publishing.
          </li>
          <li>
            <strong>Color Variant Notice:</strong> Images attach to the parent Product document. Color-specific variants inherit the product gallery until variant image schemas are formally migrated.
          </li>
        </ul>
      </div>
    </div>
  )
}

export default BeforeDashboard
