import { getPayload } from 'payload'
import configPromise from '../payload.config'

export async function seedCatalogTest() {
  console.log('🌱 Starting Aura Catalog Test Seed...')
  const payload = await getPayload({ config: configPromise })

  // Upsert a product by slug, falling back to title so pre-slug records are migrated
  // in place instead of duplicated.
  const upsertProduct = async (data: any) => {
    for (const where of [
      { slug: { equals: data.slug } },
      { title: { equals: data.title } },
      { slug: { equals: 'numakers-pla-plus' } },
      { title: { equals: 'Numakers PLA+' } },
    ]) {
      const existing = await payload.find({
        collection: 'products',
        where,
        limit: 1,
        overrideAccess: true,
        pagination: false,
        depth: 0,
      })
      if (existing.docs?.length) {
        return payload.update({
          collection: 'products',
          id: existing.docs[0].id,
          data,
          overrideAccess: true,
        })
      }
    }
    return payload.create({ collection: 'products', data, overrideAccess: true })
  }

  // ----------------------------------------------------
  // 1. Materials
  // ----------------------------------------------------
  const materialsToSeed = [
    { name: 'PLA', slug: 'pla', baseFamily: 'pla' as const, active: true, sortOrder: 1 },
    { name: 'PETG', slug: 'petg', baseFamily: 'petg' as const, active: true, sortOrder: 2 },
    { name: 'ABS', slug: 'abs', baseFamily: 'abs' as const, active: true, sortOrder: 3 },
    { name: 'ASA', slug: 'asa', baseFamily: 'asa' as const, active: true, sortOrder: 4 },
  ]

  const materialDocs: Record<string, any> = {}

  for (const mat of materialsToSeed) {
    const existing = await payload.find({
      collection: 'materials',
      where: { slug: { equals: mat.slug } },
      limit: 1,
      draft: true,
      overrideAccess: true,
      pagination: false,
      depth: 0,
    })

    if (existing.docs && existing.docs.length > 0) {
      console.log(`Updating existing material: ${mat.slug} (ID: ${existing.docs[0].id})`)
      const updated = await payload.update({
        collection: 'materials',
        id: existing.docs[0].id,
        data: mat,
        overrideAccess: true,
      })
      materialDocs[mat.slug] = updated
    } else {
      console.log(`Creating new material: ${mat.slug}`)
      const created = await payload.create({
        collection: 'materials',
        data: mat,
        overrideAccess: true,
      })
      materialDocs[mat.slug] = created
    }
  }
  console.log('✓ Materials seeded/updated:', Object.keys(materialDocs))

  // ----------------------------------------------------
  // 2. Categories
  // ----------------------------------------------------
  const categoriesToSeed = [
    { name: 'Miniatures', slug: 'miniatures', active: true, sortOrder: 1 },
    { name: 'Figures', slug: 'figures', active: true, sortOrder: 2 },
    { name: 'Daily Use', slug: 'daily-use', active: true, sortOrder: 3 },
  ]

  const categoryDocs: Record<string, any> = {}

  for (const cat of categoriesToSeed) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
      draft: true,
      overrideAccess: true,
      pagination: false,
      depth: 0,
    })

    if (existing.docs && existing.docs.length > 0) {
      const updated = await payload.update({
        collection: 'categories',
        id: existing.docs[0].id,
        data: cat,
        overrideAccess: true,
      })
      categoryDocs[cat.slug] = updated
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: cat,
        overrideAccess: true,
      })
      categoryDocs[cat.slug] = created
    }
  }
  console.log('✓ Categories seeded/updated:', Object.keys(categoryDocs))

  // ----------------------------------------------------
  // 3. Variant Types
  // ----------------------------------------------------
  const variantTypesToSeed = [
    { name: 'Color', label: 'Color' },
    { name: 'Packaging', label: 'Packaging' },
    { name: 'Material', label: 'Material' },
  ]

  const variantTypeDocs: Record<string, any> = {}

  for (const vt of variantTypesToSeed) {
    const existing = await payload.find({
      collection: 'variantTypes',
      where: { name: { equals: vt.name } },
      limit: 1,
      draft: true,
      overrideAccess: true,
      pagination: false,
      depth: 0,
    })

    if (existing.docs && existing.docs.length > 0) {
      const updated = await payload.update({
        collection: 'variantTypes',
        id: existing.docs[0].id,
        data: vt,
        overrideAccess: true,
      })
      variantTypeDocs[vt.name] = updated
    } else {
      const created = await payload.create({
        collection: 'variantTypes',
        data: vt,
        overrideAccess: true,
      })
      variantTypeDocs[vt.name] = created
    }
  }
  console.log('✓ Variant Types seeded/updated:', Object.keys(variantTypeDocs))

  // ----------------------------------------------------
  // 4. Variant Options
  // ----------------------------------------------------
  const optionDocs: Record<string, any> = {}

  // Color Options
  const colorOptionsToSeed = [
    { label: 'Pure White', value: 'pure-white', colorFamily: 'white' as const, hexColor: '#FFFFFF' },
    { label: 'Pitch Black', value: 'pitch-black', colorFamily: 'black' as const, hexColor: '#111111' },
    { label: 'Forest Green', value: 'forest-green', colorFamily: 'green' as const, hexColor: '#2D6A4F' },
    { label: 'Nuclear Red', value: 'nuclear-red', colorFamily: 'red' as const, hexColor: '#E63946' },
    { label: 'Royal Blue', value: 'royal-blue', colorFamily: 'blue' as const, hexColor: '#2563EB' },
    { label: 'Lemon Yellow', value: 'lemon-yellow', colorFamily: 'yellow' as const, hexColor: '#FACC15' },
    { label: 'Transparent', value: 'transparent', colorFamily: 'transparent' as const, hexColor: '#E9EEF0' },
  ]

  for (const opt of colorOptionsToSeed) {
    const existing = await payload.find({
      collection: 'variantOptions',
      where: {
        and: [
          { variantType: { equals: variantTypeDocs['Color'].id } },
          { value: { equals: opt.value } },
        ],
      },
      limit: 1,
      draft: true,
      overrideAccess: true,
      pagination: false,
      depth: 0,
    })

    const optData = {
      ...opt,
      variantType: variantTypeDocs['Color'].id,
    }

    if (existing.docs && existing.docs.length > 0) {
      const updated = await payload.update({
        collection: 'variantOptions',
        id: existing.docs[0].id,
        data: optData,
        overrideAccess: true,
      })
      optionDocs[`Color_${opt.value}`] = updated
    } else {
      const created = await payload.create({
        collection: 'variantOptions',
        data: optData,
        overrideAccess: true,
      })
      optionDocs[`Color_${opt.value}`] = created
    }
  }

  // Packaging Options
  const packagingOptionsToSeed = [
    { label: 'Full Spool', value: 'full-spool' },
    { label: 'Refill', value: 'refill' },
  ]

  for (const opt of packagingOptionsToSeed) {
    const existing = await payload.find({
      collection: 'variantOptions',
      where: {
        and: [
          { variantType: { equals: variantTypeDocs['Packaging'].id } },
          { value: { equals: opt.value } },
        ],
      },
      limit: 1,
      draft: true,
      overrideAccess: true,
      pagination: false,
      depth: 0,
    })

    const optData = {
      ...opt,
      variantType: variantTypeDocs['Packaging'].id,
    }

    if (existing.docs && existing.docs.length > 0) {
      const updated = await payload.update({
        collection: 'variantOptions',
        id: existing.docs[0].id,
        data: optData,
        overrideAccess: true,
      })
      optionDocs[`Packaging_${opt.value}`] = updated
    } else {
      const created = await payload.create({
        collection: 'variantOptions',
        data: optData,
        overrideAccess: true,
      })
      optionDocs[`Packaging_${opt.value}`] = created
    }
  }

  // Material Options
  const materialOptionsToSeed = [
    { label: 'PLA', value: 'pla', materialSlug: 'pla' },
    { label: 'PETG', value: 'petg', materialSlug: 'petg' },
    { label: 'ABS', value: 'abs', materialSlug: 'abs' },
    { label: 'ASA', value: 'asa', materialSlug: 'asa' },
  ]

  for (const opt of materialOptionsToSeed) {
    const existing = await payload.find({
      collection: 'variantOptions',
      where: {
        and: [
          { variantType: { equals: variantTypeDocs['Material'].id } },
          { value: { equals: opt.value } },
        ],
      },
      limit: 1,
      draft: true,
      overrideAccess: true,
      pagination: false,
      depth: 0,
    })

    const optData = {
      label: opt.label,
      value: opt.value,
      variantType: variantTypeDocs['Material'].id,
      material: materialDocs[opt.materialSlug].id,
    }

    if (existing.docs && existing.docs.length > 0) {
      const updated = await payload.update({
        collection: 'variantOptions',
        id: existing.docs[0].id,
        data: optData,
        overrideAccess: true,
      })
      optionDocs[`Material_${opt.value}`] = updated
    } else {
      const created = await payload.create({
        collection: 'variantOptions',
        data: optData,
        overrideAccess: true,
      })
      optionDocs[`Material_${opt.value}`] = created
    }
  }
  console.log('✓ Variant Options seeded/updated:', Object.keys(optionDocs))

  // ----------------------------------------------------
  // 5. Real Filament Product: Numakers PLA
  // ----------------------------------------------------
  const filamentProductData = {
    title: 'Numakers PLA',
    slug: 'numakers-pla',
    shortDescription: '1 kg Numakers PLA filament (1.75 mm) for reliable everyday 3D printing.',
    productType: 'filament' as const,
    enableVariants: true,
    variantTypes: [variantTypeDocs['Color'].id],
    filamentDetails: {
      brand: 'Numakers' as const,
      material: materialDocs['pla'].id,
      finish: 'basic' as const,
      diameter: 1.75,
      netWeightKg: 1,
    },
    _status: 'published' as const,
  }

  const filamentProductDoc: any = await upsertProduct(filamentProductData)
  console.log('✓ Filament Product seeded/updated:', filamentProductDoc.title)

  // Seed Filament Variants (7 confirmed colors, 500 kg total stock)
  const filamentVariants = [
    {
      title: 'Numakers PLA — Pure White',
      sku: 'AURA-NUM-PLA-WHT',
      options: [optionDocs['Color_pure-white'].id],
      priceInNPREnabled: true,
      priceInNPR: 2500,
      inventory: 120,
      lowStockThreshold: 3,
      active: true,
    },
    {
      title: 'Numakers PLA — Pitch Black',
      sku: 'AURA-NUM-PLA-BLK',
      options: [optionDocs['Color_pitch-black'].id],
      priceInNPREnabled: true,
      priceInNPR: 2500,
      inventory: 160,
      lowStockThreshold: 3,
      active: true,
    },
    {
      title: 'Numakers PLA — Forest Green',
      sku: 'AURA-NUM-PLA-GRN',
      options: [optionDocs['Color_forest-green'].id],
      priceInNPREnabled: true,
      priceInNPR: 2500,
      inventory: 50,
      lowStockThreshold: 3,
      active: true,
    },
    {
      title: 'Numakers PLA — Nuclear Red',
      sku: 'AURA-NUM-PLA-RED',
      options: [optionDocs['Color_nuclear-red'].id],
      priceInNPREnabled: true,
      priceInNPR: 2500,
      inventory: 60,
      lowStockThreshold: 3,
      active: true,
    },
    {
      title: 'Numakers PLA — Royal Blue',
      sku: 'AURA-NUM-PLA-BLU',
      options: [optionDocs['Color_royal-blue'].id],
      priceInNPREnabled: true,
      priceInNPR: 2500,
      inventory: 60,
      lowStockThreshold: 3,
      active: true,
    },
    {
      title: 'Numakers PLA — Lemon Yellow',
      sku: 'AURA-NUM-PLA-YLW',
      options: [optionDocs['Color_lemon-yellow'].id],
      priceInNPREnabled: true,
      priceInNPR: 2500,
      inventory: 40,
      lowStockThreshold: 3,
      active: true,
    },
    {
      title: 'Numakers PLA — Transparent',
      sku: 'AURA-NUM-PLA-CLR',
      options: [optionDocs['Color_transparent'].id],
      priceInNPREnabled: true,
      priceInNPR: 2500,
      inventory: 10,
      lowStockThreshold: 3,
      active: true,
    },
  ]

  for (const v of filamentVariants) {
    const existingVar = await payload.find({
      collection: 'variants',
      where: {
        sku: { equals: v.sku },
      },
      limit: 1,
      overrideAccess: true,
      pagination: false,
      depth: 0,
    })

    const varData = {
      ...v,
      product: filamentProductDoc.id,
      _status: 'published' as const,
    }

    if (existingVar.docs && existingVar.docs.length > 0) {
      console.log(`Updating existing variant: ${v.title} (ID: ${existingVar.docs[0].id})`)
      await payload.update({
        collection: 'variants',
        id: existingVar.docs[0].id,
        data: varData,
        overrideAccess: true,
      })
    } else {
      console.log(`Creating new variant: ${v.title}`)
      await payload.create({
        collection: 'variants',
        data: varData,
        overrideAccess: true,
      })
    }
  }
  console.log('✓ Filament Variants seeded/updated')

  // ----------------------------------------------------
  // 6. Test 3D Print Product: Dragon Figure
  // ----------------------------------------------------
  const printProductData = {
    title: 'Dragon Figure',
    slug: 'dragon-figure',
    shortDescription: 'Ready-stock 3D-printed decorative dragon figure.',
    productType: '3d-print' as const,
    category: categoryDocs['figures'].id,
    enableVariants: true,
    variantTypes: [variantTypeDocs['Material'].id],
    _status: 'published' as const,
  }

  const printProductDoc: any = await upsertProduct(printProductData)
  console.log('✓ 3D Print Product seeded/updated:', printProductDoc.title)

  // Seed 3D Print Variants
  const printVariants = [
    {
      title: 'PLA',
      sku: 'AURA-TEST-DRAGON-PLA',
      options: [optionDocs['Material_pla'].id],
      priceInNPREnabled: true,
      priceInNPR: 800,
      inventory: 5,
      lowStockThreshold: 3,
      active: true,
    },
    {
      title: 'PETG',
      sku: 'AURA-TEST-DRAGON-PETG',
      options: [optionDocs['Material_petg'].id],
      priceInNPREnabled: true,
      priceInNPR: 950,
      inventory: 2,
      lowStockThreshold: 3,
      active: true,
    },
    {
      title: 'ABS',
      sku: 'AURA-TEST-DRAGON-ABS',
      options: [optionDocs['Material_abs'].id],
      priceInNPREnabled: true,
      priceInNPR: 1050,
      inventory: 0,
      lowStockThreshold: 3,
      active: true,
    },
  ]

  for (const v of printVariants) {
    const existingVar = await payload.find({
      collection: 'variants',
      where: {
        sku: { equals: v.sku },
      },
      limit: 1,
      overrideAccess: true,
      pagination: false,
      depth: 0,
    })

    const varData = {
      ...v,
      product: printProductDoc.id,
      _status: 'published' as const,
    }

    if (existingVar.docs && existingVar.docs.length > 0) {
      await payload.update({
        collection: 'variants',
        id: existingVar.docs[0].id,
        data: varData,
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'variants',
        data: varData,
        overrideAccess: true,
      })
    }
  }
  console.log('✓ 3D Print Variants seeded/updated')

  console.log('🎉 Aura Catalog Test Seed completed successfully!')
}


