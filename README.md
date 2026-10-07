# Aura Dynamics — Precision 3D Printing & Filament Store

[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-black?logo=next.js)](https://nextjs.org/)
[![Payload CMS](https://img.shields.io/badge/Payload_CMS-3.88.0-black?logo=payloadcms)](https://payloadcms.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-OpenNext_D1_R2-orange?logo=cloudflare)](https://developers.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

Aura Dynamics is a modern e-commerce storefront and store-management backend engineered for precision 3D printing and 3D printer filament distribution across Nepal. Built with Next.js 15+ (App Router) and Payload CMS 3.88.0, the platform is optimized for serverless edge deployment on Cloudflare (OpenNext, D1 SQLite, and R2 Object Storage).

---

## Table of Contents

- [Overview & Architecture](#overview--architecture)
- [Key Features](#key-features)
  - [1. Storefront Experience](#1-storefront-experience)
  - [2. Professional Admin & Store Management](#2-professional-admin--store-management)
  - [3. Product & Variant Catalog Model](#3-product--variant-catalog-model)
- [Project Directory Structure](#project-directory-structure)
- [Local Development Setup](#local-development-setup)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Code Generation & Import Maps](#code-generation--import-maps)
- [Testing & Quality Verification](#testing--quality-verification)
- [Operational Policies & Guidelines](#operational-policies--guidelines)
- [Deployment on Cloudflare](#deployment-on-cloudflare)

---

## Overview & Architecture

Aura Dynamics brings enterprise CMS capabilities to a lightweight, edge-native infrastructure stack:

```
┌────────────────────────────────────────────────────────┐
│               Aura Storefront (Next.js)                │
│  - Homepage, Filaments Catalog, 3D Prints, Checkout    │
│  - Real-time client filters & URL search param sync   │
│  - Server Component rendering with client hydration    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                Payload CMS 3.88.0 Backend              │
│  - Reorganized Admin UI: Catalog, Store, Content, System│
│  - E-commerce plugin with variant pricing & inventory  │
│  - Collapsible section editors & custom admin styles   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│         Cloudflare Serverless Infrastructure           │
│  - Runtime: Cloudflare Workers via OpenNext             │
│  - Database: Cloudflare D1 (SQLite engine)              │
│  - Storage: Cloudflare R2 (media uploads & assets)     │
│  - Local Dev: Miniflare proxy for D1/R2 emulation       │
└────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. Storefront Experience

- **Header & Footer CMS Integration:** Navigation links, branding, contact details, social links, and legal policies are driven directly by Payload CMS Globals (`Header` and `Footer`), with resilient static fallbacks.
- **Filaments Catalog (`/filaments`):**
  - Granular filtering by Material (PLA, PETG, ABS, ASA), Color Family, Spool vs. Refill packaging, Diameter (1.75 mm), and Brand (Numakers).
  - Price range filtering strictly in Nepalese Rupees (NPR).
  - Sorting by Price (asc/desc), Alphabetical, and Newest.
  - Fully responsive desktop sidebar and mobile filter drawer with instant count badges.
- **3D Prints Catalog (`/3d-prints`):**
  - Filterable by Category taxonomy, Print Material, Complexity, and Finish.
  - Pagination and responsive grid views.
- **Shared Catalog Architecture:** Centralized filter shells, pagination controls, and toolbars (`src/components/storefront/catalog/`) minimize code duplication.
- **Accessible & Performance-Minded:** Full keyboard accessibility, semantic markup, and optimized typography using Next.js fonts.

### 2. Professional Admin & Store Management

The Payload CMS Admin Panel (`/admin`) is organized into an intuitive operations interface:

- **Four Logical Workspace Groups:**
  - **Catalog:** Centralized management for Products, Product Variants, Variant Types, Variant Options, Categories, and Materials.
  - **Store:** Real-time customer records, orders, shopping carts, addresses, and transactions.
  - **Content:** Storefront editorial control over Media Library, Homepage, Header, and Footer globals.
  - **Settings:** Admin user accounts and global site SEO settings.
- **Single-Source Dashboard Navigation:** Leverages native Payload collection cards with direct `+` quick-create buttons, eliminating redundant navigation cards while keeping the sidebar fully functional.
- **Accurate Environment & Context Indicators:**
  - Dynamic runtime badges for `Environment: Development`, `Staging`, or `Production`.
  - Static configuration transparency (`Currency: NPR (Rs.)`).
  - Storage adapter indicator (`Storage: Local R2 Emulator` in development, `Storage: Cloudflare R2` in production).
- **Official Aura Branding:** Custom `Logo` and `Icon` admin components using the official Aura SVG assets with dark/light mode switching and pixel-perfect starburst icon alignment.
- **Collapsible Global Editor:** Homepage sections (Hero, Categories, Popular, Materials, Use Cases, Staff Pick, etc.) are wrapped in native collapsible accordions to allow focused editing without infinite vertical scrolling.
- **Human-Readable File Sizes:** Custom `FileSizeCell` converts raw byte counts in the Media collection list to readable units (`KB`, `MB`).

### 3. Product & Variant Catalog Model

- **Parent Products:** Define high-level attributes (title, slug, descriptions, images, filament details, brand).
- **Variant Pricing & Inventory:**
  - Products with variants (`enableVariants: true`) manage individual SKU, inventory, and NPR pricing at the variant level.
  - Base product `enablePriceInNPR` is reserved for single-SKU non-variant items.
- **Multi-Option Matrices:** Products support multi-dimensional variant options (e.g., Color [Black/White] combined with Packaging [Spool/Refill]).

---

## Project Directory Structure

```
D:\aura\
├── .agents/                    # Payload CMS specialized skills & developer reference
├── public/
│   └── brand/                  # Official Aura brand SVGs (symbol, wordmark, logo)
├── src/
│   ├── app/
│   │   ├── (frontend)/         # Storefront App Router routes
│   │   │   ├── 3d-prints/      # 3D Prints catalog page & filter controls
│   │   │   ├── filaments/      # Filaments catalog page & filter controls
│   │   │   ├── layout.tsx      # Root storefront layout (Header/Footer wiring)
│   │   │   └── page.tsx        # Homepage route
│   │   └── (payload)/          # Payload CMS Admin routes
│   │       ├── admin/          # Admin pages & generated importMap.js
│   │       └── custom.scss     # Scoped admin dashboard & branding stylesheet
│   ├── collections/            # Payload Collections
│   │   ├── Categories.ts       # Product taxonomies
│   │   ├── Customers.ts        # Customer profiles & auth
│   │   ├── Materials.ts        # Polymer specifications (PLA, PETG, etc.)
│   │   ├── Media.ts            # Uploads with custom FileSize cell & alt labels
│   │   └── Users.ts            # Staff accounts & permissions
│   ├── components/
│   │   ├── admin/              # Admin UI components (Logo, Icon, BeforeDashboard, FileSizeCell)
│   │   └── storefront/         # Storefront layout, navigation, and catalog filters
│   ├── globals/                # Payload CMS Globals
│   │   ├── Footer.ts           # Footer links, social profiles, copyright
│   │   ├── Header.ts           # Primary storefront navigation links
│   │   ├── Homepage.ts         # Section-by-section collapsible homepage content
│   │   └── SiteSettings.ts     # Global SEO & store metadata
│   ├── lib/                    # Shared query logic, filtering, and data models
│   │   ├── catalog/            # Shared catalog types & URL helpers
│   │   ├── filaments/          # Filament catalog queries & sort options
│   │   ├── prints/             # 3D Print catalog queries
│   │   └── site/               # Site globals fetching with fallbacks
│   └── payload.config.ts       # Core Payload configuration & ecommerce plugin overrides
├── tests/
│   ├── e2e/                    # Playwright end-to-end admin tests
│   └── int/                    # Vitest integration tests for catalog filters
├── wrangler.jsonc              # Cloudflare Workers, D1 & R2 configuration
└── package.json                # Project dependencies & scripts
```

---

## Local Development Setup

### Prerequisites

- **Node.js:** v20.x or v22.x LTS
- **Package Manager:** `pnpm` (v9 or v10 recommended)
- **Wrangler CLI:** Bundled via `pnpm wrangler`

### Environment Variables

Create a `.env` file in the project root:

```env
# Payload CMS Secret (min 32 characters)
PAYLOAD_SECRET=your-random-32-character-payload-secret

# Server Port & Logging
PORT=3000
PAYLOAD_LOG_LEVEL=info

# Cloudflare Configuration
CLOUDFLARE_ENV=development
```

### Running Locally

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the development server:**
   ```bash
   pnpm dev
   ```
   This automatically initializes:
   - Next.js development server at `http://localhost:3000`
   - Payload Admin Panel at `http://localhost:3000/admin`
   - Wrangler Miniflare proxy for local D1 SQLite and local R2 emulator (stored under `.wrangler/state/v3/`)

---

## Code Generation & Import Maps

When modifying Payload collections, globals, or custom admin components:

- **Generate Payload & Cloudflare Types:**
  ```bash
  pnpm run generate:types
  ```
- **Update Admin Import Map:**
  ```bash
  pnpm run generate:importmap
  ```
  *(Required whenever custom components like `Logo`, `Icon`, `BeforeDashboard`, or `FileSizeCell` are registered).*

---

## Testing & Quality Verification

### 1. TypeScript Compilation
Run the compiler check across the entire project:
```bash
pnpm exec tsc --noEmit
```

### 2. Catalog Filter Integration Tests
Run the Vitest filter test suites (14 tests covering filament and 3D print filter logic):
```bash
pnpm run test:int
```

### 3. Playwright Admin E2E Tests
Run the end-to-end admin validation suite (verifies login branding, mobile/desktop dashboards, product variant hydration, media sizes, and collapsible globals):
```bash
pnpm exec playwright test tests/e2e/admin-ux.e2e.spec.ts
```

> [!NOTE]
> **Known Lint Config Issue:** Running `pnpm run lint` currently encounters a circular dependency error in `@eslint/eslintrc` + `eslint-config-next` with ESLint 9. This is an upstream compatibility warning and does not affect runtime or build integrity.

---

## Operational Policies & Guidelines

1. **Strict NPR Currency Policy:** All product prices, cart totals, and shipping quotes are denominated exclusively in Nepalese Rupees (`NPR` / `Rs.`). Never introduce multi-currency conversions without approval.
2. **Product Imagery & Placeholders:**
   - Temporary or AI-generated product images are marked with `temporaryAsset: true` in the `Media` collection.
   - These are illustrative placeholders until real production batch photography, label verification, and color matching are finalized.
3. **Color-Specific Variant Images:**
   - In Payload's ecommerce plugin, media attachments exist at the parent `products` level. Individual `variants` inherit the parent product gallery.
   - Do not alter the schema without formal data migration planning.
4. **Database Safety:**
   - Do not run local or remote D1 migrations (`payload migrate`) or database seeds (`seed:test`) unless explicitly authorized.

---

## Deployment on Cloudflare

Deployments are executed via OpenNext for Cloudflare:

```bash
# 1. Build and verify
pnpm run build

# 2. Deploy database migrations (remote D1)
pnpm run deploy:database

# 3. Build and deploy worker bundle (remote Workers & R2)
pnpm run deploy:app
```

### Hosting accounts

- **Production** — runs on the **personal** Cloudflare account (`aura-production` D1, `aura-media` R2). The main `wrangler.jsonc` is permanently pinned to this account.
- **Temporary staging** — currently hosted on the **paid Seven Seas** Cloudflare account to avoid Free-plan Error 1102 CPU limits in Payload Admin. Config: `wrangler.sevenseas-staging.jsonc` (account `9fcb967b…`, Worker `aura-dynamics-staging`, D1 `aura-staging`, R2 `aura-media-staging`). Deploy with the explicit `default` auth profile:

  ```bash
  pnpm run staging:sevenseas:dry-run   # verify bindings
  pnpm run staging:sevenseas:deploy    # deploy staging only (never production)
  ```

  This staging environment is **temporary** and will be removed after Aura production launches.

### CMS content & rendering

Marketing content is Payload-driven: the **Homepage**, **Header**, **Footer**, **Site Settings** and **Page Content** globals own the storefront's headings, intros, imagery, navigation and SEO. The `(frontend)` route group renders dynamically (`export const dynamic = 'force-dynamic'`) so Admin edits appear on the next refresh without a redeploy. Product/catalogue data stays in the Products/Variants/Categories/Materials collections; functional UI microcopy (Add to cart, Sort, Filters, validation, etc.) stays in code.

> **Future production optimization:** replace the broad `force-dynamic` storefront rendering with targeted path/tag revalidation (Payload `afterChange` → `revalidatePath`/`revalidateTag`) once the OpenNext incremental cache (R2 cache bucket) is configured. Tracked as a follow-up; not required for staging.

Standalone Payload CLI/seed scripts can target an alternate Cloudflare environment by setting `WRANGLER_CONFIG_PATH` to a Wrangler config (e.g. `wrangler.sevenseas-staging.jsonc`); unset, local dev and the personal config behave exactly as before.

---

## License

This project is proprietary and confidential to **Aura Dynamics Pvt. Ltd.** All rights reserved.
