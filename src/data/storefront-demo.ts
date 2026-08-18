import type { FilamentCardProduct, PrintCardProduct } from '@/components/storefront/types'

export const FILAMENT_COLORS = [
  { hex: '#1D2430', name: 'Black' },
  { hex: '#FFFFFF', name: 'White' },
  { hex: '#C0392B', name: 'Red' },
  { hex: '#36AD60', name: 'Green' },
  { hex: '#2D6CDF', name: 'Blue' },
  { hex: '#6E4AA8', name: 'Purple' },
  { hex: '#E8C33D', name: 'Yellow' },
  { hex: '#E8842D', name: 'Orange' },
  { hex: '#9AA0A8', name: 'Gray' },
  { hex: 'linear-gradient(135deg,#e9eef0,#c9d3d6)', name: 'Transparent' },
]

const COLORS = [
  { hex: '#1D2430', name: 'Black' },
  { hex: '#FFFFFF', name: 'White' },
  { hex: '#36AD60', name: 'Green' },
  { hex: '#C0392B', name: 'Red' },
  { hex: '#2D6CDF', name: 'Blue' },
  { available: false, hex: '#E8A33D', name: 'Orange' },
]

export const demoFilament: FilamentCardProduct = {
  colors: COLORS,
  fromPrice: true,
  href: '/filaments/numakers-pla-plus',
  material: 'PLA+',
  packaging: ['full-spool', 'refill'],
  price: 2300,
  stock: 'in',
  title: 'Numakers PLA+',
  weight: '1 KG',
}

export const demoPrint: PrintCardProduct = {
  category: 'Figures',
  fromPrice: true,
  href: '/3d-prints/dragon-figure',
  isNew: true,
  materials: ['PLA', 'PETG', 'ABS'],
  price: 800,
  stock: 'low',
  stockLeft: 2,
  title: 'Dragon Figure',
}
