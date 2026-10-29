import { bold, heading, paragraph, richText } from './lexical'

/**
 * Initial Page Content backfill: the exact copy the storefront rendered from
 * code before CMS ownership. Seed-only — the runtime reads Payload, never this.
 * Image slots reference storefront-media manifest keys (resolved to Media ids
 * by the seed).
 */
export const pageContentFixture = {
  filaments: {
    heading: 'Filaments',
    intro: 'Explore our range of 3D printing filaments.',
    seoTitle: 'Filaments — Aura',
    seoDescription:
      'Browse Numakers 3D printing filaments — PLA, PETG and more, shipped across Nepal.',
  },
  prints: {
    heading: '3D Prints',
    intro: 'Explore our collection of ready-made 3D prints.',
    seoTitle: '3D Prints — Aura',
    seoDescription:
      'Browse Aura ready-made 3D prints — figures, miniatures and more, shipped across Nepal.',
  },
  collections: {
    eyebrow: 'Shop',
    heading: 'The Aura catalogue.',
    intro:
      'Everything we make, in one place — high-performance filaments and ready-stock 3D prints, all in stock and ready to ship across Nepal.',
    cards: [
      {
        title: 'Filaments',
        subtitle: 'Numakers spools for everyday 3D printing.',
        url: '/filaments',
        image: 'media:homepage-category-filaments',
      },
      {
        title: '3D Prints',
        subtitle: 'Ready-stock printed objects, shipped from Nepal.',
        url: '/3d-prints',
        image: 'media:homepage-category-3d-prints',
      },
    ],
    categoriesHeading: 'Browse 3D prints by category',
    seoTitle: 'Shop · Aura',
    seoDescription:
      'Browse the Aura catalogue — Numakers filaments and ready-stock 3D prints, shipped across Nepal.',
  },
  about: {
    headingLine1: 'We build',
    headingLine2: 'the builders.',
    intro:
      "Aura is the premier 3D printing ecosystem in Nepal. We don't just supply filament; we provide the foundation for innovation, rapid prototyping, and digital manufacturing.",
    heroImage: 'media:landing-filaments-hero',
    mission: {
      eyebrow: 'Our Mission',
      heading: 'Empowering the creators of tomorrow.',
      paragraphs: [
        {
          text: 'The 3D printing landscape in Nepal used to be fragmented. Makers relied on expensive imports, inconsistent filament quality, and weeks of shipping delays just to get basic materials. Prototyping was a luxury.',
        },
        {
          text: "We started Aura to fix that. By bringing Numakers' high-performance polymers directly to the local market and maintaining a massive ready-stock inventory, we eliminated the friction of creation.",
        },
      ],
      image: 'media:homepage-workshop-story',
      closing:
        'Today, Aura is the trusted supplier for architectural firms, engineering students, cosplay artists, and functional design studios across the country. If you can dream it, we provide the material to make it real.',
    },
    studio: {
      heading: 'The Studio.',
      subheading: 'Where digital models become physical reality.',
      imageLarge: 'media:homepage-category-3d-prints',
      imageTop: 'media:homepage-use-case-miniatures',
      imageBottom: 'media:homepage-category-filaments',
    },
    local: {
      heading: 'Designed & Printed in Nepal.',
      body: "We are proud to operate locally. By supporting Aura, you are supporting a local ecosystem of designers, engineers, and makers who are pushing the boundaries of what's possible in the Himalayas.",
    },
    contact: {
      heading: 'Get in touch.',
      body: "Whether you need a custom print quote, wholesale filament pricing, or just want to talk shop, we're here for you.",
      locationLabel: 'Studio Location',
      location: 'Kathmandu, Nepal',
      locationNote: '(Visits by appointment only)',
      contactLabel: 'Contact',
      email: 'hello@aura.com.np',
      phone: '+977 980-0000000',
      socialLabel: 'Social',
      socialLinks: [
        { label: 'Instagram', url: '' },
        { label: 'Facebook', url: '' },
        { label: 'TikTok', url: '' },
      ],
    },
    seoTitle: 'About — Aura',
    seoDescription:
      'Aura is the premier 3D printing ecosystem in Nepal — filament, ready-stock prints and the foundation for digital manufacturing.',
  },
  materials: {
    eyebrow: 'Technical Data',
    heading: 'The Library.',
    intro:
      'An index of high-performance polymers. Engineered to rigorous tolerances to ensure perfect bed adhesion, minimal warping, and predictable extrusion.',
    primaryCta: { label: 'Shop All Filaments', url: '' },
    secondaryCta: { label: 'Download Spec Sheets', url: '' },
    heroImage: 'media:homepage-category-filaments',
    matrix: {
      heading: 'Matrix.',
      subheading: 'Quick comparison chart.',
      rows: [
        { material: 'PLA+', strength: 4, flex: 1, heat: 2, ease: 5 },
        { material: 'PETG', strength: 4, flex: 3, heat: 3, ease: 4 },
        { material: 'TPU', strength: 2, flex: 5, heat: 2, ease: 2 },
        { material: 'ABS/ASA', strength: 5, flex: 2, heat: 5, ease: 1 },
      ],
    },
    deepDives: [
      {
        eyebrow: 'The Gold Standard',
        heading: 'Polylactic Acid Plus',
        body: 'Modified to be up to 10x tougher than standard PLA. Our PLA+ flows flawlessly, produces incredibly sharp details, and features an impact modifier that prevents snapping under stress. It is the perfect daily driver for 90% of prints.',
        points: [
          { text: 'No enclosure required' },
          { text: 'Biodegradable organic base' },
          { text: 'Exceptional layer adhesion' },
        ],
        cta: { label: 'Explore PLA+', url: '' },
        watermark: 'PLA+',
        image: 'media:homepage-workshop-story',
      },
      {
        eyebrow: 'The Engineering Workhorse',
        heading: 'Polyethylene Terephthalate Glycol',
        body: 'Bridging the gap between the ease of PLA and the raw strength of ABS. PETG is naturally water resistant, withstands high temperatures without softening, and flexes slightly before breaking. Ideal for mechanical assemblies and outdoor use.',
        points: [
          { text: 'High temperature resistance' },
          { text: 'Excellent impact strength' },
          { text: 'UV and weather resistant' },
        ],
        cta: { label: 'Explore PETG', url: '' },
        watermark: 'PETG',
        image: 'media:homepage-use-case-miniatures',
      },
    ],
    quality: {
      heading: 'Precision matters.',
      body: richText([
        paragraph(
          'Inconsistent filament diameter causes jams, weak layer bonds, and ruined hours of printing. We strictly monitor extrusion to a tolerance of ',
          bold('±0.03mm'),
          '. Every single spool is vacuum-sealed with desiccant immediately upon cooling to prevent moisture absorption.',
        ),
      ]),
      image: 'media:landing-materials-hero',
    },
    cta: {
      heading: 'Ready to get started?',
      body: 'Browse the Numakers range and pick the colour that fits your next project. Every spool in the catalogue is in stock and ready to ship across Nepal.',
      button: { label: 'Shop Filaments', url: '/filaments' },
      cardTitle: 'Explore the filament catalogue',
      cardUrl: '/filaments',
      image: 'media:homepage-hero',
    },
    seoTitle: 'Materials — Aura',
    seoDescription:
      'An index of high-performance 3D printing polymers — PLA, PETG, ABS and TPU — engineered to rigorous tolerances.',
  },
  privacy: {
    heading: 'Privacy Policy',
    intro:
      'Aura collects only the information needed to process and deliver your order. This notice explains what we collect, why, and how it is handled.',
    body: richText([
      heading('Information we collect', 'h2'),
      paragraph(
        'When you place an order as a guest, you provide your full name, phone number, email address, delivery address, and any optional note you add at checkout. If you pay by eSewa QR, you also provide the payment reference ID for that transfer.',
      ),
      heading('How we use your information', 'h2'),
      paragraph(
        'We use these details solely to process, fulfil, and deliver your order, to verify payment, and to contact you about that order. We do not create marketing profiles from checkout information.',
      ),
      heading('Payments', 'h2'),
      paragraph(
        'Payments are made by eSewa QR transfer or Cash on Delivery. Aura does not collect or store card numbers, and no card payments are processed on this site. For eSewa QR orders we record the reference ID you supply so your payment can be verified manually.',
      ),
      heading('Guest checkout', 'h2'),
      paragraph(
        'Aura uses guest checkout only. We do not maintain customer login accounts or store passwords.',
      ),
      heading('Sharing', 'h2'),
      paragraph(
        'We share your details only as needed to deliver your order, such as with a delivery provider. We do not sell your personal information.',
      ),
      heading('Retention', 'h2'),
      paragraph(
        'Order information is kept for as long as necessary to maintain accurate order and payment records.',
      ),
      heading('Contact', 'h2'),
      paragraph(
        'For any question about your order or this notice, contact us using the details provided on this website.',
      ),
    ]),
    seoTitle: 'Privacy Policy · Aura',
    seoDescription:
      'How Aura collects and uses the limited personal information you provide to place and receive an order.',
  },
  terms: {
    heading: 'Terms of Service',
    intro:
      'These terms apply when you browse Aura and place an order. By placing an order you agree to them.',
    body: richText([
      heading('Pricing', 'h2'),
      paragraph(
        'All prices are shown in Nepalese Rupees (NPR). We take care to price products accurately; if a pricing error is identified we will contact you before processing the affected order.',
      ),
      heading('Orders', 'h2'),
      paragraph(
        'Placing an order is an offer to buy. We confirm the sale when we accept and begin fulfilling your order. If an item is unavailable we may decline or cancel that order and will let you know.',
      ),
      heading('Payment', 'h2'),
      paragraph(
        'You can pay by eSewa QR transfer or Cash on Delivery. Orders paid by eSewa QR are prepared once we have verified the payment reference you provided. Cash on Delivery orders are paid in full when your order is delivered.',
      ),
      heading('Availability and stock', 'h2'),
      paragraph(
        'Stock levels shown are indicative. Where a purchased item becomes unavailable after your order, we will contact you to arrange an alternative or a cancellation.',
      ),
      heading('Delivery', 'h2'),
      paragraph('Orders are delivered within Nepal.'),
      heading('Acceptable use', 'h2'),
      paragraph('Products sold on Aura are intended for lawful use.'),
      heading('Governing law', 'h2'),
      paragraph('These terms are governed by the laws of Nepal.'),
      heading('Contact', 'h2'),
      paragraph('For questions about these terms, contact us using the details provided on this website.'),
    ]),
    seoTitle: 'Terms of Service · Aura',
    seoDescription:
      'The terms that apply when you browse Aura and place an order for filaments or 3D prints.',
  },
}

/** Homepage content that was still rendered from code (images + shade swatches). */
export const homepageFixture = {
  staffPick: { image: 'media:homepage-staff-pick' },
  shadeShowcase: {
    shades: [
      { name: 'Black', hex: '#111', image: 'media:homepage-staff-pick' },
      { name: 'White', hex: '#f9f9f9', image: 'media:homepage-use-case-cosplay' },
      { name: 'Red', hex: '#dc2626', image: 'media:homepage-category-filaments' },
      { name: 'Green', hex: '#16a34a', image: 'media:homepage-category-3d-prints' },
      { name: 'Blue', hex: '#2563eb', image: 'media:homepage-hero' },
      { name: 'Purple', hex: '#9333ea', image: 'media:homepage-workshop-story' },
      { name: 'Orange', hex: '#ea580c', image: 'media:homepage-use-case-miniatures' },
      { name: 'Yellow', hex: '#eab308', image: 'media:homepage-staff-pick' },
    ],
    availabilityNote: '40+ colors available',
  },
}
