export type Tab = 'services' | 'profile' | 'payments' | 'documents' | 'messages' | 'notifications' | 'admin' | 'calendar' | 'tools';

export interface User {
  id: string;
  clientId?: string | null;
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
  accountStatus?: 'active' | 'pending' | 'deactivated' | 'vip' | string;
  emailVerified?: boolean;
  googleId?: string | null;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  streetType: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  idNumber: string;
  idType: string;
  birthDate: string;
  businessActivity: string;
}

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
  orderId: string;
  userId: string;
  productType: string;
  state: string;
  status: string;
  totalAmount: number;
  paymentLink?: string | null;
  createdAt: string;
  companyName?: string | null;
  ownerFirstName?: string | null;
  ownerLastName?: string | null;
  ownerEmail?: string | null;
}

export interface Message {
  id: number;
  userId?: string | null;
  senderName: string;
  senderEmail: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  replies?: MessageReply[];
}

export interface MessageReply {
  id: number;
  messageId: number;
  content: string;
  isFromAdmin: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Document {
  id: number;
  orderId: number;
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
}

export function getOrderStatusLabel(status: string, t: (key: string) => string): { label: string; className: string } {
  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: t('dashboard.orders.status.pending'), className: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' },
    paid: { label: t('dashboard.orders.status.paid'), className: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' },
    processing: { label: t('dashboard.orders.status.processing'), className: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300' },
    documents_ready: { label: t('dashboard.orders.status.documents_ready'), className: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300' },
    completed: { label: t('dashboard.orders.status.completed'), className: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' },
    cancelled: { label: t('dashboard.orders.status.cancelled'), className: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 font-black' },
    filed: { label: t('dashboard.orders.status.filed'), className: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300' },
    draft: { label: t('dashboard.orders.status.draft'), className: 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300' },
  };
  return statusMap[status] || { label: status, className: 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300' };
}
