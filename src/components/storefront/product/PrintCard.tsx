import Link from 'next/link'

import type { PrintCardProduct } from '../types'

import { Price } from '../commerce/Price'
import { StockStatus } from '../commerce/StockStatus'
import { NewBadge } from '../ui/Badge'
import { MaterialChipGroup } from '../ui/MaterialChip'
import { ProductImage } from '../ui/ProductImage'

export function PrintCard({
  product,
  /** Wider ratios let a card act as the featured item in a mixed-width row. */
  ratio = 'tall',
}: {
  product: PrintCardProduct
  ratio?: 'landscape' | 'portrait' | 'square' | 'tall'
}) {
  const { category, fromPrice, href, imageUrl, isNew, materials, price, stock, stockLeft, title } =
    product

  return (
    <article className="group flex flex-col gap-3">
      <div className="relative">
        <Link aria-label={title} href={href} tabIndex={-1}>
          <ProductImage
            alt={title}
            className="rounded-card transition-opacity group-hover:opacity-92"
            ratio={ratio}
            sizes="(max-width: 640px) 90vw, 380px"
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
        <p className="text-sm text-muted">{category}</p>
        <h3 className="text-lg leading-[1.35] font-semibold">
          <Link href={href}>{title}</Link>
        </h3>

        {materials.length ? <MaterialChipGroup materials={materials} /> : null}

        <div className="mt-0.5 flex flex-col items-start gap-1">
          <Price amount={price} from={fromPrice} />
          <StockStatus quantity={stockLeft} state={stock} />
        </div>
      </div>
    </article>
  )
}
