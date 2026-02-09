import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

function getDirname(): string {
  try {
    if (typeof import.meta?.url !== 'undefined') {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {}
  return path.resolve();
}

const __dirname = getDirname();

const BRAND_GREEN = '#6EDC8A';
const BRAND_DARK = '#0A0A0A';
const BRAND_GRAY = '#6B7280';
const BRAND_LIGHT_GREEN = '#ECFDF5';
const BRAND_LIGHT_GRAY = '#F9FAFB';

export interface BankAccountInfo {
  label: string;
  holder: string;
  bankName: string;
  accountType: string;
  accountNumber?: string | null;
  routingNumber?: string | null;
  iban?: string | null;
  swift?: string | null;
  address?: string | null;
}

const DEFAULT_BANK_ACCOUNTS: BankAccountInfo[] = [
  {
    label: 'Thread Bank (Checking)',
    holder: 'Fortuny Consulting LLC',
    bankName: 'Thread Bank NA',
    accountType: 'checking',
    accountNumber: '200002330558',
    routingNumber: '064209588',
    swift: 'CLNOUS66MER',
    address: '1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110'
  },
  {
    label: 'Column N.A. (Checking)',
    holder: 'Fortuny Consulting LLC',
    bankName: 'Column N.A.',
    accountType: 'checking',
    accountNumber: '141432778929495',
    routingNumber: '121145433',
    address: '1 Letterman Drive, Building A, Suite A4-700, San Francisco, CA 94129'
  },
  {
    label: 'Cuenta Internacional (IBAN)',
    holder: 'Fortuny Consulting LLC',
    bankName: 'BANKING CIRCLE SA',
    accountType: 'iban',
    iban: 'DK2489000045271938',
    swift: 'SXPYDKKK',
  }
];

let cachedLogoPath: string | null = null;
let logoChecked = false;

function getLogoPath(): string | null {
  if (logoChecked) return cachedLogoPath;
  const possiblePaths = [
    path.join(process.cwd(), 'client/public/logo-icon.png'),
    path.join(process.cwd(), 'dist/public/logo-icon.png'),
    path.join(__dirname, '../../client/public/logo-icon.png'),
  ];
  for (const logoPath of possiblePaths) {
    if (fs.existsSync(logoPath)) {
      cachedLogoPath = logoPath;
      logoChecked = true;
      return logoPath;
    }
  }
  logoChecked = true;
  return null;
}

export interface CustomerData {
  name: string;
  email: string;
  phone?: string;
  idType?: string;
  idNumber?: string;
  address?: string;
  streetType?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  clientId?: string;
}

export interface InvoiceData {
  orderNumber: string;
  date: string;
  dueDate?: string;
  customer: CustomerData;
  items: Array<{
    description: string;
    details?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount?: {
    code?: string;
    type?: 'percentage' | 'fixed';
    value?: number;
    amount: number;
  };
  bankAccounts?: BankAccountInfo[];
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  paymentMethod?: 'transfer' | 'card' | 'stripe' | 'paypal' | 'link' | 'other';
  paymentDate?: string;
  paymentLink?: string;
  notes?: string;
  isMaintenance?: boolean;
  maintenanceApplication?: {
    requestCode?: string | null;
    companyName?: string | null;
    ein?: string | null;
    state?: string | null;
  } | null;
}

export interface CustomInvoiceData {
  invoiceNumber: string;
  date: string;
  customer: CustomerData;
  concept: string;
  description?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid';
  paymentMethod?: string;
  notes?: string;
  bankAccounts?: BankAccountInfo[];
}

function formatCurrency(cents: number, currency: string): string {
  const amount = (cents / 100).toFixed(2).replace('.', ',');
  return currency === 'EUR' ? `${amount} €` : `$${amount}`;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    'pending': 'PENDIENTE', 'paid': 'PAGADO', 'completed': 'COMPLETADO',
    'cancelled': 'CANCELADO', 'refunded': 'REEMBOLSADO'
  };
  return map[status] || status.toUpperCase();
}

function getPaymentMethodText(method?: string): string {
  if (!method) return 'No especificado';
  const map: Record<string, string> = {
    'transfer': 'Transferencia bancaria',
    'link': 'Enlace de pago'
  };
  return map[method] || 'Transferencia bancaria';
}

export function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: false,
        info: { Title: `Factura ${data.orderNumber}`, Author: 'Easy US LLC' }
      });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageW = 595;
      const left = 50;
      const right = pageW - 50;
      const contentW = right - left;
      const black = '#111111';
      const dark = '#1A1A1A';
      const mid = '#555555';
      const light = '#999999';
      const line = '#D4D4D4';
      const faint = '#F5F5F5';

      doc.rect(0, 0, 595, 842).fill('#FFFFFF');

      const logoPath = getLogoPath();
      if (logoPath) { try { doc.image(logoPath, left, 40, { width: 36, height: 36 }); } catch {} }

      doc.font('Helvetica-Bold').fontSize(16).fillColor(black).text('Easy US LLC', left + 44, 44);
      doc.font('Helvetica').fontSize(7.5).fillColor(light).text('Fortuny Consulting LLC', left + 44, 62);

      doc.font('Helvetica').fontSize(9).fillColor(mid).text(`No. ${data.orderNumber}`, left, 80, { align: 'right', width: contentW });

      doc.moveTo(left, 98).lineTo(right, 98).strokeColor(black).lineWidth(1.5).stroke();

      let y = 118;

      doc.font('Helvetica').fontSize(7).fillColor(light).text('FROM', left, y);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(black).text('Fortuny Consulting LLC', left, y + 12);
      doc.font('Helvetica').fontSize(8.5).fillColor(mid);
      doc.text('1209 Mountain Road Place NE, STE R', left, y + 26);
      doc.text('Albuquerque, NM 87110, USA', left, y + 38);
      doc.text('hola@easyusllc.com', left, y + 50);

      const cX = 320;
      doc.font('Helvetica').fontSize(7).fillColor(light).text('BILL TO', cX, y);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(black).text(data.customer.name, cX, y + 12);
      doc.font('Helvetica').fontSize(8.5).fillColor(mid);
      let cy = y + 26;
      if (data.customer.idType && data.customer.idNumber) {
        doc.text(`${data.customer.idType}: ${data.customer.idNumber}`, cX, cy); cy += 12;
      }
      doc.text(data.customer.email, cX, cy); cy += 12;
      if (data.customer.phone) { doc.text(data.customer.phone, cX, cy); cy += 12; }
      if (data.customer.address) {
        const addr = [data.customer.streetType, data.customer.address, data.customer.postalCode, data.customer.city, data.customer.country].filter(Boolean).join(', ');
        doc.fontSize(8).text(addr, cX, cy, { width: right - cX });
      }

      y += 80;
      doc.moveTo(left, y).lineTo(right, y).strokeColor(line).lineWidth(0.5).stroke();
      y += 15;

      const col2 = left + contentW * 0.33;
      const col3 = left + contentW * 0.56;
      const col4 = left + contentW * 0.78;
      doc.font('Helvetica').fontSize(7).fillColor(light);
      doc.text('ISSUE DATE', left, y);
      doc.text('DUE DATE', col2, y);
      doc.text('STATUS', col3, y);
      doc.text('CURRENCY', col4, y);
      y += 11;
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(black);
      doc.text(formatDate(data.date), left, y);
      doc.text(data.dueDate ? formatDate(data.dueDate) : formatDate(data.date), col2, y);
      const statusColors: Record<string, string> = { pending: '#D97706', paid: '#059669', cancelled: '#DC2626', refunded: '#7C3AED' };
      doc.fillColor(statusColors[data.status] || '#059669').text(getStatusText(data.status), col3, y);
      doc.fillColor(black).text(data.currency, col4, y);

      y += 22;
      doc.moveTo(left, y).lineTo(right, y).strokeColor(line).lineWidth(0.5).stroke();
      y += 20;

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(light);
      doc.text('DESCRIPTION', left, y);
      doc.text('QTY', left + contentW * 0.62, y, { width: 40 });
      doc.text('UNIT PRICE', left + contentW * 0.72, y, { width: 60 });
      doc.text('AMOUNT', right - 60, y, { width: 60, align: 'right' });
      y += 14;
      doc.moveTo(left, y).lineTo(right, y).strokeColor(black).lineWidth(0.8).stroke();
      y += 8;

      for (const item of data.items) {
        doc.font('Helvetica-Bold').fontSize(9.5).fillColor(dark).text(item.description, left, y, { width: contentW * 0.58 });
        const descH = doc.heightOfString(item.description, { width: contentW * 0.58 });
        if (item.details) {
          doc.font('Helvetica').fontSize(8).fillColor(light).text(item.details, left, y + descH + 2, { width: contentW * 0.58 });
        }
        doc.font('Helvetica').fontSize(9.5).fillColor(dark);
        const rowMid = y + 1;
        doc.text(item.quantity.toString(), left + contentW * 0.62, rowMid, { width: 40 });
        doc.text(formatCurrency(item.unitPrice, data.currency), left + contentW * 0.72, rowMid, { width: 60 });
        doc.font('Helvetica-Bold').text(formatCurrency(item.total, data.currency), right - 60, rowMid, { width: 60, align: 'right' });

        const rowH = item.details ? descH + 18 : Math.max(descH + 8, 22);
        y += rowH;
        doc.moveTo(left, y).lineTo(right, y).strokeColor(faint).lineWidth(0.5).stroke();
        y += 6;
      }

      y += 12;
      const totalLeft = left + contentW * 0.55;
      const totalValW = right - totalLeft - 5;

      doc.font('Helvetica').fontSize(9).fillColor(mid).text('Subtotal', totalLeft, y);
      doc.font('Helvetica').fontSize(9).fillColor(dark).text(formatCurrency(data.subtotal, data.currency), right - 60, y, { width: 60, align: 'right' });
      y += 16;

      if (data.discount && data.discount.amount > 0) {
        const discLabel = data.discount.code ? `Discount (${data.discount.code})` : 'Discount';
        doc.font('Helvetica').fontSize(9).fillColor(mid).text(discLabel, totalLeft, y);
        doc.font('Helvetica').fontSize(9).fillColor('#059669').text(`-${formatCurrency(data.discount.amount, data.currency)}`, right - 60, y, { width: 60, align: 'right' });
        y += 16;
      }

      doc.moveTo(totalLeft, y).lineTo(right, y).strokeColor(black).lineWidth(1).stroke();
      y += 10;
      doc.font('Helvetica-Bold').fontSize(11).fillColor(black).text('TOTAL', totalLeft, y);
      doc.font('Helvetica-Bold').fontSize(14).fillColor(black).text(formatCurrency(data.total, data.currency), right - 80, y - 2, { width: 80, align: 'right' });
      y += 30;

      doc.moveTo(left, y).lineTo(right, y).strokeColor(line).lineWidth(0.5).stroke();
      y += 18;

      const accounts = data.bankAccounts && data.bankAccounts.length > 0 ? data.bankAccounts : DEFAULT_BANK_ACCOUNTS;
      doc.font('Helvetica-Bold').fontSize(8).fillColor(black).text('PAYMENT DETAILS', left, y);
      y += 14;

      for (const account of accounts) {
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor(dark).text(account.label.toUpperCase(), left, y);
        y += 11;

        const colW = contentW / 4;
        const fields: [string, string][] = [];
        fields.push(['Holder', account.holder]);
        fields.push(['Bank', account.bankName]);
        if (account.iban) fields.push(['IBAN', account.iban]);
        if (account.accountNumber) fields.push(['Account', account.accountNumber]);
        if (account.routingNumber) fields.push(['Routing', account.routingNumber]);
        if (account.swift) fields.push(['SWIFT/BIC', account.swift]);

        let fX = left;
        let fRow = 0;
        for (const [label, value] of fields) {
          if (fX + colW > right + 10) { fX = left; fRow++; }
          const fY = y + fRow * 18;
          doc.font('Helvetica').fontSize(6.5).fillColor(light).text(label.toUpperCase(), fX, fY);
          doc.font('Helvetica').fontSize(7.5).fillColor(dark).text(value, fX, fY + 8);
          fX += colW;
        }
        y += (fRow + 1) * 18 + 6;
        doc.moveTo(left, y).lineTo(right, y).strokeColor(faint).lineWidth(0.5).stroke();
        y += 8;
      }

      if (data.status === 'pending' && data.paymentLink) {
        y += 4;
        doc.font('Helvetica-Bold').fontSize(8).fillColor(black).text('ONLINE PAYMENT', left, y);
        y += 12;
        doc.font('Helvetica').fontSize(8.5).fillColor(mid).text(data.paymentLink, left, y, { link: data.paymentLink, underline: true });
        y += 16;
      }

      doc.moveTo(left, 790).lineTo(right, 790).strokeColor(line).lineWidth(0.5).stroke();
      doc.font('Helvetica').fontSize(7).fillColor(light).text('Easy US LLC is a brand of Fortuny Consulting LLC. 1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110, USA', left, 798, { align: 'center', width: contentW });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateCustomInvoicePdf(data: CustomInvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: false,
        info: { Title: `Factura ${data.invoiceNumber}`, Author: 'Easy US LLC' }
      });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageW = 595;
      const left = 50;
      const right = pageW - 50;
      const contentW = right - left;
      const black = '#111111';
      const dark = '#1A1A1A';
      const mid = '#555555';
      const light = '#999999';
      const line = '#D4D4D4';

      doc.rect(0, 0, 595, 842).fill('#FFFFFF');

      const logoPath = getLogoPath();
      if (logoPath) { try { doc.image(logoPath, left, 40, { width: 36, height: 36 }); } catch {} }

      doc.font('Helvetica-Bold').fontSize(16).fillColor(black).text('Easy US LLC', left + 44, 44);
      doc.font('Helvetica').fontSize(7.5).fillColor(light).text('Fortuny Consulting LLC', left + 44, 62);

      doc.font('Helvetica').fontSize(9).fillColor(mid).text(`No. ${data.invoiceNumber}`, left, 80, { align: 'right', width: contentW });

      doc.moveTo(left, 98).lineTo(right, 98).strokeColor(black).lineWidth(1.5).stroke();

      let y = 118;

      doc.font('Helvetica').fontSize(7).fillColor(light).text('FROM', left, y);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(black).text('Fortuny Consulting LLC', left, y + 12);
      doc.font('Helvetica').fontSize(8.5).fillColor(mid);
      doc.text('1209 Mountain Road Place NE, STE R', left, y + 26);
      doc.text('Albuquerque, NM 87110, USA', left, y + 38);
      doc.text('hola@easyusllc.com', left, y + 50);

      const cX = 320;
      doc.font('Helvetica').fontSize(7).fillColor(light).text('BILL TO', cX, y);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(black).text(data.customer.name, cX, y + 12);
      doc.font('Helvetica').fontSize(8.5).fillColor(mid);
      let cy = y + 26;
      doc.text(data.customer.email, cX, cy); cy += 12;
      if (data.customer.phone) { doc.text(data.customer.phone, cX, cy); cy += 12; }

      y += 80;
      doc.moveTo(left, y).lineTo(right, y).strokeColor(line).lineWidth(0.5).stroke();
      y += 15;

      doc.font('Helvetica').fontSize(7).fillColor(light);
      doc.text('ISSUE DATE', left, y);
      doc.text('STATUS', left + contentW * 0.4, y);
      y += 11;
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(black).text(formatDate(data.date), left, y);
      const sColor = data.status === 'paid' ? '#059669' : '#D97706';
      doc.fillColor(sColor).text(getStatusText(data.status), left + contentW * 0.4, y);

      y += 22;
      doc.moveTo(left, y).lineTo(right, y).strokeColor(line).lineWidth(0.5).stroke();
      y += 20;

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(light);
      doc.text('CONCEPT', left, y);
      doc.text('AMOUNT', right - 60, y, { width: 60, align: 'right' });
      y += 14;
      doc.moveTo(left, y).lineTo(right, y).strokeColor(black).lineWidth(0.8).stroke();
      y += 10;

      doc.font('Helvetica-Bold').fontSize(10).fillColor(dark).text(data.concept, left, y, { width: contentW * 0.7 });
      const conceptH = doc.heightOfString(data.concept, { width: contentW * 0.7 });
      if (data.description) {
        doc.font('Helvetica').fontSize(8.5).fillColor(light).text(data.description, left, y + conceptH + 4, { width: contentW * 0.7 });
      }
      doc.font('Helvetica-Bold').fontSize(11).fillColor(dark).text(formatCurrency(data.amount, data.currency), right - 80, y + 2, { width: 80, align: 'right' });

      y += (data.description ? conceptH + 30 : conceptH + 16);
      doc.moveTo(left, y).lineTo(right, y).strokeColor('#F5F5F5').lineWidth(0.5).stroke();

      y += 20;
      const totalLeft = left + contentW * 0.55;
      doc.moveTo(totalLeft, y).lineTo(right, y).strokeColor(black).lineWidth(1).stroke();
      y += 10;
      doc.font('Helvetica-Bold').fontSize(11).fillColor(black).text('TOTAL', totalLeft, y);
      doc.font('Helvetica-Bold').fontSize(14).fillColor(black).text(formatCurrency(data.amount, data.currency), right - 80, y - 2, { width: 80, align: 'right' });
      y += 30;

      doc.moveTo(left, y).lineTo(right, y).strokeColor(line).lineWidth(0.5).stroke();
      y += 18;

      const customAccounts = data.bankAccounts && data.bankAccounts.length > 0 ? data.bankAccounts : DEFAULT_BANK_ACCOUNTS;
      doc.font('Helvetica-Bold').fontSize(8).fillColor(black).text('PAYMENT DETAILS', left, y);
      y += 14;

      for (const account of customAccounts) {
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor(dark).text(account.label.toUpperCase(), left, y);
        y += 11;
        const colW = contentW / 4;
        const fields: [string, string][] = [];
        fields.push(['Holder', account.holder]);
        fields.push(['Bank', account.bankName]);
        if (account.iban) fields.push(['IBAN', account.iban]);
        if (account.accountNumber) fields.push(['Account', account.accountNumber]);
        if (account.routingNumber) fields.push(['Routing', account.routingNumber]);
        if (account.swift) fields.push(['SWIFT/BIC', account.swift]);

        let fX = left;
        let fRow = 0;
        for (const [label, value] of fields) {
          if (fX + colW > right + 10) { fX = left; fRow++; }
          const fY = y + fRow * 18;
          doc.font('Helvetica').fontSize(6.5).fillColor(light).text(label.toUpperCase(), fX, fY);
          doc.font('Helvetica').fontSize(7.5).fillColor(dark).text(value, fX, fY + 8);
          fX += colW;
        }
        y += (fRow + 1) * 18 + 6;
        doc.moveTo(left, y).lineTo(right, y).strokeColor('#F5F5F5').lineWidth(0.5).stroke();
        y += 8;
      }

      if (data.notes) {
        y += 8;
        doc.font('Helvetica-Bold').fontSize(8).fillColor(black).text('NOTES', left, y);
        y += 12;
        doc.font('Helvetica').fontSize(8.5).fillColor(mid).text(data.notes, left, y, { width: contentW });
      }

      doc.moveTo(left, 790).lineTo(right, 790).strokeColor(line).lineWidth(0.5).stroke();
      doc.font('Helvetica').fontSize(7).fillColor(light).text('Easy US LLC is a brand of Fortuny Consulting LLC. 1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110, USA', left, 798, { align: 'center', width: contentW });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateOperatingAgreement(data: {
  llc: {
    companyName: string;
    designator: string;
    ein?: string | null;
    state: string;
    ownerFullName: string;
    ownerEmail: string;
    ownerPhone: string;
    ownerIdNumber: string;
    ownerIdType: string;
    ownerAddress: string;
    ownerCity: string;
    ownerCountry: string;
    ownerProvince: string;
    ownerPostalCode: string;
    llcCreatedDate: string | Date | null;
  };
  formData: {
    memberAddress: string;
    memberPhone: string;
    capitalContribution: string;
    effectiveDate: string;
    orderId: string;
  };
}): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: {
      Title: `Operating Agreement - ${data.llc.companyName}`,
      Author: 'Easy US LLC'
    }
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const margin = 40;
    const pageWidth = 595;
    const pageHeight = 842;
    const contentWidth = pageWidth - margin * 2;
    const companyFullName = `${data.llc.companyName} ${data.llc.designator || 'LLC'}`;
    
    // Header & Footer helpers
    const addHeader = (pageNum: number) => {
      const logoPath = getLogoPath();
      if (logoPath) { try { doc.image(logoPath, pageWidth - margin - 40, 30, { width: 40 }); } catch {} }
      
      doc.font('Helvetica').fontSize(7).fillColor(BRAND_GRAY);
      doc.text(`Order: ${data.formData.orderId}`, margin, 35, { align: 'right', width: contentWidth });
      doc.moveTo(margin, 75).lineTo(pageWidth - margin, 75).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
    };

    const addFooter = (pageNum: number) => {
      doc.moveTo(margin, pageHeight - 50).lineTo(pageWidth - margin, pageHeight - 50).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
      doc.font('Helvetica').fontSize(7).fillColor(BRAND_GRAY);
      doc.text('www.easyusllc.com', margin, pageHeight - 40);
      doc.text(`Page ${pageNum}`, margin, pageHeight - 40, { align: 'right', width: contentWidth });
    };

    let currentPage = 1;
    addHeader(currentPage);

    // Cover Page
    doc.font('Helvetica-Bold').fontSize(24).fillColor(BRAND_DARK).text('OPERATING AGREEMENT', margin, 150, { align: 'center', width: contentWidth });
    doc.font('Helvetica').fontSize(12).fillColor(BRAND_GRAY).text('OF', margin, 185, { align: 'center', width: contentWidth });
    doc.font('Helvetica-Bold').fontSize(18).fillColor(BRAND_DARK).text(companyFullName, margin, 210, { align: 'center', width: contentWidth });
    doc.font('Helvetica').fontSize(12).fillColor(BRAND_GRAY).text('A Limited Liability Company', margin, 240, { align: 'center', width: contentWidth });

    // Table info box
    doc.rect(margin, 300, contentWidth, 50).fill('#F9FAFB');
    doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY);
    doc.text('STATE', margin + 20, 315);
    doc.text('EIN', margin + contentWidth/3 + 20, 315);
    doc.text('FORMED', margin + (contentWidth/3)*2 + 20, 315);
    
    doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_DARK);
    doc.text(data.llc.state, margin + 20, 330);
    doc.text(data.llc.ein || 'PENDING', margin + contentWidth/3 + 20, 330);
    
    const formedDate = data.llc.llcCreatedDate ? 
      (typeof data.llc.llcCreatedDate === 'string' ? data.llc.llcCreatedDate : data.llc.llcCreatedDate.toLocaleDateString()) : 'N/A';
    doc.text(formedDate, margin + (contentWidth/3)*2 + 20, 330);

    addFooter(currentPage);

    // Articles Page
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    
    let y = 100;
    const addSection = (num: number, title: string, content: string | string[]) => {
      if (y > 700) {
        addFooter(currentPage);
        doc.addPage();
        currentPage++;
        addHeader(currentPage);
        y = 100;
      }
      
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text(`ARTICLE ${num} — ${title}`, margin, y);
      y += 15;
      
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY);
      const contentArray = Array.isArray(content) ? content : [content];
      for (const text of contentArray) {
        const textHeight = doc.heightOfString(text, { width: contentWidth });
        if (y + textHeight > 750) {
          addFooter(currentPage);
          doc.addPage();
          currentPage++;
          addHeader(currentPage);
          y = 100;
        }
        doc.text(text, margin, y, { width: contentWidth, align: 'justify' });
        y += textHeight + 8;
      }
      y += 10;
    };

    addSection(1, "FORMATION AND EXISTENCE", [
      `1.1 Formation: This Operating Agreement ("Agreement") governs ${companyFullName}, a Limited Liability Company duly organized under the laws of the State of ${data.llc.state}, United States of America (the "Company").`,
      "1.2 Separate Legal Entity: The Company shall operate as a separate legal entity distinct from its Member, maintaining full liability protection as permitted by applicable law.",
      "1.3 Duration: The Company shall exist perpetually unless dissolved pursuant to this Agreement or applicable law."
    ]);

    addSection(2, "BUSINESS PURPOSE AND ACTIVITIES", [
      "2.1 General Purpose: The Company is organized to conduct any lawful business activity permitted under applicable United States law.",
      "2.2 Authorized Activities: Business consulting services, Software and digital service operations, E-commerce and online commercial activities, Asset holding and investment operations, International business development, Technology and intellectual property management.",
      "2.3 Geographic Scope: The Company may operate within the United States and internationally."
    ]);

    addSection(3, "PRINCIPAL PLACE OF BUSINESS", `The principal office of the Company shall be: ${data.llc.ownerAddress}, ${data.llc.ownerCity}, ${data.llc.ownerCountry}. The Member may change the principal place of business at any time.`);

    addSection(4, "MEMBER AND OWNERSHIP", [
      "The Company has one Member:",
      `Full Legal Name: ${data.llc.ownerFullName}`,
      `Identification / Passport / ID: ${data.llc.ownerIdNumber}`,
      `Residential Address: ${data.llc.ownerAddress}, ${data.llc.ownerCity}, ${data.llc.ownerCountry}`,
      `Telephone: ${data.formData.memberPhone}`,
      `Email: ${data.llc.ownerEmail}`,
      `Employer Identification Number (EIN): ${data.llc.ein || 'PENDING'}`,
      "The Member owns 100% of the Membership Interest."
    ]);

    addSection(5, "BENEFICIAL OWNERSHIP REPRESENTATION", [
      "The Member certifies that:",
      "1. The Member is the ultimate beneficial owner of the Company.",
      "2. No undisclosed nominee, trustee, or third-party beneficial owner exists.",
      "3. The Company is not controlled directly or indirectly by any sanctioned individual or restricted entity."
    ]);

    addSection(6, "CAPITAL CONTRIBUTIONS", [
      `6.1 Initial Contributions: The Member may contribute capital in the form of: Cash, Intellectual Property, Services, Assets. Initial contribution value: $${data.formData.capitalContribution} USD.`,
      "6.2 Additional Contributions: Additional contributions shall be voluntary and solely determined by the Member."
    ]);

    addSection(7, "MANAGEMENT STRUCTURE", [
      "7.1 Member-Managed Company: The Company shall be managed exclusively by the Member.",
      "7.2 Authority of the Member: The Member shall have unrestricted authority to: Execute contracts, Open and manage bank accounts, Conduct financial transactions, Hire employees and contractors, Acquire or dispose of Company assets, Represent the Company before regulatory authorities, Enter strategic partnerships.",
      "7.3 Appointment of Officers: The Member may appoint officers, consultants, or advisors through written authorization."
    ]);

    addSection(8, "BANKING AND FINANCIAL OPERATIONS", [
      "8.1 Financial Accounts: The Company may maintain accounts with domestic or international financial institutions.",
      "8.2 Financial Governance: The Company shall maintain strict separation between personal and Company assets.",
      "8.3 Authorized Signatory: The Member shall serve as the primary authorized signatory unless delegated in writing."
    ]);

    addSection(9, "ACCOUNTING AND CORPORATE RECORDS", "The Company shall maintain: Financial records, Tax filings, Ownership documentation, Commercial agreements, Corporate governance documentation. Records shall be retained in accordance with regulatory and legal standards.");

    addSection(10, "PROFITS, LOSSES AND DISTRIBUTIONS", "All profits and losses shall be allocated solely to the Member. The Member may withdraw funds at their discretion provided that the Company remains solvent.");

    addSection(11, "TAX CLASSIFICATION AND REPORTING", [
      "11.1 Federal Tax Treatment: Unless otherwise elected, the Company shall be treated as a Disregarded Entity for federal tax purposes.",
      "11.2 Reporting Obligations: The Company shall comply with applicable reporting requirements including, when required: IRS Form 5472, IRS Form 1120 informational return, FBAR reporting (if applicable), and International reporting requirements."
    ]);

    addSection(12, "ANTI-MONEY LAUNDERING AND COMPLIANCE", "The Company shall operate in accordance with: Anti-Money Laundering laws, Counter Terrorism Financing regulations, Know Your Customer requirements, and Sanctions compliance standards.");

    addSection(13, "ECONOMIC SUBSTANCE REPRESENTATION", "The Company operates for legitimate commercial purposes, maintains appropriate operational control, business decisions are directed by the Member, and the Company is not formed solely for tax evasion.");

    addSection(14, "INTELLECTUAL PROPERTY OWNERSHIP", "All intellectual property developed or acquired by the Company shall be owned exclusively by the Company unless otherwise assigned in writing.");

    addSection(15, "CONFIDENTIALITY", "The Member agrees to maintain confidentiality regarding: Client information, Financial data, Trade secrets, and Business strategies.");

    addSection(16, "LIMITATION OF LIABILITY AND INDEMNIFICATION", [
      "16.1 Limited Liability: The Member shall not be personally liable for Company obligations beyond capital contributions except as required by law.",
      "16.2 Indemnification: The Company shall indemnify the Member against losses arising from lawful Company activities."
    ]);

    addSection(17, "TRANSFER OF MEMBERSHIP INTEREST", "The Member may transfer ownership interest at their sole discretion through written documentation.");

    addSection(18, "DISSOLUTION AND WINDING UP", [
      "18.1 Voluntary Dissolution: The Company may be dissolved by decision of the Member.",
      "18.2 Liquidation Process: Upon dissolution: 1. All liabilities shall be satisfied; 2. Remaining assets shall be distributed to the Member; 3. All legal filings shall be completed."
    ]);

    addSection(19, "DISPUTE RESOLUTION", "Any dispute arising under this Agreement shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.");

    addSection(20, "FORCE MAJEURE", "The Company shall not be liable for delays caused by events beyond reasonable control including natural disasters or regulatory changes.");

    addSection(21, "DIGITAL EXECUTION", "This Agreement may be executed electronically and shall be legally binding.");

    addSection(22, "GOVERNING LAW", `This Agreement shall be governed by the laws of the State of ${data.llc.state}.`);

    addSection(23, "ENTIRE AGREEMENT", "This Agreement constitutes the complete governing document of the Company.");

    addSection(24, "ADMINISTRATIVE PREPARATION STATEMENT", "This Operating Agreement has been prepared administratively by: Easy US LLC. Easy US LLC does not assume ownership, management, fiduciary responsibility, or legal representation of the Company.");

    addSection(25, "COMPLIANCE AND REGULATORY COMMITMENT", "The Company is committed to operating with transparency, integrity, and full respect for applicable laws and regulations. The Member confirms that the Company has been created to conduct legitimate commercial activities.");

    addSection(26, "BANKING RELATIONSHIP REPRESENTATION", "The Company intends to establish and maintain banking service relationships. The Member acknowledges that account approval is solely at the discretion of financial institutions.");

    addSection(27, "SOURCE OF FUNDS DECLARATION", "The Member confirms that funds used origin from legitimate sources including personal savings, business income, client payments, family support, or lawful investments.");

    addSection(28, "RISK MANAGEMENT PRINCIPLES", "The Company recognizes that responsible risk management is essential. It shall maintain accurate bookkeeping and operational transparency.");

    addSection(29, "CLIENT ACCEPTANCE AND BUSINESS ETHICS", "The Company may decline business relationships that present unreasonable risk. It commits to providing services in good faith.");

    addSection(30, "DATA PROTECTION AND CONFIDENTIALITY", "The Company respects confidentiality and shall take measures to protect sensitive information and comply with data protection regulations.");

    addSection(31, "COOPERATION WITH REVIEWS", "The Member understands that periodic reviews by financial institutions are standard practice and agrees to cooperate in good faith.");

    addSection(32, "RESPONSIBLE BUSINESS USE", "The Company is intended exclusively for lawful activities. Misuse of infrastructure may result in service termination.");

    addSection(33, "AUTOMATED DOCUMENT PREPARATION", "This Agreement may be generated through structured administrative preparation processes. Easy US LLC assists in preparation but does not provide legal advice.");

    // Final Signature Page
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    
    doc.font('Helvetica-Bold').fontSize(14).fillColor(BRAND_DARK).text('OPERATING AGREEMENT MEMBER CERTIFICATION', margin, 150, { align: 'center', width: contentWidth });
    doc.font('Helvetica').fontSize(10).text('I certify that I am the sole Member and agree to all provisions herein.', margin, 180);
    
    doc.moveTo(margin, 220).lineTo(margin + 200, 220).strokeColor(BRAND_DARK).stroke();
    
    doc.font('Helvetica-Bold').fontSize(9).text('Member Name:', margin, 240);
    doc.font('Helvetica').text(data.llc.ownerFullName, margin + 80, 240);
    
    doc.font('Helvetica-Bold').text('Signature:', margin, 270);
    doc.rect(margin + 80, 260, 200, 30).fill('#F3F4F6');
    doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_DARK).text('ELECTRONICALLY SIGNED', margin + 90, 275);
    doc.font('Helvetica').fillColor(BRAND_GRAY).text(`By: ${data.llc.ownerFullName}`, margin + 90, 285);
    
    const now = new Date();
    doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text('Date:', margin, 310);
    doc.font('Helvetica').text(now.toLocaleString(), margin + 80, 310);
    
    addFooter(currentPage);
    doc.end();
  });
}

export function generateOrderInvoice(orderData: {
  order: { id: number; invoiceNumber?: string | null; amount: number; originalAmount?: number | null; discountCode?: string | null; discountAmount?: number | null; currency: string; status: string; createdAt?: Date | null; };
  product: { name: string; description: string; features?: string[]; };
  user: { firstName?: string | null; lastName?: string | null; email: string; phone?: string | null; idType?: string | null; idNumber?: string | null; streetType?: string | null; address?: string | null; city?: string | null; province?: string | null; postalCode?: string | null; country?: string | null; };
  application?: { ownerFullName?: string | null; ownerEmail?: string | null; ownerPhone?: string | null; ownerIdType?: string | null; ownerIdNumber?: string | null; ownerStreetType?: string | null; ownerAddress?: string | null; ownerCity?: string | null; ownerProvince?: string | null; ownerPostalCode?: string | null; ownerCountry?: string | null; companyName?: string | null; designator?: string | null; state?: string | null; ein?: string | null; llcCreatedDate?: string | Date | null; registeredAgent?: string | null; } | null;
  maintenanceApplication?: { requestCode?: string | null; companyName?: string | null; ein?: string | null; state?: string | null; } | null;
  paymentLink?: string;
  isMaintenance?: boolean;
  bankAccounts?: BankAccountInfo[];
}): Promise<Buffer> {
  const invoiceData: InvoiceData = {
    orderNumber: orderData.order.invoiceNumber || orderData.order.id.toString(),
    date: (orderData.order.createdAt || new Date()).toISOString(),
    customer: {
      name: `${orderData.user.firstName || ''} ${orderData.user.lastName || ''}`.trim() || 'Cliente',
      email: orderData.user.email,
      phone: orderData.user.phone || undefined,
      idType: orderData.user.idType || undefined,
      idNumber: orderData.user.idNumber || undefined,
      address: orderData.user.address || undefined,
      streetType: orderData.user.streetType || undefined,
      city: orderData.user.city || undefined,
      province: orderData.user.province || undefined,
      postalCode: orderData.user.postalCode || undefined,
      country: orderData.user.country || undefined,
    },
    items: [{
      description: orderData.product.name,
      details: orderData.product.description,
      quantity: 1,
      unitPrice: orderData.order.originalAmount || orderData.order.amount,
      total: orderData.order.originalAmount || orderData.order.amount,
    }],
    subtotal: orderData.order.originalAmount || orderData.order.amount,
    discount: orderData.order.discountAmount ? {
      code: orderData.order.discountCode || undefined,
      amount: orderData.order.discountAmount,
    } : undefined,
    total: orderData.order.amount,
    currency: orderData.order.currency,
    status: orderData.order.status as any,
    isMaintenance: orderData.isMaintenance,
    bankAccounts: orderData.bankAccounts,
  };
  return generateInvoicePdf(invoiceData);
}
