import type { Homepage } from '@/payload-types'

const isScore = (s: unknown): s is number => Number.isInteger(s) && (s as number) >= 1 && (s as number) <= 5

/**
 * Homepage "Material Comparison" → view model. Scores are positional (one per
 * column, same order), so a row is shown only when it has exactly one valid
 * 1–5 score per column; anything else is dropped rather than shown against the
 * wrong material. No columns or no valid rows hides the section.
 */
export function normalizeCompare(cms: Homepage['compare']) {
  const columns = (cms?.columns ?? [])
    .map((c) => ({ bestFor: c.bestFor || '', label: c.label?.trim() || '' }))
    .filter((c) => c.label)
  const rows = (cms?.rows ?? [])
    .map((r) => ({ label: r.label || '', scores: (r.scores ?? []).map((s) => s.score) }))
    .filter((r): r is { label: string; scores: number[] } => r.scores.length === columns.length && r.scores.every(isScore))
  const columnCount = (cms?.columns ?? []).length
  return {
    columns,
    // A blank column label would shift every score one material left; fail closed.
    enabled: (cms?.enabled ?? true) && columns.length > 0 && columns.length === columnCount && rows.length > 0,
    heading: cms?.heading || '',
    rows,
  }
}
