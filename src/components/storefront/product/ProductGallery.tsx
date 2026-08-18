'use client'

import React, { useState } from 'react'

type ProductGalleryProps = {
  images: { id: string; url: string; alt?: string }[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col-reverse gap-4 lg:flex-row">
        <div className="relative aspect-[4/5] w-full flex-1 overflow-hidden rounded-3xl bg-[#f4f4f4] flex items-center justify-center border border-black/5">
           <div className="flex flex-col items-center gap-2 text-muted">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto lg:w-24 lg:flex-col lg:overflow-visible">
          {images.map((image, idx) => (
            <button
              key={image.id || idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                activeIndex === idx ? 'border-black' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img
                src={image.url}
                alt={image.alt || `Thumbnail ${idx + 1}`}
                className="size-full object-cover mix-blend-multiply bg-black/5"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative aspect-[4/5] w-full flex-1 overflow-hidden rounded-3xl bg-[#f4f4f4]">
        <img
          src={images[activeIndex].url}
          alt={images[activeIndex].alt || 'Product Image'}
          className="size-full object-cover mix-blend-multiply"
        />
      </div>
    </div>
  )
}
