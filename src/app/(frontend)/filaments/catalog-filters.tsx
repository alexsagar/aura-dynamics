'use client'

import { useEffect, useState } from 'react'

import type { CatalogFacets } from '@/lib/filaments/catalog'
import {
  FilterCheck,
  FilterSection,
  FilterShell,
  toggleCsv,
  useCatalogFilters,
} from '@/components/storefront/catalog/filter-shell'
import { ColorSwatch } from '@/components/storefront/ui/ColorSwatch'

const CSV_KEYS = ['material', 'color', 'packaging', 'finish']

function FilterForm({ facets }: { facets: CatalogFacets }) {
  const { has, params, update } = useCatalogFilters(CSV_KEYS)
  const [min, setMin] = useState(params.get('min') ?? '')
  const [max, setMax] = useState(params.get('max') ?? '')

  // Keep the price inputs in sync when the URL changes elsewhere (e.g. Clear All).
  useEffect(() => setMin(params.get('min') ?? ''), [params])
  useEffect(() => setMax(params.get('max') ?? ''), [params])

  const commitPrice = () =>
    update((p) => {
      if (min) p.set('min', min)
      else p.delete('min')
      if (max) p.set('max', max)
      else p.delete('max')
    })

  return (
    <div>
      {facets.materials.length > 0 && (
        <FilterSection title="Material">
          {facets.materials.map((m) => (
            <FilterCheck
              checked={has('material', m.value)}
              key={m.value}
              label={`${m.label} (${m.count})`}
              onChange={() => update((p) => toggleCsv(p, 'material', m.value))}
            />
          ))}
        </FilterSection>
      )}

      {facets.colors.length > 0 && (
        <FilterSection title="Color">
          <div className="flex flex-wrap gap-x-4 gap-y-3">
            {facets.colors.map((c) => (
              <button
                aria-pressed={has('color', c.value)}
                className="flex items-center gap-2 text-sm"
                key={c.value}
                onClick={() => update((p) => toggleCsv(p, 'color', c.value))}
                type="button"
              >
                <ColorSwatch hex={c.hex} name={c.label} selected={has('color', c.value)} />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {facets.packaging.length > 0 && (
        <FilterSection title="Packaging">
          {facets.packaging.map((pk) => (
            <FilterCheck
              checked={has('packaging', pk.value)}
              key={pk.value}
              label={pk.label}
              onChange={() => update((p) => toggleCsv(p, 'packaging', pk.value))}
            />
          ))}
        </FilterSection>
      )}

      {facets.finishes.length > 1 && (
        <FilterSection title="Finish">
          {facets.finishes.map((fn) => (
            <FilterCheck
              checked={has('finish', fn.value)}
              key={fn.value}
              label={fn.label}
              onChange={() => update((p) => toggleCsv(p, 'finish', fn.value))}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title="Price (Rs.)">
        <div className="flex items-center gap-2">
          <input
            aria-label="Minimum price"
            className="w-full min-w-0 rounded-control border border-border bg-surface px-3 py-2 text-sm tabular-nums"
            inputMode="numeric"
            onBlur={commitPrice}
            onChange={(e) => setMin(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && commitPrice()}
            placeholder={String(facets.priceMin)}
            value={min}
          />
          <span className="text-muted">–</span>
          <input
            aria-label="Maximum price"
            className="w-full min-w-0 rounded-control border border-border bg-surface px-3 py-2 text-sm tabular-nums"
            inputMode="numeric"
            onBlur={commitPrice}
            onChange={(e) => setMax(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && commitPrice()}
            placeholder={String(facets.priceMax)}
            value={max}
          />
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <FilterCheck
          checked={params.get('availability') === 'in'}
          label="In stock only"
          onChange={() =>
            update((p) => (p.get('availability') === 'in' ? p.delete('availability') : p.set('availability', 'in')))
          }
        />
      </FilterSection>
    </div>
  )
}

export function CatalogFilters({ facets }: { facets: CatalogFacets }) {
  const { activeCount } = useCatalogFilters(CSV_KEYS)
  return (
    <FilterShell activeCount={activeCount}>
      <FilterForm facets={facets} />
    </FilterShell>
  )
}
