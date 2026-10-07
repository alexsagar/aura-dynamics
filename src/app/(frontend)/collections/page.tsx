import Link from 'next/link'
import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import type { Category } from '@/payload-types'
import { Container } from '@/components/storefront/layout/Container'
import { absoluteUrl } from '@/lib/site/seo'
import { imageFallback } from '@/lib/homepage/fallback'
import { getPageContent } from '@/lib/site/get-page-content'

export async function generateMetadata(): Promise<Metadata> {
  const c = await getPageContent('collections')
  return {
    title: c.seoTitle,
    description: c.seoDescription,
    alternates: { canonical: absoluteUrl('/collections') },
  }
}

const SECTION_TITLE = 'text-mega leading-none font-semibold tracking-[-0.04em]'

type ShopCategory = { name: string; slug: string; count: number }

/**
 * Real 3D-print categories that actually have at least one published product,
 * so the page never advertises an empty or fabricated collection.
 */
async function getPrintCategories(): Promise<ShopCategory[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs: categories } = await payload.find({
      collection: 'categories',
      where: { active: { not_equals: false } },
      limit: 100,
      pagination: false,
      sort: 'sortOrder',
      depth: 0,
      overrideAccess: false,
    })

    const withCounts = await Promise.all(
      (categories as Category[]).map(async (cat) => {
        const { totalDocs } = await payload.find({
          collection: 'products',
          where: {
            and: [
              { productType: { equals: '3d-print' } },
              { _status: { equals: 'published' } },
              { category: { equals: cat.id } },
            ],
          },
          limit: 0,
          depth: 0,
          overrideAccess: false,
        })
        return { name: cat.name, slug: cat.slug, count: totalDocs }
      }),
    )
    return withCounts.filter((c) => c.count > 0)
  } catch (error) {
    console.error('Failed to load collection categories', error)
    return []
  }
}

export default async function CollectionsPage() {
  const [categories, content] = await Promise.all([getPrintCategories(), getPageContent('collections')])

  const primary = [
    {
      title: 'Filaments',
      subtitle: 'Numakers spools for everyday 3D printing.',
      href: '/filaments',
      image: imageFallback.categoryFilaments,
    },
    {
      title: '3D Prints',
      subtitle: 'Ready-stock printed objects, shipped from Nepal.',
      href: '/3d-prints',
      image: imageFallback.categoryPrints,
    },
  ]

  return (
    <>
      {/* Hero */}
      <section className="bg-[#f4f4f4] pt-[18vh] pb-[clamp(60px,8vw,120px)]">
        <Container>
          <div className="max-w-[640px]">
            <div className="mb-6 inline-flex items-center rounded-full border border-black/10 px-4 py-1.5 text-sm font-semibold tracking-[0.1em] text-black uppercase">
              Shop
            </div>
            <h1 className="mb-6 text-[clamp(3rem,6vw,6rem)] leading-[0.9] font-extrabold tracking-[-0.04em]">
              {content.heading}
            </h1>
            <p className="max-w-[460px] text-lg leading-[1.6] text-muted">
              {content.intro}
            </p>
          </div>
        </Container>
      </section>

      {/* Primary catalogues */}
      <section className="py-[clamp(48px,8vw,96px)]">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            {primary.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group relative aspect-[16/10] overflow-hidden rounded-[32px] bg-[#f4f4f4]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography, replaced via CMS */}
                <img
                  alt={c.title}
                  className="size-full object-cover opacity-90 transition-transform duration-1000 ease-editorial group-hover:scale-105"
                  src={c.image}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-10">
                  <h2 className="mb-1 text-3xl font-medium tracking-[-0.02em] md:text-4xl">{c.title}</h2>
                  <p className="text-white/70">{c.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Real 3D-print categories (only those with products) */}
      {categories.length ? (
        <section className="bg-background py-[clamp(48px,8vw,96px)]">
          <Container>
            <h2 className="mb-10 text-sm font-semibold tracking-[0.1em] text-muted uppercase">
              Browse 3D prints by category
            </h2>
            <div className="flex flex-col border-t border-black/10">
              {categories.map((cat, i) => (
                <Link
                  key={cat.slug}
                  href={`/3d-prints?category=${cat.slug}`}
                  className="group flex items-center justify-between gap-4 border-b border-black/10 py-7 transition-colors hover:px-4 hover:bg-black/2 md:py-9"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold tracking-[0.1em] text-muted">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-2xl font-medium tracking-[-0.02em] md:text-4xl">{cat.name}</h3>
                  </div>
                  <span className="rounded-full bg-[#f4f4f4] px-4 py-1 text-sm font-medium">
                    {cat.count} {cat.count === 1 ? 'item' : 'items'}
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  )
}
