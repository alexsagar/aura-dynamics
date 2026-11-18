'use client'

import { useState } from 'react'

type Box = { left: number; top: number; w: number; h: number }

/**
 * Partner logo (Branding → Partner logo) on a white chip in the black footer.
 * Uploads often carry wide plain margins (e.g. a 1200×628 social card), so on
 * load the image's own background margin is measured — pixels matching the
 * corner colour — and only that is cropped, by percentage, never the artwork.
 * The uploaded file is untouched; any replacement upload is measured afresh.
 * If measuring fails, the whole image is shown.
 */
function measure(img: HTMLImageElement): Box | null {
  const { naturalWidth: W, naturalHeight: H } = img
  if (!W || !H) return null
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(img, 0, 0)
  const d = ctx.getImageData(0, 0, W, H).data
  const [r0, g0, b0, a0] = [d[0], d[1], d[2], d[3]]
  let minX = W, minY = H, maxX = -1, maxY = -1
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      const diff = Math.abs(d[i] - r0) + Math.abs(d[i + 1] - g0) + Math.abs(d[i + 2] - b0) + Math.abs(d[i + 3] - a0)
      if (diff > 48) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) return null
  // Small safety margin so anti-aliased edges are never cut.
  const pad = Math.round(Math.max(W, H) * 0.01)
  const left = Math.max(0, minX - pad)
  const top = Math.max(0, minY - pad)
  return { left, top, w: Math.min(W, maxX + pad + 1) - left, h: Math.min(H, maxY + pad + 1) - top }
}

export function PartnerLogo({ image }: { image: { url: string; alt: string } }) {
  const [box, setBox] = useState<{ b: Box; W: number } | null>(null)

  const onLoad = (img: HTMLImageElement) => {
    try {
      const b = measure(img)
      if (b) setBox({ b, W: img.naturalWidth })
    } catch {
      // Cross-origin or decode failure: keep the uncropped image.
    }
  }

  return (
    <span className="block rounded-md bg-white px-3 py-2">
      {box ? (
        <span
          className="relative block h-11 max-w-[56vw] overflow-hidden md:h-13"
          style={{ aspectRatio: `${box.b.w} / ${box.b.h}` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- CMS logo, cropped to its measured artwork */}
          <img
            alt={image.alt}
            className="absolute max-w-none"
            src={image.url}
            style={{
              left: `${(-box.b.left / box.b.w) * 100}%`,
              top: `${(-box.b.top / box.b.h) * 100}%`,
              width: `${(box.W / box.b.w) * 100}%`,
            }}
          />
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- CMS logo, intrinsic aspect ratio unknown
        <img
          alt={image.alt}
          className="block h-11 w-auto max-w-[56vw] object-contain md:h-13"
          loading="lazy"
          onLoad={(e) => onLoad(e.currentTarget)}
          ref={(el) => {
            // Already loaded before hydration: onLoad will not fire.
            if (el?.complete && el.naturalWidth) onLoad(el)
          }}
          src={image.url}
        />
      )}
    </span>
  )
}
