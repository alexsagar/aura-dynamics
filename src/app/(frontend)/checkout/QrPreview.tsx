'use client'

import { useRef } from 'react'

/**
 * The store's static merchant QR (Site Settings → payment QR image), shown
 * whole at a scannable size. Tapping opens a native <dialog> (focus trap,
 * Escape and an inert page come from the platform) with the image as large as
 * the screen allows, plus links to the original file and to save it.
 */
export function QrPreview({ src }: { src: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const close = () => dialog.current?.close()

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="group block w-full max-w-[300px] cursor-zoom-in rounded-2xl border border-black/10 bg-white p-3 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        data-testid="qr-enlarge-button"
        onClick={() => dialog.current?.showModal()}
        ref={trigger}
        type="button"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS-managed QR, shown at its own aspect ratio */}
        <img alt="Fonepay merchant QR code" className="block h-auto w-full" data-testid="esewa-qr-image" src={src} />
        <span className="mt-2 block text-center text-xs font-medium text-muted group-hover:text-foreground">
          Tap to enlarge
        </span>
      </button>

      <dialog
        aria-label="Fonepay QR code"
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(100vw-2rem,560px)] overflow-auto rounded-2xl bg-white p-4 backdrop:bg-black/70 sm:p-6"
        data-testid="qr-dialog"
        // Backdrop clicks land on the <dialog> element itself, never on its content.
        onClick={(e) => e.target === e.currentTarget && close()}
        onClose={() => trigger.current?.focus()}
        ref={dialog}
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="font-semibold">Scan to pay</p>
          <button
            aria-label="Close QR preview"
            className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-black"
            onClick={close}
            type="button"
          >
            <svg aria-hidden fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- full-resolution CMS QR */}
        <img
          alt="Fonepay merchant QR code, enlarged"
          className="mx-auto block h-auto max-h-[calc(100dvh-12rem)] w-auto max-w-full object-contain"
          src={src}
        />
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium">
          <a className="underline underline-offset-4 hover:text-muted" href={src} rel="noopener" target="_blank">
            Open full-size image
          </a>
          <a className="underline underline-offset-4 hover:text-muted" download="aura-fonepay-qr" href={src}>
            Save QR image
          </a>
        </div>
      </dialog>
    </>
  )
}
