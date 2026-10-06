'use client'

import React, { useState, useEffect } from 'react'

export type GalleryImage = {
  id?: string | number
  url: string
  alt?: string
}

type ProductGalleryProps = {
  images?: GalleryImage[]
  selectedImage?: GalleryImage | null
}

export function ProductGallery({ images = [], selectedImage }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [overrideImage, setOverrideImage] = useState<GalleryImage | null>(null)

  // When selectedImage changes from variant selection, synchronize gallery
  useEffect(() => {
    if (selectedImage && selectedImage.url) {
      const matchIdx = images.findIndex((img) => img.url === selectedImage.url)
      if (matchIdx !== -1) {
        setActiveIndex(matchIdx)
        setOverrideImage(null)
      } else {
        setOverrideImage(selectedImage)
      }
    } else {
      setOverrideImage(null)
    }
  }, [selectedImage, images])

  const displayedImage = overrideImage || images[activeIndex] || selectedImage

  if (!displayedImage || !displayedImage.url) {
    return (
      <div className="flex flex-col-reverse gap-4 lg:flex-row">
        <div
          className="relative aspect-[4/5] w-full flex-1 overflow-hidden rounded-3xl bg-[#f4f4f4] flex items-center justify-center border border-black/5"
          role="img"
          aria-label="No image available"
          data-testid="product-gallery-placeholder"
        >
          <div className="flex flex-col items-center gap-2 text-muted">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-sm tracking-[0.1em] uppercase">No Image</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row" data-testid="product-gallery">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          className="flex gap-4 overflow-x-auto lg:w-24 lg:flex-col lg:overflow-visible"
          role="region"
          aria-label="Product thumbnails"
        >
          {images.map((image, idx) => {
            const isThumbActive = !overrideImage && activeIndex === idx
            return (
              <button
                key={image.id || idx}
                type="button"
                onClick={() => {
                  setActiveIndex(idx)
                  setOverrideImage(null)
                }}
                aria-label={`View ${image.alt || `thumbnail ${idx + 1}`}`}
                aria-pressed={isThumbActive}
                className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  isThumbActive ? 'border-black' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img
                  src={image.url}
                  alt=""
                  aria-hidden="true"
                  className="size-full object-cover mix-blend-multiply bg-black/5"
                />
              </button>
            )
          })}
        </div>
      )}

      {/* Main Image */}
      <div className="relative aspect-[4/5] w-full flex-1 overflow-hidden rounded-3xl bg-[#f4f4f4]">
        <img
          src={displayedImage.url}
          alt={displayedImage.alt || 'Product Image'}
          data-testid="product-gallery-main-image"
          className="size-full object-cover mix-blend-multiply transition-opacity duration-200"
        />
      </div>
    </div>
  )
}
