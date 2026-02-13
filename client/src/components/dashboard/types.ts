export type Tab = 'services' | 'profile' | 'payments' | 'documents' | 'messages' | 'notifications' | 'admin' | 'calendar' | 'tools' | 'consultations';

export interface ConsultationType {
  id: number;
  name: string;
  nameEs: string;
  nameEn: string;
  nameCa: string;
  description?: string | null;
  descriptionEs?: string | null;
  descriptionEn?: string | null;
  descriptionCa?: string | null;
  duration: number;
  price: number;
  isActive: boolean;
}

export interface ConsultationBooking {
  id: number;
  bookingCode: string;
  userId: string;
  consultationTypeId: number;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  hasLlc?: string | null;
  llcState?: string | null;
  estimatedRevenue?: string | null;
  countryOfResidence?: string | null;
  mainTopic?: string | null;
  additionalNotes?: string | null;
  adminNotes?: string | null;
  meetingLink?: string | null;
  createdAt: string;
}

export function getConsultationStatusLabel(status: string, t: (key: string) => string): { label: string; className: string } {
  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: t('consultations.status.pending'), className: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' },
    confirmed: { label: t('consultations.status.confirmed'), className: 'bg-accent/10 dark:bg-accent/20 text-accent dark:text-accent' },
    completed: { label: t('consultations.status.completed'), className: 'bg-accent/10 dark:bg-accent/20 text-accent dark:text-accent' },
    cancelled: { label: t('consultations.status.cancelled'), className: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400' },
    no_show: { label: t('consultations.status.noShow'), className: 'bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground' },
    rescheduled: { label: t('consultations.status.rescheduled'), className: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300' },
  };
  return statusMap[status] || { label: status, className: 'bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground' };
}

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
  identityVerificationStatus?: string | null;
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
  isSupport?: boolean;
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
    pending: { label: t('dashboard.orders.status.pending'), className: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700 rounded-full' },
    paid: { label: t('dashboard.orders.status.paid'), className: 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent border border-accent/50 dark:border-accent rounded-full' },
    processing: { label: t('dashboard.orders.status.processing'), className: 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent border border-accent/50 dark:border-accent rounded-full' },
    documents_ready: { label: t('dashboard.orders.status.documents_ready'), className: 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent border border-accent/50 dark:border-accent rounded-full' },
    completed: { label: t('dashboard.orders.status.completed'), className: 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent border border-accent dark:border-accent rounded-full' },
    cancelled: { label: t('dashboard.orders.status.cancelled'), className: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-full font-black' },
    filed: { label: t('dashboard.orders.status.filed'), className: 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent border border-accent/50 dark:border-accent rounded-full' },
    draft: { label: t('dashboard.orders.status.draft'), className: 'bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground border border-border dark:border-border rounded-full' },
  };
  return statusMap[status] || { label: status, className: 'bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground border border-border dark:border-border rounded-full' };
}
