export type Tab = 'services' | 'profile' | 'payments' | 'documents' | 'messages' | 'notifications' | 'admin' | 'calendar' | 'tools';

export type AdminSubTab = 'dashboard' | 'orders' | 'incomplete' | 'users' | 'calendar' | 'docs' | 'newsletter' | 'inbox' | 'discounts';

export interface AdminUserData {
  id?: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
  streetType?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
  idNumber?: string | null;
  idType?: string | null;
  birthDate?: string | null;
  businessActivity?: string | null;
  isAdmin?: boolean;
  isActive?: boolean;
  accountStatus?: string;
  internalNotes?: string | null;
  createdAt?: string | null;
}

export interface DiscountCode {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  usedCount: number;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Order {
  id: number;
  status: string;
  createdAt?: string;
  invoiceNumber?: string;
  application?: {
    id: number;
    companyName?: string;
    state?: string;
    requestCode?: string;
    abandonedAt?: string;
  };
  maintenanceApplication?: {
    id: number;
    state?: string;
    requestCode?: string;
    abandonedAt?: string;
  };
  product?: {
    name?: string;
  };
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'action_required' | 'update' | 'info';
  isRead: boolean;
  orderCode?: string;
  createdAt: string;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  subject?: string;
  createdAt: string;
  isRead: boolean;
  replies?: MessageReply[];
}

export interface MessageReply {
  id: number;
  content: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Document {
  id: number;
  name: string;
  type: string;
  url: string;
  createdAt: string;
}

export interface ComplianceDeadline {
  id: number;
  type: string;
  dueDate: string;
  status: string;
  orderId: number;
  llcName?: string;
  state?: string;
}
