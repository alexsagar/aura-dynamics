import React from 'react'

import type { FilamentCardProduct, PrintCardProduct } from '@/components/storefront/types'

import { Price } from '@/components/storefront/commerce/Price'
import { StockStatus } from '@/components/storefront/commerce/StockStatus'
import { Section } from '@/components/storefront/layout/Container'
import { FilamentCard } from '@/components/storefront/product/FilamentCard'
import { PrintCard } from '@/components/storefront/product/PrintCard'
import {
  Badge,
  FeaturedBadge,
  MaterialBadge,
  NewBadge,
  PackagingBadge,
  StockBadge,
} from '@/components/storefront/ui/Badge'
import { Button } from '@/components/storefront/ui/Button'
import { cn } from '@/components/storefront/ui/cn'
import { ColorSwatch, ColorSwatchGroup } from '@/components/storefront/ui/ColorSwatch'
import { BoxIcon, ChatIcon, SpoolIcon } from '@/components/storefront/ui/icons'
import { Logo } from '@/components/storefront/ui/Logo'
import { MaterialChipGroup } from '@/components/storefront/ui/MaterialChip'
import { MediaCard } from '@/components/storefront/ui/MediaCard'
import { PackagingSelector } from '@/components/storefront/ui/PackagingOption'
import { CategoryPill, ColorPill } from '@/components/storefront/ui/Pill'
import { ProductImage } from '@/components/storefront/ui/ProductImage'

/** TEMPORARY DEVELOPMENT ROUTE — not linked from public navigation. */
export const metadata = { robots: { index: false }, title: 'Design System — Aura (dev)' }

const H2 = 'text-h2 leading-[1.1] font-semibold tracking-[-0.02em] text-balance'
const H3 = 'text-h3 leading-[1.25] font-semibold tracking-[-0.02em] text-balance'
const SURFACE = 'rounded-card border border-border bg-surface p-6'
const ROW = 'flex flex-wrap items-center gap-3'
const PILLS = 'flex flex-wrap gap-2'

const COLORS = [
  { hex: '#1D2430', name: 'Black' },
  { hex: '#FFFFFF', name: 'White' },
  { hex: '#36AD60', name: 'Green' },
  { hex: '#C0392B', name: 'Red' },
  { hex: '#2D6CDF', name: 'Blue' },
  { available: false, hex: '#E8A33D', name: 'Orange' },
]

/** Stand-in for real filament inventory colours. */
const FILAMENT_COLORS = [
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

const TOKENS = [
  ['Background', '#F7F8F5'],
  ['Surface', '#FFFFFF'],
  ['Soft Green', '#ECF7F0'],
  ['Aura Green', '#36AD60'],
  ['CTA Green', '#1E8148'],
  ['Green (text)', '#1B7A43'],
  ['Deep Forest', '#123820'],
  ['Charcoal (text)', '#323845'],
  ['Muted', '#667085'],
  ['Border', '#E5E7EB'],
]

const filament: FilamentCardProduct = {
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

const print: PrintCardProduct = {
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

const Block = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div className="flex flex-col gap-4">
    <h2 className={H3}>{title}</h2>
    {children}
  </div>
)

const Benefit = ({
  body,
  icon,
  title,
}: {
  body: string
  icon: React.ReactNode
  title: string
}) => (
  <div className="flex max-w-[38ch] flex-col gap-3">
    <span className="mb-4 inline-flex size-14 items-center justify-center rounded-full border border-border bg-surface">
      {icon}
    </span>
    <h4 className="text-lg font-semibold">{title}</h4>
    <p className="text-sm text-muted">{body}</p>
  </div>
)

export default function DesignSystemPage() {
  return (
    <Section>
      <div className="flex flex-col gap-14">
        <div className="flex flex-col gap-3">
          <Badge tone="warning">Temporary development route</Badge>
          <h1 className="text-h1 leading-[1.1] font-semibold tracking-[-0.02em]">
            Aura Storefront Design System v1
          </h1>
          <p className="max-w-[60ch] text-lg text-muted">
            Component and token reference. Not linked from public navigation; remove before launch.
          </p>
        </div>

        <Block title="Editorial mosaic hero">
          {/* one large feature + two stacked cards, stacking on a phone */}
          <div className="grid gap-3 md:grid-cols-[2.1fr_1fr] md:grid-rows-2">
            <div className="md:row-span-2">
              <MediaCard
                align="top"
                cta={<Button>Shop Filaments</Button>}
                href="/filaments"
                imageAlt="Filament spools in a printing workspace"
                kicker="Numakers filaments"
                ratio="wide"
                size="lg"
                subtitle="Consistent spools and ready-stock prints, shipped across Nepal."
                title="Print what you imagine."
              />
            </div>
            <MediaCard
              align="top"
              href="/filaments"
              kicker="Filaments"
              ratio="landscape"
              size="sm"
              title="Build in Color"
            />
            <MediaCard
              align="top"
              href="/3d-prints"
              kicker="3D Prints"
              ratio="landscape"
              size="sm"
              title="Ready to Display"
            />
          </div>
        </Block>

        <Block title="Editorial category feature">
          {/* deliberately unequal: text column + two visual cards */}
          <div className="grid items-end gap-6 sm:grid-cols-2 lg:grid-cols-[0.85fr_1fr_1fr] lg:gap-8">
            <div className="flex max-w-[52ch] flex-col items-start gap-4 sm:col-span-2 lg:col-span-1 lg:max-w-[34ch] lg:pb-6">
              <h3 className={H2}>Made for makers.</h3>
              <p className="text-muted">
                Curated filament colors and finished prints kept in stock, so a project never waits
                on a restock.
              </p>
              <Button as="a" href="/collections" variant="tertiary">
                Explore Aura →
              </Button>
            </div>
            <MediaCard arrow href="/filaments" ratio="tall" size="sm" title="Filaments" />
            <MediaCard arrow href="/3d-prints" ratio="tall" size="sm" title="3D Prints" />
          </div>
        </Block>

        <Block title="Trending — mixed-width product row">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h3 className={H2}>Trending</h3>
            <div className={PILLS}>
              <CategoryPill active>All</CategoryPill>
              <CategoryPill>Filaments</CategoryPill>
              <CategoryPill>3D Prints</CategoryPill>
              <CategoryPill>PLA</CategoryPill>
              <CategoryPill>PETG</CategoryPill>
            </div>
          </div>
          {/* 6 tracks on desktop; two comfortable columns below md */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-6 md:grid-cols-6">
            <div className="md:col-span-2">
              <FilamentCard product={filament} />
            </div>
            <div className="md:col-span-2">
              <PrintCard product={{ ...print, title: 'Desk Organizer' }} />
            </div>
            <div className="md:col-span-2">
              <FilamentCard product={{ ...filament, price: 2500, title: 'Numakers PETG' }} />
            </div>
            <div className="col-span-2 md:col-span-3">
              <FilamentCard
                product={{ ...filament, featured: true, title: 'Numakers PLA+ Matte' }}
                ratio="feature"
              />
            </div>
            <div className="col-span-2 md:col-span-3">
              <PrintCard
                product={{ ...print, materials: ['PLA', 'PETG'], title: 'Articulated Dragon' }}
                ratio="landscape"
              />
            </div>
          </div>
        </Block>

        <Block title="Explore by Color">
          <div
            className={cn(
              'grid items-start gap-6 p-[clamp(20px,4vw,40px)] lg:grid-cols-[0.8fr_1.2fr] lg:gap-8',
              'rounded-card border border-border bg-surface',
            )}
          >
            <div>
              <h3 className={H2}>Explore by Color</h3>
              <p className="text-muted">
                Colors come from real filament inventory — nothing decorative.
              </p>
            </div>
            <div className={PILLS}>
              {FILAMENT_COLORS.map((c, i) => (
                <ColorPill active={i === 0} hex={c.hex} key={c.name} name={c.name} />
              ))}
            </div>
          </div>
        </Block>

        <Block title="Customer story">
          {/* photo + left scrim on desktop; solid panel under the photo on mobile */}
          <div className="relative flex flex-col overflow-hidden rounded-media bg-deep-forest text-white">
            <ProductImage
              alt="Maker workspace placeholder"
              className="w-full rounded-none [&>span]:hidden"
              ratio="wide"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden bg-linear-to-r from-deep-forest via-deep-forest/40 via-60% to-transparent lg:block"
            />
            <div className="z-1 flex flex-col items-start justify-center gap-4 bg-deep-forest p-6 sm:p-10 lg:absolute lg:inset-y-0 lg:left-0 lg:w-[min(55%,600px)] lg:bg-transparent lg:px-16 lg:py-12">
              <span className="text-micro font-medium tracking-[0.08em] text-white/80 uppercase">
                Placeholder — development only
              </span>
              <h3 className={H2}>Made it. Loved it.</h3>
              <p className="max-w-[32ch] text-h3 leading-[1.3] font-medium">
                Placeholder copy standing in for a real customer story. Nothing here is a genuine
                testimonial and none of it ships to production.
              </p>
              <p className="mt-2 font-medium">
                Placeholder Name
                <span className="mt-0.5 block text-sm font-normal text-white/75">
                  Placeholder role
                </span>
              </p>
            </div>
          </div>
        </Block>

        <Block title="Why shop Aura">
          <div className="mt-8 grid gap-8 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12 lg:pt-16">
            <Benefit
              body="Anything shown as available is in stock and ready to order."
              icon={<BoxIcon />}
              title="Ready Stock"
            />
            <Benefit
              body="Curated filament options suited to reliable, repeatable printing."
              icon={<SpoolIcon />}
              title="Quality Materials"
            />
            <Benefit
              body="Straightforward help choosing a material or a finished print."
              icon={<ChatIcon />}
              title="Helpful Support"
            />
          </div>
        </Block>

        <Block title="Editorial / material guide">
          <div className="grid items-center gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
            <ProductImage alt="Filament comparison placeholder" ratio="landscape" />
            <div className="flex max-w-[44ch] flex-col items-start gap-4">
              <span className="text-micro font-medium tracking-[0.02em] text-muted">Guide</span>
              <h3 className={H2}>PLA, PETG or ABS?</h3>
              <p className="text-muted">
                A simple guide to choosing the right material for your next print.
              </p>
              <Button as="a" href="/materials" variant="tertiary">
                Read Guide →
              </Button>
            </div>
          </div>
        </Block>

        <Block title="Logo">
          <div className={cn(SURFACE, ROW, 'gap-10')}>
            <Logo height={34} variant="full" />
            <Logo height={22} variant="wordmark" />
            <Logo height={34} variant="symbol" />
          </div>
          <div className={cn(ROW, 'gap-10 rounded-media bg-deep-forest p-6')}>
            <Logo height={34} variant="symbol" />
            <span className="text-sm text-deep-forest-foreground/70">
              On Deep Forest the symbol is used alone — the charcoal wordmark must not be recoloured.
            </span>
          </div>
        </Block>

        <Block title="Color">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-5">
            {TOKENS.map(([name, hex]) => (
              <div className="rounded-card border border-border bg-surface p-3" key={name}>
                <div className="h-14 rounded-lg border border-border" style={{ background: hex }} />
                <p className="mt-2.5 text-micro font-medium tracking-[0.02em]">{name}</p>
                <p className="text-micro font-medium tracking-[0.02em] text-muted">{hex}</p>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Typography">
          <p className="text-display leading-[1.1] font-semibold tracking-[-0.02em]">Display / hero</p>
          <p className="text-h1 leading-[1.1] font-semibold tracking-[-0.02em]">Heading 1</p>
          <p className={H2}>Heading 2</p>
          <p className={H3}>Heading 3</p>
          <p className="text-lg">Body large — 18px</p>
          <p>Body — 16px</p>
          <p className="text-sm text-muted">Small — 14px</p>
          <p className="text-micro font-medium tracking-[0.02em] text-muted">LABEL — 13px</p>
        </Block>

        <Block title="Buttons">
          <div className={ROW}>
            <Button>Add to cart</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">View all →</Button>
            <Button variant="destructive">Remove</Button>
          </div>
          <div className={ROW}>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>
        </Block>

        <Block title="Badges">
          <div className={ROW}>
            <StockBadge state="in" />
            <StockBadge state="low" />
            <StockBadge state="out" />
            <NewBadge />
            <FeaturedBadge />
            <MaterialBadge name="PLA+" />
            <PackagingBadge kind="full-spool" />
            <PackagingBadge kind="refill" />
          </div>
        </Block>

        <Block title="Price">
          <div className={cn(ROW, 'gap-8')}>
            <Price amount={2500} />
            <Price amount={2300} from />
            <Price amount={1900} compareAt={2300} />
          </div>
        </Block>

        <Block title="Stock states">
          <div className={cn(ROW, 'gap-8')}>
            <StockStatus state="in" />
            <StockStatus quantity={2} state="low" />
            <StockStatus state="out" />
          </div>
        </Block>

        <Block title="Filament color swatches">
          <ColorSwatchGroup colors={COLORS} interactive max={6} />
          <div className={ROW}>
            <ColorSwatch hex="#111827" interactive name="Black" selected size="lg" />
            <ColorSwatch hex="#FFFFFF" interactive name="White" size="lg" />
            <ColorSwatch disabled hex="#E8A33D" interactive name="Orange" size="lg" />
          </div>
        </Block>

        <Block title="Material chips">
          <MaterialChipGroup materials={['PLA', 'PLA+', 'PETG', 'ABS', 'ASA', 'TPU']} />
        </Block>

        <Block title="Packaging">
          <PackagingSelector options={['full-spool', 'refill']} selected="full-spool" />
        </Block>

        <Block title="Product cards">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            <FilamentCard product={filament} />
            <FilamentCard
              product={{ ...filament, fromPrice: false, price: 2500, stock: 'out', title: 'Numakers PETG' }}
            />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
            <PrintCard product={print} />
            <PrintCard
              product={{ ...print, isNew: false, materials: ['PLA'], stock: 'in', stockLeft: undefined, title: 'Desk Organizer' }}
            />
          </div>
        </Block>

        <Block title="Surfaces">
          <div className={SURFACE}>Card surface</div>
          <div className="rounded-card border border-[#d5e9dc] bg-surface-muted p-6">
            Soft green informational panel
          </div>
        </Block>
      </div>
    </Section>
  )
}
