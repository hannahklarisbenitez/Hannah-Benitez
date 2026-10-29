export type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type UserRole = 'STAFF' | 'ADMIN';

export type ServiceCategory = 
  | 'all'
  | 'documents'
  | 'photos'
  | 'posters'
  | 'marketing'
  | 'custom'
  | 'architectural';

export interface PrintingService {
  id: string;
  code: string;
  name: string;
  category: ServiceCategory;
  categoryLabel: string;
  basePrice: number;
  unit: string;
  description: string;
  realisticImage: string;
  gallery: string[];
  turnaround: 'rush' | 'sameday' | 'nextday' | 'standard';
  turnaroundLabel: string;
  popular?: boolean;
  featured?: boolean;
  rating: number;
  reviewsCount: number;
  finishOptions: string[];
  paperOptions: string[];
  minOrder?: number;
  tags: string[];
}

export interface Order {
  id: string;
  queueNumber: string; // e.g. "Q-101"
  trackingCode: string; // e.g. "QP-2026-101"
  customerName: string;
  contactNumber: string;
  email?: string;
  serviceId: string;
  serviceName: string;
  paperSize: 'short' | 'a4' | 'long' | 'a3';
  paperType: 'regular70' | 'book80' | 'glossyPhoto' | 'matteCardstock' | 'stickerVinyl';
  printSide: 'single' | 'double';
  pageCount: number;
  copiesCount: number;
  binding: 'none' | 'staple' | 'ring' | 'soft' | 'hard' | 'laminate';
  specialInstructions?: string;
  fileName?: string;
  subtotal: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  cashierName?: string;
  estimatedWaitMinutes?: number;
}

export interface StaffUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  contact: string;
  email: string;
  active: boolean;
}

export interface PricingMatrix {
  paperSizeSurcharges: {
    short: number;
    a4: number;
    long: number;
    a3: number;
  };
  paperMaterialSurcharges: {
    regular70: number;
    book80: number;
    glossyPhoto: number;
    matteCardstock: number;
    stickerVinyl: number;
  };
  bindingFees: {
    none: number;
    staple: number;
    ring: number;
    soft: number;
    hard: number;
    laminate: number;
  };
  doubleSidedDiscountPerSheet: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  actor: string;
}
