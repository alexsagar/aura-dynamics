import Link from 'next/link'
import React from 'react'

import { Container } from '@/components/storefront/layout/Container'
import { Button } from '@/components/storefront/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center bg-background pt-32 pb-24">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">404</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
            This page can’t be found.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            The page you’re looking for may have moved or no longer exists. Let’s get you back to
            something you can buy.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button as="a" href="/filaments" variant="primary" size="lg">
              Shop Filaments
            </Button>
            <Button as="a" href="/3d-prints" variant="tertiary" size="lg">
              Explore 3D Prints
            </Button>
            <Button as="a" href="/" variant="tertiary" size="lg">
              Back home
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}
