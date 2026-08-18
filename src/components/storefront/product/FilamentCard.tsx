import Link from 'next/link'

import type { FilamentCardProduct } from '../types'

import { Price } from '../commerce/Price'
import { StockStatus } from '../commerce/StockStatus'
import { NewBadge, PackagingBadge } from '../ui/Badge'
import { ColorSwatchGroup } from '../ui/ColorSwatch'
import { ProductImage } from '../ui/ProductImage'

export function FilamentCard({
  product,
  /** Wider ratios let a card act as the featured item in a mixed-width row. */
  ratio = 'square',
  /** Off by default — cards stay image-led with minimal text. */
  showPackaging = false,
}: {
  product: FilamentCardProduct
  ratio?: 'feature' | 'landscape' | 'portrait' | 'square'
  showPackaging?: boolean
}) {
  const { colors, fromPrice, href, imageUrl, isNew, material, packaging, price, stock, stockLeft, title, weight } =
    product

  return (
    <article className="group flex flex-col gap-3">
      <div className="relative">
        <Link aria-label={title} href={href} tabIndex={-1}>
          <ProductImage
            alt={title}
            className="rounded-card transition-opacity group-hover:opacity-92"
            ratio={ratio}
            src={imageUrl}
          />
        </Link>
        {isNew ? (
          <div className="absolute top-2 left-2 flex gap-1.5">
            <NewBadge />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-base leading-[1.35] font-semibold">
          <Link href={href}>{title}</Link>
        </h3>
        <p className="text-sm text-muted">{[material, weight].filter(Boolean).join(' · ')}</p>

        {colors.length ? <ColorSwatchGroup colors={colors} /> : null}

        {/* price sits directly under the title; stock reads as a quiet second line */}
        <div className="mt-0.5 flex flex-col items-start gap-1">
          <Price amount={price} from={fromPrice} />
          <StockStatus quantity={stockLeft} state={stock} />
        </div>

        {showPackaging && packaging?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {packaging.map((p) => (
              <PackagingBadge key={p} kind={p} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}
