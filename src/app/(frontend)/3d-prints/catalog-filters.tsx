'use client'

import { useEffect, useState } from 'react'

import type { PrintFacets } from '@/lib/prints/catalog'
import {
  FilterCheck,
  FilterSection,
  FilterShell,
  toggleCsv,
  useCatalogFilters,
} from '@/components/storefront/catalog/filter-shell'

const CSV_KEYS = ['category', 'material']

function FilterForm({ facets }: { facets: PrintFacets }) {
  const { has, params, update } = useCatalogFilters(CSV_KEYS)
  const [min, setMin] = useState(params.get('min') ?? '')
  const [max, setMax] = useState(params.get('max') ?? '')

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
      {facets.categories.length > 0 && (
        <FilterSection title="Category">
          {facets.categories.map((c) => (
            <FilterCheck
              checked={has('category', c.value)}
              key={c.value}
              label={`${c.label} (${c.count})`}
              onChange={() => update((p) => toggleCsv(p, 'category', c.value))}
            />
          ))}
        </FilterSection>
      )}

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

export function CatalogFilters({ facets }: { facets: PrintFacets }) {
  const { activeCount } = useCatalogFilters(CSV_KEYS)
  return (
    <FilterShell activeCount={activeCount}>
      <FilterForm facets={facets} />
    </FilterShell>
  )
}
