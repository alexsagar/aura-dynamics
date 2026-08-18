'use client'

import React from 'react'
import { Container } from '@/components/storefront/layout/Container'

export function TechSpecs({ specs }: { specs: any }) {
  if (!specs) return null

  // Flatten the specs into an array for easy rendering
  const details = [
    { label: 'Nozzle Temperature', value: `${specs.nozzleTempMin || '-'}°C - ${specs.nozzleTempMax || '-'}°C` },
    { label: 'Bed Temperature', value: `${specs.bedTempMin || '-'}°C - ${specs.bedTempMax || '-'}°C` },
    { label: 'Print Speed', value: `${specs.printSpeedMin || '-'} - ${specs.printSpeedMax || '-'} mm/s` },
    { label: 'Density', value: specs.density ? `${specs.density} g/cm³` : '-' },
    { label: 'Enclosure', value: specs.enclosure?.replace('-', ' ') || 'Not Required' },
    { label: 'Hardened Nozzle', value: specs.hardenedNozzle?.replace('-', ' ') || 'Not Required' },
    { label: 'AMS Compatibility', value: specs.amsCompatibility?.replace('-', ' ') || 'Compatible' },
  ]

  const drying = specs.drying

  return (
    <div className="bg-white py-32">
      <Container>
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-16 text-center text-4xl font-medium tracking-[-0.02em]">
            Technical Specifications
          </h2>

          <div className={`grid gap-12 ${drying?.recommended ? 'md:grid-cols-2' : 'md:max-w-2xl md:mx-auto'}`}>
            <div>
              <h3 className="mb-6 text-xl font-medium tracking-[-0.02em]">Print Settings</h3>
              <div className="flex flex-col border-t border-black/10">
                {details.map((detail, idx) => (
                  <div key={idx} className="flex justify-between border-b border-black/10 py-4">
                    <span className="text-muted">{detail.label}</span>
                    <span className="font-medium text-black capitalize">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {drying && drying.recommended && (
              <div>
                <h3 className="mb-6 text-xl font-medium tracking-[-0.02em]">Drying Recommendations</h3>
                <div className="rounded-3xl border border-orange-200 bg-orange-50 p-8">
                  <p className="mb-4 text-orange-800">
                    This material is highly hygroscopic. We strongly recommend drying it before use for optimal print quality.
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between border-b border-orange-200/50 pb-4">
                      <span className="text-orange-900/60">Drying Temperature</span>
                      <span className="font-medium text-orange-900">{drying.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-900/60">Duration</span>
                      <span className="font-medium text-orange-900">{drying.durationHours} hours</span>
                    </div>
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
