import { describe, it, expect } from 'vitest'

import { normalizeCompare } from '@/lib/homepage/compare'

type Cms = Parameters<typeof normalizeCompare>[0]
const col = (label: string, bestFor = `${label} use`) => ({ label, bestFor })
const row = (label: string, scores: (number | null)[]) => ({ label, scores: scores.map((score) => ({ score })) })
const five = ['PLA', 'PLA+', 'PETG', 'TPU', 'ABS'].map((l) => col(l))

/** Score shown under each material heading, as the grid renders it (positional). */
const byMaterial = (vm: ReturnType<typeof normalizeCompare>, rowLabel: string) => {
  const r = vm.rows.find((x) => x.label === rowLabel)!
  return Object.fromEntries(vm.columns.map((c, i) => [c.label, r.scores[i]]))
}

describe('normalizeCompare', () => {
  it('renders five materials in order with one score each', () => {
    const vm = normalizeCompare({ heading: 'Compare.', columns: five, rows: [row('Strength', [3, 4, 4, 2, 5])] } as Cms)
    expect(vm.enabled).toBe(true)
    expect(vm.columns.map((c) => c.label)).toEqual(['PLA', 'PLA+', 'PETG', 'TPU', 'ABS'])
    expect(byMaterial(vm, 'Strength')).toEqual({ PLA: 3, 'PLA+': 4, PETG: 4, TPU: 2, ABS: 5 })
  })

  it('reordering columns together with scores keeps each score on its material', () => {
    const order = [4, 0, 2, 1, 3]
    const scores = [3, 4, 4, 2, 5]
    const vm = normalizeCompare({
      columns: order.map((i) => five[i]),
      rows: [row('Strength', order.map((i) => scores[i]))],
    } as Cms)
    expect(byMaterial(vm, 'Strength')).toEqual({ PLA: 3, 'PLA+': 4, PETG: 4, TPU: 2, ABS: 5 })
  })

  it('hides a row whose score count does not match the columns (e.g. 4 scores for 5 materials)', () => {
    const vm = normalizeCompare({ columns: five, rows: [row('Strength', [4, 4, 2, 5]), row('Flex', [1, 1, 3, 5, 2])] } as Cms)
    expect(vm.rows.map((r) => r.label)).toEqual(['Flex'])
    expect(vm.enabled).toBe(true)
  })

  it('hides rows with missing or out-of-range scores', () => {
    const vm = normalizeCompare({ columns: five, rows: [row('A', [3, null, 4, 2, 5]), row('B', [3, 4, 4, 2, 6]), row('C', [0, 4, 4, 2, 5])] } as Cms)
    expect(vm.rows).toEqual([])
    expect(vm.enabled).toBe(false)
  })

  it('fails closed on a blank column label, missing columns or disabled section', () => {
    expect(normalizeCompare({ columns: [col('PLA'), col(''), ...five.slice(2)], rows: [row('S', [1, 2, 3, 4, 5])] } as Cms).enabled).toBe(false)
    expect(normalizeCompare({ columns: [], rows: [row('S', [])] } as Cms).enabled).toBe(false)
    expect(normalizeCompare(undefined).enabled).toBe(false)
    expect(normalizeCompare({ enabled: false, columns: five, rows: [row('S', [1, 2, 3, 4, 5])] } as Cms).enabled).toBe(false)
  })

  it('still supports the previous four-material content', () => {
    const vm = normalizeCompare({ columns: five.slice(1), rows: [row('S', [4, 4, 2, 5])] } as Cms)
    expect(vm.enabled).toBe(true)
    expect(vm.columns).toHaveLength(4)
  })
})
