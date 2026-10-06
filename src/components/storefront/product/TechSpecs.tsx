'use client'

import React from 'react'
import { Container } from '@/components/storefront/layout/Container'

export function TechSpecs({ specs }: { specs: any }) {
  if (!specs || typeof specs !== 'object') return null

  const items: Array<{ label: string; value: string }> = []

  if (specs.nozzleTempMin != null || specs.nozzleTempMax != null) {
    const min = specs.nozzleTempMin
    const max = specs.nozzleTempMax
    const value = min != null && max != null ? `${min}°C - ${max}°C` : `${min ?? max}°C`
    items.push({ label: 'Nozzle Temperature', value })
  }

  if (specs.bedTempMin != null || specs.bedTempMax != null) {
    const min = specs.bedTempMin
    const max = specs.bedTempMax
    const value = min != null && max != null ? `${min}°C - ${max}°C` : `${min ?? max}°C`
    items.push({ label: 'Bed Temperature', value })
  }

  if (specs.printSpeedMin != null || specs.printSpeedMax != null) {
    const min = specs.printSpeedMin
    const max = specs.printSpeedMax
    const value = min != null && max != null ? `${min} - ${max} mm/s` : `${min ?? max} mm/s`
    items.push({ label: 'Print Speed', value })
  }

  if (specs.density != null) {
    items.push({ label: 'Density', value: `${specs.density} g/cm³` })
  }

  if (specs.enclosure && specs.enclosure !== 'not-required') {
    items.push({ label: 'Enclosure', value: String(specs.enclosure).replace('-', ' ') })
  }

  if (specs.hardenedNozzle && specs.hardenedNozzle !== 'not-required') {
    items.push({ label: 'Hardened Nozzle', value: String(specs.hardenedNozzle).replace('-', ' ') })
  }

  if (specs.amsCompatibility) {
    items.push({ label: 'AMS Compatibility', value: String(specs.amsCompatibility).replace('-', ' ') })
  }

  const drying = specs.drying
  const hasDrying = Boolean(drying?.recommended && (drying.temperature || drying.durationHours))

  // If no real specifications exist, cleanly hide the entire section
  if (items.length === 0 && !hasDrying) {
    return null
  }

  return (
    <div className="bg-white py-24 border-t border-black/10" data-testid="tech-specs-section">
      <Container>
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-medium tracking-[-0.02em] md:text-4xl">
            Technical Specifications
          </h2>

          <div className={`grid gap-12 ${hasDrying ? 'md:grid-cols-2' : 'md:max-w-2xl md:mx-auto'}`}>
            {items.length > 0 && (
              <div>
                <h3 className="mb-6 text-xl font-medium tracking-[-0.02em]">Print Settings</h3>
                <div className="flex flex-col border-t border-black/10">
                  {items.map((detail, idx) => (
                    <div key={idx} className="flex justify-between border-b border-black/10 py-4 text-sm">
                      <span className="text-muted">{detail.label}</span>
                      <span className="font-medium text-foreground capitalize">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasDrying && (
              <div>
                <h3 className="mb-6 text-xl font-medium tracking-[-0.02em]">Drying Recommendations</h3>
                <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-8">
                  <p className="mb-4 text-amber-900 text-sm">
                    Recommended drying parameters before printing for optimal results.
                  </p>
                  <div className="flex flex-col gap-4 text-sm">
                    {drying.temperature && (
                      <div className="flex justify-between border-b border-amber-200/50 pb-4">
                        <span className="text-amber-900/70">Drying Temperature</span>
                        <span className="font-semibold text-amber-950">{drying.temperature}°C</span>
                      </div>
                    )}
                    {drying.durationHours && (
                      <div className="flex justify-between">
                        <span className="text-amber-900/70">Duration</span>
                        <span className="font-semibold text-amber-950">{drying.durationHours} hours</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}
