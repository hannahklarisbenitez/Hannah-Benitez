import { PrintingService, Order, StaffUser, PricingMatrix, AuditLog } from '../types';
import stickersImage from '../assets/images/regenerated_image_1793250653885.jpg';
import luxuryCardsImage from '../assets/images/luxury_business_cards_1793251108308.jpg';
import posterImg1 from '../assets/images/regenerated_image_1793251516763.jpg';
import posterImg2 from '../assets/images/regenerated_image_1793251511693.jpg';
import thesisImage from '../assets/images/regenerated_image_1793252093574.jpg';
import photoPrintsImg1 from '../assets/images/regenerated_image_1793252450692.jpg';
import photoTilesImg1 from '../assets/images/regenerated_image_1793252786018.jpg';
import apparelMerchImg from '../assets/images/regenerated_image_1793253039005.jpg';
import invitationsImg from '../assets/images/custom_invitations_stationery_1793253248018.jpg';
import posterPrintShopImg from '../assets/images/vibrant_poster_printing_1793253270435.jpg';
import packagingImg from '../assets/images/regenerated_image_1793253419472.jpg';
import brochuresImg from '../assets/images/regenerated_image_1793253550970.jpg';
import blueprintsImg from '../assets/images/regenerated_image_1793253818954.jpg';
import rollupBannersImg from '../assets/images/regenerated_image_1793253911463.jpg';

export const INITIAL_SERVICES: PrintingService[] = [
  {
    id: 'srv-doc-thesis',
    code: 'DOC-01',
    name: 'Documents & Thesis Hardbound',
    category: 'documents',
    categoryLabel: 'Documents & Thesis',
    basePrice: 2.0,
    unit: 'per page',
    description: 'Crisp black & white or vibrant full-color laser printing on standard or premium paper. Options for official hardbound gold foil, soft bind, and spiral ring.',
    realisticImage: thesisImage,
    gallery: [
      thesisImage
    ],
    turnaround: 'rush',
    turnaroundLabel: '⚡ 1-2 Hours Rush',
    popular: true,
    featured: true,
    rating: 4.9,
    reviewsCount: 342,
    finishOptions: ['Corner Staple', 'Ring Bind (Coil)', 'Soft Bind (PVC)', 'Hardbound Gold Foil'],
    paperOptions: ['70gsm Copier', '80gsm Book Paper', '100gsm Premium Smooth'],
    tags: ['Academic', 'Thesis', 'Research', 'Handout', 'Fast Turnaround']
  },
  {
    id: 'srv-photo-prints',
    code: 'PHT-01',
    name: 'Lab-Grade Photo Prints',
    category: 'photos',
    categoryLabel: 'Photo & Framing',
    basePrice: 15.0,
    unit: 'per photo (4R)',
    description: 'Ultra-vibrant, smudge-resistant archival photographic prints. True RGB calibration, rich skin tones, and dynamic contrasts on 230gsm glossy or pearl satin paper.',
    realisticImage: photoPrintsImg1,
    gallery: [
      photoPrintsImg1
    ],
    turnaround: 'sameday',
    turnaroundLabel: 'Same Day Pickup',
    popular: true,
    rating: 4.95,
    reviewsCount: 218,
    finishOptions: ['High-Gloss Finish', 'Luster Satin', 'Matte Fine Art'],
    paperOptions: ['230gsm Resin-Coated', '260gsm Premium Metallic'],
    tags: ['Photography', 'Memories', 'Glossy', 'Wallet Size', '4R', '5R', '8R']
  },
  {
    id: 'srv-photo-tiles',
    code: 'TIL-01',
    name: 'Stick-On Canvas Photo Tiles',
    category: 'photos',
    categoryLabel: 'Photo & Framing',
    basePrice: 95.0,
    unit: 'per 8x8" tile',
    description: 'Damage-free wall photo tiles that stick, reposition, and restick cleanly. Wrapped canvas edges or minimalist clean beveled border.',
    realisticImage: photoTilesImg1,
    gallery: [
      photoTilesImg1
    ],
    turnaround: 'nextday',
    turnaroundLabel: 'Next Day (24 hrs)',
    featured: true,
    rating: 4.88,
    reviewsCount: 164,
    finishOptions: ['Matte Canvas Wrap', 'Floating Black Edge', 'Frameless Slim'],
    paperOptions: ['Archival Poly-Cotton Canvas on Featherlite Core'],
    tags: ['Home Decor', 'Wall Art', 'Gift Idea', 'No Nails Needed']
  },
  {
    id: 'srv-posters',
    code: 'POS-01',
    name: 'High-Impact Poster Printing',
    category: 'posters',
    categoryLabel: 'Posters & Banners',
    basePrice: 65.0,
    unit: 'per A3 sheet',
    description: 'Large-scale vibrant posters for school events, cinema releases, concerts, and scientific presentations. Fade-resistant pigment inks up to 300dpi.',
    realisticImage: posterPrintShopImg,
    gallery: [
      posterPrintShopImg
    ],
    turnaround: 'rush',
    turnaroundLabel: '⚡ Same-Day Rush',
    popular: true,
    rating: 4.85,
    reviewsCount: 195,
    finishOptions: ['UV Gloss Lamination', 'Matte Anti-Glare', 'Foamboard Mounting'],
    paperOptions: ['200gsm Heavy Silk', '230gsm Photo Gloss', 'Synthetic Waterproof PP'],
    tags: ['A3', 'A2', 'A1', 'Scientific Poster', 'Event', 'Promo']
  },
  {
    id: 'srv-stickers',
    code: 'STK-01',
    name: 'Die-Cut Vinyl Stickers & Labels',
    category: 'marketing',
    categoryLabel: 'Marketing & Business',
    basePrice: 45.0,
    unit: 'per A4 sheet (15-30 pcs)',
    description: 'Waterproof, scratch-resistant vinyl decals kiss-cut to your exact outline. Dishwasher-safe and UV-protected for laptops, bottles, and product packaging.',
    realisticImage: stickersImage,
    gallery: [
      stickersImage
    ],
    turnaround: 'rush',
    turnaroundLabel: '⚡ 2-Hour Express',
    popular: true,
    rating: 4.92,
    reviewsCount: 420,
    finishOptions: ['Glossy Laminate', 'Matte Velvet', 'Holographic Rainbow', 'Transparent Clear'],
    paperOptions: ['Waterproof White Vinyl', 'Kraft Paper', 'Chrome Foil'],
    tags: ['Die Cut', 'Branding', 'Waterproof', 'Product Labels', 'Merch']
  },
  {
    id: 'srv-business-cards',
    code: 'CRD-01',
    name: 'Luxury Business Cards',
    category: 'marketing',
    categoryLabel: 'Marketing & Business',
    basePrice: 180.0,
    unit: 'per box (100 pcs)',
    description: 'Create memorable first impressions. Printed on heavyweight 350gsm cardstock with optional gold foil stamping, spot UV gloss, and soft-touch velvet finish.',
    realisticImage: luxuryCardsImage,
    gallery: [
      luxuryCardsImage
    ],
    turnaround: 'nextday',
    turnaroundLabel: 'Next Day Pickup',
    popular: true,
    rating: 4.9,
    reviewsCount: 310,
    finishOptions: ['Soft-Touch Velvet', 'Gold / Rose Gold Foil', 'Spot Gloss UV', 'Rounded Corners'],
    paperOptions: ['350gsm Silk Coated', '300gsm Textured Linen', 'Heavy Black Cotton'],
    tags: ['Corporate', 'Networking', 'Professional', 'Foil Stamped']
  },
  {
    id: 'srv-invitations',
    code: 'INV-01',
    name: 'Custom Invitations & Stationery',
    category: 'custom',
    categoryLabel: 'Custom Gifts & Stationery',
    basePrice: 35.0,
    unit: 'per card + envelope set',
    description: 'Bespoke invitation suites for weddings, birthdays, graduations, and corporate galas. Elegant textured cardstock with matching envelopes and wax seal options.',
    realisticImage: invitationsImg,
    gallery: [
      invitationsImg
    ],
    turnaround: 'standard',
    turnaroundLabel: '2-3 Business Days',
    featured: true,
    rating: 4.96,
    reviewsCount: 145,
    finishOptions: ['Deckled Edge', 'Foil Letterpress', 'Vellum Wrap Overlay', 'Wax Seal'],
    paperOptions: ['300gsm Cotton Rag', 'Pearl Shimmer Card', 'FSC Recycled Kraft'],
    tags: ['Wedding', 'Debut', 'Celebration', 'Envelopes', 'Stationery']
  },
  {
    id: 'srv-blueprints',
    code: 'CAD-01',
    name: 'Architectural Blueprints & CAD',
    category: 'architectural',
    categoryLabel: 'Architectural & CAD',
    basePrice: 50.0,
    unit: 'per 20x30" sheet',
    description: 'Precision large-format plan plotting for engineers, architects, and building contractors. Crisp line weights and accurate scale reproduction.',
    realisticImage: blueprintsImg,
    gallery: [
      blueprintsImg
    ],
    turnaround: 'rush',
    turnaroundLabel: '⚡ 30-Minute Plotting',
    rating: 4.87,
    reviewsCount: 88,
    finishOptions: ['Standard Fold (A4 package)', 'Rolled in Tube', 'Plastic Acetate Cover'],
    paperOptions: ['80gsm Bond Copier', '110gsm Tracing Vellum', 'Blueprint Mylar'],
    tags: ['Engineering', 'Architecture', 'CAD', 'Schematic', 'Large Format']
  },
  {
    id: 'srv-packaging',
    code: 'PKG-01',
    name: 'Boutique Packaging & Custom Wrap',
    category: 'custom',
    categoryLabel: 'Custom Gifts & Stationery',
    basePrice: 25.0,
    unit: 'per sheet / box sleeve',
    description: 'Custom printed wrapping paper, branded mailer box sleeves, bakery paper, and shopping bag stickers for boutique retail and ecommerce businesses.',
    realisticImage: packagingImg,
    gallery: [
      packagingImg
    ],
    turnaround: 'nextday',
    turnaroundLabel: 'Next Day (24 hrs)',
    rating: 4.82,
    reviewsCount: 112,
    finishOptions: ['Food-Safe Wax Coat', 'Matte Kraft', 'Gloss Coated'],
    paperOptions: ['50gsm Translucent Tissue', '70gsm Recycled Kraft', '120gsm Coated Sleeve'],
    tags: ['Retail', 'Unboxing', 'Branding', 'Gift Wrap']
  },
  {
    id: 'srv-rollup-banners',
    code: 'BAN-01',
    name: 'Retractable Pull-Up Banners',
    category: 'posters',
    categoryLabel: 'Posters & Banners',
    basePrice: 850.0,
    unit: 'per complete stand (2.5x6ft)',
    description: 'Portable, lightweight roll-up banner stands with anodized aluminum casing and padded carry bag. Tear-proof, curl-free blockout vinyl graphic.',
    realisticImage: rollupBannersImg,
    gallery: [
      rollupBannersImg
    ],
    turnaround: 'nextday',
    turnaroundLabel: 'Next Day Available',
    rating: 4.91,
    reviewsCount: 76,
    finishOptions: ['Anti-Glare Matte', 'High-Gloss Vinyl', 'Heavy Duty Base'],
    paperOptions: ['440gsm Greyback Blockout Pet Vinyl (No Curl)'],
    tags: ['Exhibition', 'Trade Show', 'Storefront', 'Display Stand']
  },
  {
    id: 'srv-apparel-merch',
    code: 'MRC-01',
    name: 'Custom Merch & Canvas Bags',
    category: 'custom',
    categoryLabel: 'Custom Gifts & Stationery',
    basePrice: 120.0,
    unit: 'per tote bag',
    description: 'Direct-to-Film (DTF) high-definition full-color transfer prints on heavy organic cotton tote bags and printed canvas. Rich wash-resistant colors.',
    realisticImage: apparelMerchImg,
    gallery: [
      apparelMerchImg
    ],
    turnaround: 'standard',
    turnaroundLabel: '2-3 Business Days',
    rating: 4.89,
    reviewsCount: 153,
    finishOptions: ['Single-Sided Print', 'Double-Sided Print', 'Inner Pocket Custom Print'],
    paperOptions: ['12oz 100% Organic Cotton Canvas'],
    tags: ['Merch', 'Giveaway', 'Tote Bag', 'Eco-friendly', 'Screenprint']
  },
  {
    id: 'srv-brochures',
    code: 'BRC-01',
    name: 'Saddle-Stitched Product Catalogs',
    category: 'marketing',
    categoryLabel: 'Marketing & Business',
    basePrice: 40.0,
    unit: 'per 8-page booklet',
    description: 'Folded and stapled spine booklets, tri-fold brochures, and corporate portfolios. High-fidelity CMYK fidelity with vibrant photographic reproduction.',
    realisticImage: brochuresImg,
    gallery: [
      brochuresImg
    ],
    turnaround: 'nextday',
    turnaroundLabel: 'Next Day Pickup',
    rating: 4.86,
    reviewsCount: 94,
    finishOptions: ['Tri-fold', 'Bi-fold', 'Z-Fold', '8-16 Page Saddle Stitch'],
    paperOptions: ['150gsm Gloss Art Paper', '120gsm Matte Book Paper'],
    tags: ['Marketing', 'Flyer', 'Catalog', 'Restaurant Menu']
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    queueNumber: 'Q-101',
    trackingCode: 'QP-2026-101',
    customerName: 'Juan Dela Cruz',
    contactNumber: '0917-555-0192',
    email: 'juan.delacruz@gmail.com',
    serviceId: 'srv-doc-thesis',
    serviceName: 'Documents & Thesis Hardbound',
    paperSize: 'a4',
    paperType: 'book80',
    printSide: 'double',
    pageCount: 30,
    copiesCount: 2,
    binding: 'ring',
    specialInstructions: 'Thesis final draft, transparent front cover with blue back card.',
    fileName: 'DelaCruz_CS_Thesis_Final.pdf',
    subtotal: 115.0,
    totalAmount: 115.0,
    amountPaid: 115.0,
    paymentStatus: 'PAID',
    paymentMethod: 'GCash',
    orderStatus: 'READY',
    createdAt: '2026-10-26T08:15:00',
    updatedAt: '2026-10-26T08:42:00',
    cashierName: 'Maria Santos (Counter 1)',
    estimatedWaitMinutes: 0
  },
  {
    id: 'ord-102',
    queueNumber: 'Q-102',
    trackingCode: 'QP-2026-102',
    customerName: 'Beatriz Alonzo',
    contactNumber: '0928-555-4921',
    email: 'bea.alonzo@yahoo.com',
    serviceId: 'srv-stickers',
    serviceName: 'Die-Cut Vinyl Stickers & Labels',
    paperSize: 'a4',
    paperType: 'stickerVinyl',
    printSide: 'single',
    pageCount: 4,
    copiesCount: 3,
    binding: 'laminate',
    specialInstructions: 'Glossy laminate kiss-cut for coffee cup product branding.',
    fileName: 'Aroma_Cafe_Logo_Stickers.ai',
    subtotal: 260.0,
    totalAmount: 260.0,
    amountPaid: 260.0,
    paymentStatus: 'PAID',
    paymentMethod: 'Maya',
    orderStatus: 'PROCESSING',
    createdAt: '2026-10-26T08:30:00',
    updatedAt: '2026-10-26T08:45:00',
    cashierName: 'Maria Santos (Counter 1)',
    estimatedWaitMinutes: 5
  },
  {
    id: 'ord-103',
    queueNumber: 'Q-103',
    trackingCode: 'QP-2026-103',
    customerName: 'Mark Reyes',
    contactNumber: '0908-555-9988',
    email: 'mark.reyes@gmail.com',
    serviceId: 'srv-posters',
    serviceName: 'High-Impact Poster Printing',
    paperSize: 'a3',
    paperType: 'glossyPhoto',
    printSide: 'single',
    pageCount: 2,
    copiesCount: 2,
    binding: 'none',
    specialInstructions: 'High res color graduation greeting poster for student lobby.',
    fileName: 'Graduation_Poster_HighRes.png',
    subtotal: 160.0,
    totalAmount: 160.0,
    amountPaid: 80.0,
    paymentStatus: 'PARTIAL',
    paymentMethod: 'Cash',
    orderStatus: 'PENDING',
    createdAt: '2026-10-26T08:45:00',
    updatedAt: '2026-10-26T08:45:00',
    cashierName: 'Carlos D. (Counter 2)',
    estimatedWaitMinutes: 12
  },
  {
    id: 'ord-104',
    queueNumber: 'Q-104',
    trackingCode: 'QP-2026-104',
    customerName: 'Clarissa Fernandez',
    contactNumber: '0919-555-3211',
    email: 'claire.fernandez@gmail.com',
    serviceId: 'srv-photo-tiles',
    serviceName: 'Stick-On Canvas Photo Tiles',
    paperSize: 'short',
    paperType: 'matteCardstock',
    printSide: 'single',
    pageCount: 3,
    copiesCount: 1,
    binding: 'none',
    specialInstructions: 'Square family portraits 8x8 canvas mounted tiles.',
    fileName: 'Family_Portraits_Batch.zip',
    subtotal: 285.0,
    totalAmount: 285.0,
    amountPaid: 285.0,
    paymentStatus: 'PAID',
    paymentMethod: 'Credit Card',
    orderStatus: 'READY',
    createdAt: '2026-10-26T07:45:00',
    updatedAt: '2026-10-26T08:35:00',
    cashierName: 'Maria Santos (Counter 1)',
    estimatedWaitMinutes: 0
  },
  {
    id: 'ord-105',
    queueNumber: 'Q-105',
    trackingCode: 'QP-2026-105',
    customerName: 'Derrick Tan',
    contactNumber: '0932-555-7766',
    email: 'derrick.tan@outlook.com',
    serviceId: 'srv-blueprints',
    serviceName: 'Architectural Blueprints & CAD',
    paperSize: 'a3',
    paperType: 'regular70',
    printSide: 'single',
    pageCount: 6,
    copiesCount: 2,
    binding: 'staple',
    specialInstructions: 'Plumbing and electrical plans. Fold to A4 with title block outside.',
    fileName: 'Plumbing_Electrical_Plans_Rev2.pdf',
    subtotal: 180.0,
    totalAmount: 180.0,
    amountPaid: 0.0,
    paymentStatus: 'UNPAID',
    paymentMethod: 'Pending Counter Settlement',
    orderStatus: 'PENDING',
    createdAt: '2026-10-26T08:50:00',
    updatedAt: '2026-10-26T08:50:00',
    cashierName: 'Unassigned',
    estimatedWaitMinutes: 18
  }
];

export const INITIAL_PRICING: PricingMatrix = {
  paperSizeSurcharges: {
    short: 0.0,
    a4: 0.5,
    long: 1.0,
    a3: 8.0
  },
  paperMaterialSurcharges: {
    regular70: 0.0,
    book80: 1.0,
    glossyPhoto: 12.0,
    matteCardstock: 10.0,
    stickerVinyl: 15.0
  },
  bindingFees: {
    none: 0.0,
    staple: 0.0,
    ring: 55.0,
    soft: 75.0,
    hard: 350.0,
    laminate: 25.0
  },
  doubleSidedDiscountPerSheet: 0.25
};

export const INITIAL_STAFF: StaffUser[] = [
  {
    id: 'user-01',
    username: 'benitez',
    fullName: 'Hannah Benitez',
    role: 'ADMIN',
    contact: '0917-234-5678',
    email: 'hannah.benitez@quickprint.hub',
    active: true
  },
  {
    id: 'user-02',
    username: 'bonda',
    fullName: 'Adrian Bonda',
    role: 'STAFF',
    contact: '0918-345-6789',
    email: 'adrian.bonda@quickprint.hub',
    active: true
  },
  {
    id: 'user-03',
    username: 'cometa',
    fullName: 'Christian Cometa',
    role: 'STAFF',
    contact: '0919-456-7890',
    email: 'christian.cometa@quickprint.hub',
    active: true
  },
  {
    id: 'user-04',
    username: 'laserna',
    fullName: 'Shyla Laserna',
    role: 'STAFF',
    contact: '0920-567-8901',
    email: 'shyla.laserna@quickprint.hub',
    active: true
  },
  {
    id: 'user-05',
    username: 'porosa',
    fullName: 'Jane Irish Porosa',
    role: 'STAFF',
    contact: '0921-678-9012',
    email: 'jane.porosa@quickprint.hub',
    active: true
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-26 08:45:10',
    action: 'ORDER_SUBMITTED',
    details: 'Order Q-103 placed online by Mark Reyes (High-Impact Poster Printing)',
    actor: 'Customer Web Portal'
  },
  {
    id: 'log-2',
    timestamp: '2026-10-26 08:42:15',
    action: 'STATUS_ADVANCED',
    details: 'Order Q-101 advanced to READY for Pickup (Counter 1 alert triggered)',
    actor: 'Maria Santos (Staff)'
  },
  {
    id: 'log-3',
    timestamp: '2026-10-26 08:35:00',
    action: 'PAYMENT_RECEIVED',
    details: 'Payment of ₱285.00 settled via Credit Card for Order Q-104',
    actor: 'Maria Santos (Staff)'
  },
  {
    id: 'log-4',
    timestamp: '2026-10-26 08:15:20',
    action: 'SYSTEM_BOOT',
    details: 'QuickPrint Hub Production Server initialized. Ready Counter 1 & 2 online.',
    actor: 'System Daemon'
  }
];
