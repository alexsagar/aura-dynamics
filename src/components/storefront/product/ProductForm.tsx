'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/storefront/ui/Button'
import { useCart } from '@/providers/CartProvider'
import { StockStatus } from '@/components/storefront/commerce/StockStatus'
import { deriveStock } from '@/lib/catalog/shared'

export function ProductForm({
  product,
  selectedVariant: controlledSelectedVariant,
  onSelectVariant,
}: {
  product: any
  selectedVariant?: any
  onSelectVariant?: (variant: any) => void
}) {
  const { addItem } = useCart()
  const variants: any[] = Array.isArray(product.variants)
    ? product.variants
    : product.variants?.docs || []

  const [internalSelectedVariant, setInternalSelectedVariant] = useState<any>(
    variants[0] || null
  )

  const selectedVariant =
    controlledSelectedVariant !== undefined
      ? controlledSelectedVariant
      : internalSelectedVariant

  const stock = typeof selectedVariant?.inventory === 'number'
    ? selectedVariant.inventory
    : (typeof product?.inventory === 'number' ? product.inventory : 0)

  const lowStockThreshold = typeof selectedVariant?.lowStockThreshold === 'number'
    ? selectedVariant.lowStockThreshold
    : 3

  const stockInfo = deriveStock(stock, lowStockThreshold)
  const isOutOfStock = stock <= 0

  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  // Re-evaluate quantity whenever selected variant changes
  useEffect(() => {
    if (stock <= 0) {
      setQuantity(1)
    } else if (quantity > stock) {
      setQuantity(stock)
    } else if (quantity < 1) {
      setQuantity(1)
    }
  }, [selectedVariant, stock])

  const handleSelectVariant = (variant: any) => {
    if (onSelectVariant) {
      onSelectVariant(variant)
    } else {
      setInternalSelectedVariant(variant)
    }
    const varStock = typeof variant?.inventory === 'number' ? variant.inventory : (product.inventory ?? 0)
    if (varStock <= 0) {
      setQuantity(1)
    } else {
      setQuantity((prev) => Math.min(Math.max(1, prev), varStock))
    }
  }

  // Determine price based on selected variant or fallback to product base price
  const price =
    selectedVariant?.priceInNPR ??
    selectedVariant?.prices?.[0]?.amount ??
    product.priceInNPR ??
    product.prices?.[0]?.amount ??
    0

  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return
    setIsAdding(true)

    await addItem({
      product,
      variant: selectedVariant,
      quantity,
    })

    setTimeout(() => {
      setIsAdding(false)
    }, 400)
  }

  // Extract specs cleanly without inventing values
  const brand = product.filamentDetails?.brand || (product.brand ? String(product.brand) : null)
  const materialDoc = product.filamentDetails?.material
  const materialName =
    typeof materialDoc === 'object' && materialDoc?.name
      ? materialDoc.name
      : typeof materialDoc === 'string'
        ? materialDoc
        : null

  const diameter =
    product.filamentDetails?.diameter != null
      ? `${product.filamentDetails.diameter} mm`
      : null

  const netWeight =
    product.filamentDetails?.netWeightKg != null
      ? `${product.filamentDetails.netWeightKg} kg`
      : null

  return (
    <div className="flex flex-col gap-8">
      {/* Title & Price */}
      <div className="flex flex-col gap-3">
        <h1 className="text-[clamp(2.5rem,4vw,3.5rem)] font-medium leading-[1.1] tracking-[-0.02em]">
          {product.title}
        </h1>
        <div className="flex items-center gap-4">
          <p className="text-3xl font-medium tracking-[-0.02em] text-foreground">
            Rs. {price.toFixed(2)}
          </p>
          <StockStatus state={stockInfo.state} quantity={stockInfo.left} />
        </div>
      </div>

      {/* Short Summary near Product Title */}
      {product.shortDescription && (
        <div className="prose prose-lg text-muted">
          <p>{product.shortDescription}</p>
        </div>
      )}

      {/* Product Attributes (only displayed if real information exists in Payload) */}
      {(brand || materialName || diameter || netWeight) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl border border-black/10 bg-[#fbfbfb] p-4 text-xs">
          {brand && (
            <div>
              <span className="text-muted uppercase tracking-wider block font-medium">Brand</span>
              <span className="font-semibold text-foreground text-sm">{brand}</span>
            </div>
          )}
          {materialName && (
            <div>
              <span className="text-muted uppercase tracking-wider block font-medium">Material</span>
              <span className="font-semibold text-foreground text-sm">{materialName}</span>
            </div>
          )}
          {diameter && (
            <div>
              <span className="text-muted uppercase tracking-wider block font-medium">Diameter</span>
              <span className="font-semibold text-foreground text-sm">{diameter}</span>
            </div>
          )}
          {netWeight && (
            <div>
              <span className="text-muted uppercase tracking-wider block font-medium">Net Weight</span>
              <span className="font-semibold text-foreground text-sm">{netWeight}</span>
            </div>
          )}
        </div>
      )}

      {/* Variants (Color Selection) */}
      {variants.length > 0 && (
        <div className="flex flex-col gap-4">
          <span className="text-sm font-semibold tracking-[0.1em] text-muted uppercase">
            Select Color
          </span>
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Filament Color Options">
            {variants.map((variant: any, idx: number) => {
              const isSelected = selectedVariant?.id === variant.id
              const optionData = variant.options?.[0]
              const hex = optionData?.hexColor
              const label =
                optionData?.label ||
                variant.title ||
                optionData?.colorFamily ||
                `Variant ${idx + 1}`
              const slugKey = (optionData?.value || label)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')

              const varInventory = typeof variant.inventory === 'number' ? variant.inventory : 0
              const varIsOutOfStock = varInventory <= 0

              return (
                <button
                  key={variant.id || idx}
                  type="button"
                  onClick={() => handleSelectVariant(variant)}
                  aria-label={`Select ${label} color${varIsOutOfStock ? ' (Out of stock)' : ''}`}
                  aria-pressed={isSelected}
                  data-testid={`variant-color-${slugKey}`}
                  className={`flex items-center gap-3 rounded-full border px-4 py-2 transition-all ${
                    isSelected
                      ? 'border-black bg-black text-white'
                      : 'border-black/10 bg-white hover:border-black/30'
                  } ${varIsOutOfStock ? 'opacity-50' : ''}`}
                >
                  {hex && (
                    <span
                      className="size-4 rounded-full shadow-inner border border-black/10"
                      style={{ backgroundColor: hex }}
                    />
                  )}
                  <span className="text-sm font-medium">
                    {label}
                  </span>
                  {varIsOutOfStock && (
                    <span className="text-[10px] uppercase font-semibold text-muted">
                      Out of stock
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="mt-8 flex flex-col gap-4 border-t border-black/10 pt-8 sm:flex-row sm:items-center">
        <div className="flex h-14 items-center gap-4 rounded-full border border-black/10 bg-white px-6">
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            className="text-2xl text-muted transition-colors hover:text-black disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span
            className="min-w-[32px] text-center text-lg font-medium"
            data-testid="product-quantity-display"
          >
            {isOutOfStock ? 0 : quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.min(stock, prev + 1))}
            disabled={quantity >= stock || isOutOfStock}
            className="text-2xl text-muted transition-colors hover:text-black disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="h-14 flex-1 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          data-testid="add-to-cart-button"
        >
          {isOutOfStock ? 'Out of stock' : isAdding ? 'Adding...' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  )
}
