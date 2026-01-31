import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BRAND_GREEN = '#6EDC8A';
const BRAND_DARK = '#0E1215';
const BRAND_GRAY = '#6B7280';
const BRAND_LIGHT_GREEN = '#ECFDF5';
const BRAND_LIGHT_GRAY = '#F9FAFB';

const BANK_INFO = {
  name: 'Column Bank NA',
  holder: 'Fortuny Consulting LLC',
  routing: '121145433',
  account: '141432778929495',
  swift: 'CLNOUS66MER',
  address: '1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110'
};

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
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  paymentMethod?: 'transfer' | 'card' | 'stripe' | 'paypal' | 'link' | 'other';
  paymentDate?: string;
  paymentLink?: string;
  notes?: string;
  isMaintenance?: boolean;
}

export interface ReceiptData {
  orderNumber: string;
  requestCode: string;
  date: string;
  customer: CustomerData;
  service: {
    name: string;
    description?: string;
    features?: string[];
    state?: string;
  };
  llcDetails?: {
    companyName?: string;
    designator?: string;
    state?: string;
    ein?: string;
    creationDate?: string;
    registeredAgent?: string;
  };
  amount: number;
  currency: string;
  paymentMethod?: string;
  paymentDate?: string;
  transactionId?: string;
  notes?: string;
  isMaintenance?: boolean;
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
      const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: false,
        info: { Title: `Factura ${data.orderNumber}`, Author: 'Easy US LLC' }
      });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Background
      doc.rect(0, 0, 595, 842).fill('#FFFFFF');
      
      // Modern soft background accents (rounded shapes)
      doc.fillColor(BRAND_LIGHT_GRAY).circle(550, 50, 100).fill();
      doc.fillColor(BRAND_LIGHT_GREEN).circle(50, 800, 80).fill();
      
      // Logo & Header (More space at the top)
      const logoPath = getLogoPath();
      if (logoPath) { try { doc.image(logoPath, 45, 45, { width: 45, height: 45 }); } catch {} }
      
      doc.font('Helvetica-Bold').fontSize(20).fillColor(BRAND_DARK).text('Easy US LLC', 100, 50);
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GREEN).text('BEYOND BORDERS BUSINESS', 100, 72);
      
      // Fine header line
      doc.moveTo(45, 110).lineTo(550, 110).strokeColor('#E5E7EB').lineWidth(0.5).stroke();

      // Invoice Info
      doc.font('Helvetica-Bold').fontSize(24).fillColor(BRAND_DARK).text('FACTURA', 350, 50, { align: 'right', width: 200 });
      doc.font('Helvetica').fontSize(10).fillColor(BRAND_GRAY).text(`No. ${data.orderNumber}`, 350, 78, { align: 'right', width: 200 });

      let y = 140;

      // EMISOR | CLIENTE
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_GRAY).text('EMISOR', 45, y);
      doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_DARK).text('Fortuny Consulting LLC', 45, y + 18);
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY);
      doc.text('1209 Mountain Road Place NE, STE R', 45, y + 32);
      doc.text('Albuquerque, NM 87110, USA', 45, y + 44);
      doc.text('hola@easyusllc.com', 45, y + 56);

      const clientX = 350;
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_GRAY).text('CLIENTE', clientX, y);
      doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_DARK).text(data.customer.name, clientX, y + 18);
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY);
      let cy = y + 32;
      if (data.customer.idType && data.customer.idNumber) {
        doc.text(`${data.customer.idType}: ${data.customer.idNumber}`, clientX, cy);
        cy += 12;
      }
      doc.text(data.customer.email, clientX, cy);
      cy += 12;
      if (data.customer.address) {
        const addr = [data.customer.streetType, data.customer.address, data.customer.postalCode, data.customer.city, data.customer.country].filter(Boolean).join(', ');
        doc.fontSize(8).text(addr, clientX, cy, { width: 200 });
      }
      
      y += 95;

      // Summary Bar with Rounded Corners
      doc.roundedRect(45, y, 505, 40, 8).fill(BRAND_LIGHT_GRAY);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('FECHA EMISIÓN', 60, y + 10);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text(formatDate(data.date), 60, y + 22);
      
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('VENCIMIENTO', 180, y + 10);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text(data.dueDate ? formatDate(data.dueDate) : formatDate(data.date), 180, y + 22);
      
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('ESTADO', 320, y + 10);
      const statusColors: Record<string, string> = { pending: '#F59E0B', paid: '#10B981', cancelled: '#EF4444', refunded: '#8B5CF6' };
      const sColor = statusColors[data.status] || '#10B981';
      doc.font('Helvetica-Bold').fontSize(10).fillColor(sColor).text(getStatusText(data.status), 320, y + 22);

      y += 65;

      // Table Header (Rounded Top)
      doc.roundedRect(45, y, 505, 25, 6).fill(BRAND_DARK);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
      doc.text('DESCRIPCIÓN', 60, y + 8);
      doc.text('CANT', 360, y + 8);
      doc.text('PRECIO', 420, y + 8);
      doc.text('TOTAL', 490, y + 8);
      y += 25;

      // Table Rows
      for (const item of data.items) {
        doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text(item.description, 60, y + 10, { width: 280 });
        if (item.details) {
          doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text(item.details, 60, y + 22, { width: 280 });
        }
        doc.font('Helvetica').fontSize(10).fillColor(BRAND_DARK);
        doc.text(item.quantity.toString(), 365, y + 15);
        doc.text(formatCurrency(item.unitPrice, data.currency), 415, y + 15);
        doc.font('Helvetica-Bold').text(formatCurrency(item.total, data.currency), 485, y + 15);
        
        doc.moveTo(45, y + 40).lineTo(550, y + 40).strokeColor('#F3F4F6').lineWidth(0.5).stroke();
        y += 40;
      }

      // Totals
      y += 15;
      const totalX = 350;
      doc.font('Helvetica').fontSize(10).fillColor(BRAND_GRAY).text('Subtotal', totalX, y);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text(formatCurrency(data.subtotal, data.currency), totalX + 80, y, { align: 'right', width: 120 });
      y += 18;

      if (data.discount && data.discount.amount > 0) {
        doc.font('Helvetica').fontSize(10).fillColor('#10B981').text('Descuento', totalX, y);
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#10B981').text(`-${formatCurrency(data.discount.amount, data.currency)}`, totalX + 80, y, { align: 'right', width: 120 });
        y += 18;
      }

      doc.roundedRect(totalX - 10, y, 215, 35, 8).fill(BRAND_DARK);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF').text('TOTAL', totalX, y + 12);
      doc.fontSize(14).fillColor(BRAND_GREEN).text(formatCurrency(data.total, data.currency), totalX + 80, y + 10, { align: 'right', width: 120 });
      y += 55;

      // Payment Info
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text('MÉTODO DE PAGO (TRANSFERENCIA)', 45, y);
      doc.roundedRect(45, y + 15, 505, 65, 8).strokeColor('#E5E7EB').lineWidth(1).stroke();
      
      const px = 60;
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('BANCO', px, y + 25);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text(BANK_INFO.name, px, y + 37);
      
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('TITULAR', px + 120, y + 25);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text(BANK_INFO.holder, px + 120, y + 37);
      
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('NÚMERO DE CUENTA', px + 280, y + 25);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text(BANK_INFO.account, px + 280, y + 37);

      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('ROUTING / SWIFT', px, y + 55);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text(`${BANK_INFO.routing} / ${BANK_INFO.swift}`, px, y + 67);

      if (data.status === 'pending' && data.paymentLink) {
        y += 95;
        doc.roundedRect(45, y, 505, 30, 8).fill(BRAND_GREEN);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text('PAGAR ONLINE', 60, y + 10);
        doc.font('Helvetica').fontSize(9).fillColor(BRAND_DARK).text(data.paymentLink, 180, y + 10, { link: data.paymentLink, underline: true });
      }

      // Footer
      doc.fontSize(8).fillColor(BRAND_GRAY).text('Easy US LLC es una marca de Fortuny Consulting LLC. 1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110, USA', 45, 780, { align: 'center', width: 505 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateReceiptPdf(data: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: false,
        info: { Title: `Recibo ${data.requestCode}`, Author: 'Easy US LLC' }
      });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Background with soft rounded shapes
      doc.rect(0, 0, 595, 842).fill('#FFFFFF');
      
      // Header & Logo (More top space)
      const logoPath = getLogoPath();
      if (logoPath) { try { doc.image(logoPath, 45, 40, { width: 40, height: 40 }); } catch {} }
      
      doc.font('Helvetica-Bold').fontSize(18).fillColor(BRAND_DARK).text('Easy US LLC', 95, 42);
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_GREEN).text('CONFIRMACIÓN DE SERVICIO', 95, 62);
      
      // Fine header line
      doc.moveTo(45, 95).lineTo(550, 95).strokeColor('#E5E7EB').lineWidth(0.5).stroke();

      // Receipt Title
      doc.font('Helvetica-Bold').fontSize(22).fillColor(BRAND_DARK).text(data.isMaintenance ? 'MANTENIMIENTO' : 'RECIBO', 350, 42, { align: 'right', width: 200 });
      doc.font('Helvetica').fontSize(10).fillColor(BRAND_GRAY).text(`REF: ${data.requestCode}`, 350, 68, { align: 'right', width: 200 });

      let y = 125;

      // Customer & LLC info (Rounded separators)
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_GRAY).text('CLIENTE', 45, y);
      doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_DARK).text(data.customer.name, 45, y + 18);
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY);
      let cy = y + 32;
      doc.text(data.customer.email, 45, cy);
      cy += 12;
      if (data.customer.phone) {
        doc.text(data.customer.phone, 45, cy);
        cy += 12;
      }
      if (data.customer.address) {
        const addr = [data.customer.streetType, data.customer.address, data.customer.postalCode, data.customer.city, data.customer.province, data.customer.country].filter(Boolean).join(', ');
        doc.fontSize(8).text(addr, 45, cy, { width: 230 });
      }

      const llcX = 320;
      if (data.llcDetails && (data.llcDetails.companyName || data.llcDetails.state)) {
        doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_GRAY).text('DATOS DE LA LLC', llcX, y);
        let ly = y + 18;
        if (data.llcDetails.companyName) {
          doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_DARK).text(`${data.llcDetails.companyName} ${data.llcDetails.designator || 'LLC'}`, llcX, ly);
          ly += 16;
        }
        doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY);
        if (data.llcDetails.state) { doc.text(`Estado: ${data.llcDetails.state}`, llcX, ly); ly += 14; }
        if (data.llcDetails.ein) { doc.text(`EIN: ${data.llcDetails.ein}`, llcX, ly); }
      }

      y += 90;

      // Summary Bar (Rounded)
      doc.roundedRect(45, y, 505, 40, 8).fill(BRAND_LIGHT_GRAY);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('FECHA', 60, y + 10);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text(formatDate(data.date), 60, y + 22);
      
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('PEDIDO No.', 180, y + 10);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text(data.orderNumber, 180, y + 22);
      
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('MÉTODO', 320, y + 10);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text(getPaymentMethodText(data.paymentMethod), 320, y + 22);

      y += 65;

      // Service Details (Modern rounded feel)
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text('DETALLE DEL SERVICIO', 45, y);
      doc.roundedRect(45, y + 15, 505, 80, 8).strokeColor('#E5E7EB').lineWidth(1).stroke();
      
      doc.font('Helvetica-Bold').fontSize(14).fillColor(BRAND_DARK).text(data.service.name, 60, y + 35);
      if (data.service.description) {
        doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY).text(data.service.description, 60, y + 55, { width: 300 });
      }
      
      // Amount (Aligned)
      doc.roundedRect(400, y + 15, 150, 80, 8).fill(BRAND_GREEN);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text('TOTAL', 415, y + 25, { width: 120, align: 'center' });
      doc.text('PAGADO', 415, y + 35, { width: 120, align: 'center' });
      doc.fontSize(20).text(formatCurrency(data.amount, data.currency), 415, y + 55, { width: 120, align: 'center' });

      y += 115;

      // Success Message (Rounded)
      doc.roundedRect(45, y, 305, 35, 8).fill(BRAND_LIGHT_GREEN);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#059669').text('¡Gracias por confiar en nosotros!', 45, y + 14, { align: 'center', width: 305 });

      // Footer
      doc.fontSize(8).fillColor(BRAND_GRAY).text('Easy US LLC es una marca de Fortuny Consulting LLC. 1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110, USA', 45, 780, { align: 'center', width: 505 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateCustomInvoicePdf(data: CustomInvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: false,
        info: { Title: `Factura ${data.invoiceNumber}`, Author: 'Easy US LLC' }
      });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Background
      doc.rect(0, 0, 595, 842).fill('#FFFFFF');
      doc.fillColor(BRAND_LIGHT_GRAY).circle(550, 40, 60).fill();
      
      // Header & Logo
      const logoPath = getLogoPath();
      if (logoPath) { try { doc.image(logoPath, 45, 40, { width: 40, height: 40 }); } catch {} }
      
      doc.font('Helvetica-Bold').fontSize(18).fillColor(BRAND_DARK).text('Easy US LLC', 95, 42);
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_GREEN).text('FACTURA MANUAL', 95, 62);
      
      // Fine header line
      doc.moveTo(45, 95).lineTo(550, 95).strokeColor('#E5E7EB').lineWidth(0.5).stroke();

      // Invoice Title
      doc.font('Helvetica-Bold').fontSize(22).fillColor(BRAND_DARK).text('FACTURA', 350, 42, { align: 'right', width: 200 });
      doc.font('Helvetica').fontSize(10).fillColor(BRAND_GRAY).text(`No. ${data.invoiceNumber}`, 350, 68, { align: 'right', width: 200 });

      let y = 125;

      // Two columns: Company | Customer
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_GRAY).text('EMISOR', 45, y);
      doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_DARK).text('Fortuny Consulting LLC', 45, y + 18);
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY);
      doc.text('1209 Mountain Road Place NE, STE R', 45, y + 32);
      doc.text('Albuquerque, NM 87110, USA', 45, y + 44);
      doc.text('hola@easyusllc.com', 45, y + 56);

      const clientX = 350;
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_GRAY).text('CLIENTE', clientX, y);
      doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_DARK).text(data.customer.name, clientX, y + 18);
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY);
      doc.text(data.customer.email, clientX, y + 32);
      if (data.customer.phone) {
        doc.text(data.customer.phone, clientX, y + 44);
      }
      
      y += 90;

      // Summary Bar
      doc.roundedRect(45, y, 505, 40, 8).fill(BRAND_LIGHT_GRAY);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('FECHA EMISIÓN', 60, y + 10);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text(formatDate(data.date), 60, y + 22);
      
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('ESTADO', 180, y + 10);
      const sColor = data.status === 'paid' ? '#10B981' : '#F59E0B';
      doc.font('Helvetica-Bold').fontSize(10).fillColor(sColor).text(getStatusText(data.status), 180, y + 22);

      y += 65;

      // Concept Table
      doc.roundedRect(45, y, 505, 25, 6).fill(BRAND_DARK);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
      doc.text('CONCEPTO / DESCRIPCIÓN', 60, y + 8);
      doc.text('IMPORTE', 480, y + 8);
      y += 25;

      doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_DARK).text(data.concept, 60, y + 15, { width: 380 });
      if (data.description) {
        doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY).text(data.description, 60, y + 32, { width: 380 });
      }
      doc.font('Helvetica-Bold').fontSize(12).fillColor(BRAND_DARK).text(formatCurrency(data.amount, data.currency), 460, y + 22, { align: 'right', width: 80 });
      
      y += 65;

      // Total
      const totalX = 350;
      doc.roundedRect(totalX - 10, y, 215, 40, 8).fill(BRAND_DARK);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#FFFFFF').text('TOTAL', totalX, y + 14);
      doc.fontSize(16).fillColor(BRAND_GREEN).text(formatCurrency(data.amount, data.currency), totalX + 80, y + 12, { align: 'right', width: 120 });
      
      y += 65;

      // Payment Info
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text('INFORMACIÓN DE PAGO', 45, y);
      doc.roundedRect(45, y + 15, 505, 60, 8).strokeColor('#E5E7EB').lineWidth(1).stroke();
      
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('MÉTODO', 60, y + 25);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text(getPaymentMethodText(data.paymentMethod), 60, y + 37);
      
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('BANCO', 180, y + 25);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text(BANK_INFO.name, 180, y + 37);
      
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('CUENTA', 320, y + 25);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text(BANK_INFO.account, 320, y + 37);

      if (data.notes) {
        y += 90;
        doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text('NOTAS', 45, y);
        doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY).text(data.notes, 45, y + 18, { width: 505 });
      }

      // Footer
      doc.fontSize(8).fillColor(BRAND_GRAY).text('Documento oficial emitido por Fortuny Consulting LLC.', 45, 780, { align: 'center', width: 505 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateOrderInvoice(orderData: {
  order: { id: number; invoiceNumber?: string | null; amount: number; originalAmount?: number | null; discountCode?: string | null; discountAmount?: number | null; currency: string; status: string; createdAt?: Date | null; };
  product: { name: string; description: string; features?: string[]; };
  user: { firstName?: string | null; lastName?: string | null; email: string; };
  application?: { ownerFullName?: string | null; ownerEmail?: string | null; ownerPhone?: string | null; ownerIdType?: string | null; ownerIdNumber?: string | null; ownerStreetType?: string | null; ownerAddress?: string | null; ownerCity?: string | null; ownerProvince?: string | null; ownerPostalCode?: string | null; ownerCountry?: string | null; paymentMethod?: string | null; state?: string | null; } | null;
  maintenanceApplication?: { ownerFullName?: string | null; ownerEmail?: string | null; ownerPhone?: string | null; state?: string | null; paymentMethod?: string | null; } | null;
  paymentLink?: string | null;
  notes?: string | null;
}): Promise<Buffer> {
  const app = orderData.application || orderData.maintenanceApplication;
  const llcApp = orderData.application;
  const customerName = app?.ownerFullName || [orderData.user.firstName, orderData.user.lastName].filter(Boolean).join(' ') || orderData.user.email.split('@')[0];

  const invoiceData: InvoiceData = {
    orderNumber: orderData.order.invoiceNumber || `ORD-${orderData.order.id.toString().padStart(8, '0')}`,
    date: orderData.order.createdAt?.toISOString() || new Date().toISOString(),
    customer: {
      name: customerName,
      email: app?.ownerEmail || orderData.user.email,
      phone: app?.ownerPhone || orderData.user.phone || undefined,
      idType: llcApp?.ownerIdType || orderData.user.idType || undefined,
      idNumber: llcApp?.ownerIdNumber || orderData.user.idNumber || undefined,
      streetType: llcApp?.ownerStreetType || orderData.user.streetType || undefined,
      address: llcApp?.ownerAddress || orderData.user.address || undefined,
      city: llcApp?.ownerCity || orderData.user.city || undefined,
      province: llcApp?.ownerProvince || orderData.user.province || undefined,
      postalCode: llcApp?.ownerPostalCode || orderData.user.postalCode || undefined,
      country: llcApp?.ownerCountry || orderData.user.country || undefined,
    },
    items: [
      {
        description: orderData.product.name,
        details: orderData.product.description,
        quantity: 1,
        unitPrice: orderData.order.originalAmount || orderData.order.amount,
        total: orderData.order.originalAmount || orderData.order.amount,
      }
    ],
    subtotal: orderData.order.originalAmount || orderData.order.amount,
    discount: orderData.order.discountAmount ? {
      code: orderData.order.discountCode || undefined,
      amount: orderData.order.discountAmount,
    } : undefined,
    total: orderData.order.amount,
    currency: orderData.order.currency,
    status: orderData.order.status as any,
    paymentMethod: app?.paymentMethod as any,
    paymentLink: orderData.paymentLink || undefined,
    notes: orderData.notes || undefined,
  };

  return generateInvoicePdf(invoiceData);
}

export function generateOrderReceipt(orderData: {
  order: { id: number; invoiceNumber?: string | null; amount: number; currency: string; status: string; createdAt?: Date | null; paymentDate?: Date | null; transactionId?: string | null; };
  product: { name: string; description: string; };
  user: { firstName?: string | null; lastName?: string | null; email: string; };
  application?: { ownerFullName?: string | null; ownerEmail?: string | null; ownerPhone?: string | null; ownerStreetType?: string | null; ownerAddress?: string | null; ownerCity?: string | null; ownerPostalCode?: string | null; companyName?: string | null; designator?: string | null; state?: string | null; ein?: string | null; paymentMethod?: string | null; } | null;
  maintenanceApplication?: { ownerFullName?: string | null; ownerEmail?: string | null; ownerPhone?: string | null; state?: string | null; paymentMethod?: string | null; } | null;
  notes?: string | null;
  isMaintenance?: boolean;
}): Promise<Buffer> {
  const app = orderData.application || orderData.maintenanceApplication;
  const llcApp = orderData.application;
  const customerName = app?.ownerFullName || [orderData.user.firstName, orderData.user.lastName].filter(Boolean).join(' ') || orderData.user.email.split('@')[0];

  const receiptData: ReceiptData = {
    orderNumber: orderData.order.invoiceNumber || `ORD-${orderData.order.id.toString().padStart(8, '0')}`,
    requestCode: `REC-${orderData.order.id.toString().padStart(8, '0')}`,
    date: new Date().toISOString(),
    customer: {
      name: customerName,
      email: app?.ownerEmail || orderData.user.email,
      phone: app?.ownerPhone || orderData.user.phone || undefined,
      streetType: llcApp?.ownerStreetType || orderData.user.streetType || undefined,
      address: llcApp?.ownerAddress || orderData.user.address || undefined,
      city: llcApp?.ownerCity || orderData.user.city || undefined,
      province: llcApp?.ownerProvince || orderData.user.province || undefined,
      postalCode: llcApp?.ownerPostalCode || orderData.user.postalCode || undefined,
      country: llcApp?.ownerCountry || orderData.user.country || undefined,
    },
    service: {
      name: orderData.product.name,
      description: orderData.product.description,
      state: (llcApp?.state || orderData.maintenanceApplication?.state) || undefined,
    },
    llcDetails: llcApp ? {
      companyName: llcApp.companyName || undefined,
      designator: llcApp.designator || undefined,
      state: llcApp.state || undefined,
      ein: llcApp.ein || undefined,
    } : undefined,
    amount: orderData.order.amount,
    currency: orderData.order.currency,
    paymentMethod: app?.paymentMethod || undefined,
    paymentDate: orderData.order.paymentDate?.toISOString(),
    transactionId: orderData.order.transactionId || undefined,
    notes: orderData.notes || undefined,
    isMaintenance: orderData.isMaintenance,
  };

  return generateReceiptPdf(receiptData);
}
