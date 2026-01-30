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
    'transfer': 'Transferencia bancaria', 'card': 'Tarjeta', 'stripe': 'Stripe',
    'paypal': 'PayPal', 'link': 'Enlace de pago', 'other': 'Otro'
  };
  return map[method] || method;
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

      // Header bar
      doc.rect(0, 0, 595, 70).fill(BRAND_DARK);
      const logoPath = getLogoPath();
      if (logoPath) { try { doc.image(logoPath, 40, 10, { width: 45, height: 45 }); } catch {} }
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#FFFFFF').text('Easy US LLC', 95, 18);
      doc.font('Helvetica').fontSize(8).fillColor('#9CA3AF').text('Formacion de LLC en USA', 95, 38);
      doc.text('easyusllc.com | hola@easyusllc.com', 95, 50);

      // Invoice badge
      doc.rect(420, 12, 135, 45).fill(BRAND_GREEN);
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_DARK).text('FACTURA', 440, 18);
      doc.font('Helvetica-Bold').fontSize(12).text(data.orderNumber, 430, 32, { width: 115, align: 'center' });

      let y = 85;

      // Date row
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY);
      doc.text(`Fecha: ${formatDate(data.date)}`, 40, y);
      if (data.status === 'paid' && data.paymentDate) {
        doc.text(`Pagado: ${formatDate(data.paymentDate)}`, 180, y);
      }
      y += 20;

      // Two columns: Customer | Company
      doc.rect(40, y, 250, 85).fillAndStroke(BRAND_LIGHT_GRAY, '#E5E7EB');
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_DARK).text('CLIENTE', 50, y + 8);
      doc.font('Helvetica-Bold').fontSize(10).text(data.customer.name, 50, y + 22);
      let cy = y + 36;
      if (data.customer.idType && data.customer.idNumber) {
        doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text(`${data.customer.idType}: ${data.customer.idNumber}`, 50, cy);
        cy += 11;
      }
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text(data.customer.email, 50, cy);
      cy += 11;
      if (data.customer.phone) { doc.text(data.customer.phone, 50, cy); cy += 11; }
      if (data.customer.address) {
        const addr = [data.customer.streetType, data.customer.address, data.customer.postalCode, data.customer.city, data.customer.country].filter(Boolean).join(', ');
        doc.fontSize(7).text(addr, 50, cy, { width: 230 });
      }

      doc.rect(305, y, 250, 85).fillAndStroke(BRAND_LIGHT_GRAY, '#E5E7EB');
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_DARK).text('EMISOR', 315, y + 8);
      doc.font('Helvetica-Bold').fontSize(9).text('Fortuny Consulting LLC', 315, y + 22);
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY);
      doc.text('(operando como Easy US LLC)', 315, y + 34);
      doc.text('1209 Mountain Road Place NE, STE R', 315, y + 46);
      doc.text('Albuquerque, NM 87110, USA', 315, y + 58);
      doc.text('hola@easyusllc.com', 315, y + 70);
      y += 95;

      // Items table
      y += 10;
      doc.rect(40, y, 515, 22).fill('#1F2937');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
      doc.text('CONCEPTO', 50, y + 7); doc.text('CANT', 360, y + 7); doc.text('PRECIO', 410, y + 7); doc.text('TOTAL', 480, y + 7);
      y += 22;

      for (const item of data.items) {
        doc.rect(40, y, 515, 28).fillAndStroke('#FFFFFF', '#E5E7EB');
        doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text(item.description, 50, y + 5, { width: 290 });
        if (item.details) {
          doc.font('Helvetica').fontSize(7).fillColor(BRAND_GRAY).text(item.details, 50, y + 16, { width: 290 });
        }
        doc.font('Helvetica').fontSize(9).fillColor(BRAND_DARK);
        doc.text(item.quantity.toString(), 368, y + 10);
        doc.text(formatCurrency(item.unitPrice, data.currency), 400, y + 10);
        doc.font('Helvetica-Bold').text(formatCurrency(item.total, data.currency), 470, y + 10);
        y += 28;
      }

      // Discount
      if (data.discount && data.discount.amount > 0) {
        doc.rect(40, y, 515, 22).fillAndStroke(BRAND_LIGHT_GREEN, '#10B981');
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#059669');
        let discText = 'Descuento';
        if (data.discount.code) discText += `: ${data.discount.code}`;
        if (data.discount.type === 'percentage' && data.discount.value) discText += ` (${data.discount.value}%)`;
        doc.text(discText, 50, y + 7);
        doc.text(`-${formatCurrency(data.discount.amount, data.currency)}`, 470, y + 7);
        y += 27;
      }

      // Totals section
      y += 5;
      const totalsX = 350;
      doc.rect(totalsX, y, 205, 50).fill(BRAND_LIGHT_GRAY);
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY);
      doc.text('Subtotal:', totalsX + 10, y + 8);
      doc.text(formatCurrency(data.subtotal, data.currency), totalsX + 130, y + 8);
      if (data.discount && data.discount.amount > 0) {
        doc.fillColor('#059669').text('Descuento:', totalsX + 10, y + 22);
        doc.text(`-${formatCurrency(data.discount.amount, data.currency)}`, totalsX + 130, y + 22);
      }
      doc.rect(totalsX, y + 35, 205, 28).fill(BRAND_GREEN);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text('TOTAL:', totalsX + 10, y + 43);
      doc.fontSize(14).text(formatCurrency(data.total, data.currency), totalsX + 100, y + 41);

      // Status badge
      const statusColors: Record<string, string> = { pending: '#F59E0B', paid: '#10B981', cancelled: '#EF4444', refunded: '#8B5CF6' };
      const sColor = statusColors[data.status] || '#10B981';
      doc.rect(40, y + 8, 85, 25).fillAndStroke(data.status === 'paid' ? BRAND_LIGHT_GREEN : '#FEF3C7', sColor);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(sColor).text(getStatusText(data.status), 45, y + 15, { width: 75, align: 'center' });

      y += 75;

      // Payment info (real bank details)
      doc.rect(40, y, 250, 85).fillAndStroke('#FFFFFF', '#E5E7EB');
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_DARK).text('DATOS DE PAGO', 50, y + 8);
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY);
      doc.text(`Metodo: ${getPaymentMethodText(data.paymentMethod)}`, 50, y + 22);
      doc.text(`Banco: ${BANK_INFO.name}`, 50, y + 34);
      doc.text(`Titular: ${BANK_INFO.holder}`, 50, y + 46);
      doc.text(`Cuenta: ${BANK_INFO.account}`, 50, y + 58);
      doc.text(`Routing: ${BANK_INFO.routing} | SWIFT: ${BANK_INFO.swift}`, 50, y + 70);

      // Payment link box (if pending)
      if (data.status === 'pending' && data.paymentLink) {
        doc.rect(305, y, 250, 85).fillAndStroke('#FEF3C7', '#F59E0B');
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#92400E').text('ENLACE DE PAGO', 315, y + 10);
        doc.font('Helvetica').fontSize(8).fillColor('#78350F').text(data.paymentLink, 315, y + 26, { width: 230, link: data.paymentLink });
        doc.fontSize(7).text('Haz clic o copia el enlace para pagar.', 315, y + 50);
        doc.text('Valido por 7 dias desde la emision.', 315, y + 62);
      } else if (data.notes) {
        doc.rect(305, y, 250, 85).fillAndStroke('#FFFFFF', '#E5E7EB');
        doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_DARK).text('NOTAS', 315, y + 8);
        doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text(data.notes, 315, y + 22, { width: 230 });
      }

      // Footer
      doc.moveTo(40, 780).lineTo(555, 780).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
      doc.font('Helvetica').fontSize(7).fillColor(BRAND_GRAY);
      doc.text('Documento oficial emitido por Fortuny Consulting LLC (Easy US LLC). Valido sin firma.', 40, 788, { align: 'center', width: 515 });
      doc.text('hola@easyusllc.com | +34 614 91 69 10 | easyusllc.com', 40, 798, { align: 'center', width: 515 });

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

      // Header
      doc.rect(0, 0, 595, 70).fill(BRAND_DARK);
      const logoPath = getLogoPath();
      if (logoPath) { try { doc.image(logoPath, 40, 10, { width: 45, height: 45 }); } catch {} }
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#FFFFFF').text('Easy US LLC', 95, 18);
      doc.font('Helvetica').fontSize(8).fillColor('#9CA3AF').text('Formacion de LLC en USA', 95, 38);
      doc.text('easyusllc.com | hola@easyusllc.com', 95, 50);

      // Receipt badge
      doc.rect(400, 12, 155, 45).fill(BRAND_GREEN);
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_DARK).text(data.isMaintenance ? 'MANTENIMIENTO' : 'RECIBO', 430, 18);
      doc.font('Helvetica-Bold').fontSize(11).text(data.requestCode, 410, 34, { width: 135, align: 'center' });

      let y = 85;
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY);
      doc.text(`Fecha: ${formatDate(data.date)}`, 40, y);
      doc.text(`Pedido: ${data.orderNumber}`, 200, y);
      if (data.paymentDate) doc.text(`Pagado: ${formatDate(data.paymentDate)}`, 380, y);
      y += 25;

      // Customer box
      doc.rect(40, y, 250, 90).fillAndStroke(BRAND_LIGHT_GRAY, '#E5E7EB');
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_DARK).text('CLIENTE', 50, y + 8);
      doc.font('Helvetica-Bold').fontSize(10).text(data.customer.name, 50, y + 22);
      let cy = y + 36;
      if (data.customer.idType && data.customer.idNumber) {
        doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text(`${data.customer.idType}: ${data.customer.idNumber}`, 50, cy);
        cy += 11;
      }
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text(data.customer.email, 50, cy);
      cy += 11;
      if (data.customer.phone) doc.text(data.customer.phone, 50, cy);
      if (data.customer.address) {
        const addr = [data.customer.streetType, data.customer.address, data.customer.postalCode, data.customer.city].filter(Boolean).join(', ');
        doc.fontSize(7).text(addr, 50, y + 75, { width: 230 });
      }

      // LLC Details box
      if (data.llcDetails && (data.llcDetails.companyName || data.llcDetails.state)) {
        doc.rect(305, y, 250, 90).fillAndStroke(BRAND_LIGHT_GREEN, '#86EFAC');
        doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_DARK).text('DATOS DE LA LLC', 315, y + 8);
        let ly = y + 22;
        if (data.llcDetails.companyName) {
          doc.font('Helvetica-Bold').fontSize(10).text(`${data.llcDetails.companyName} ${data.llcDetails.designator || 'LLC'}`, 315, ly);
          ly += 14;
        }
        doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY);
        if (data.llcDetails.state) { doc.text(`Estado: ${data.llcDetails.state}`, 315, ly); ly += 11; }
        if (data.llcDetails.ein) { doc.text(`EIN: ${data.llcDetails.ein}`, 315, ly); ly += 11; }
        if (data.llcDetails.creationDate) { doc.text(`Constituida: ${formatDate(data.llcDetails.creationDate)}`, 315, ly); ly += 11; }
        if (data.llcDetails.registeredAgent) { doc.text(`Agente: ${data.llcDetails.registeredAgent}`, 315, ly); }
      }
      y += 100;

      // Service box
      doc.rect(40, y, 350, 75).fillAndStroke('#FFFFFF', '#E5E7EB');
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_DARK).text('SERVICIO CONTRATADO', 50, y + 8);
      doc.font('Helvetica-Bold').fontSize(12).text(data.service.name, 50, y + 24);
      if (data.service.description) {
        doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text(data.service.description, 50, y + 42, { width: 330 });
      }
      if (data.service.state) {
        doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text(`Estado: ${data.service.state}`, 50, y + 60);
      }

      // Amount box
      doc.rect(405, y, 150, 75).fill(BRAND_GREEN);
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_DARK).text('TOTAL PAGADO', 420, y + 15);
      doc.font('Helvetica-Bold').fontSize(22).text(formatCurrency(data.amount, data.currency), 415, y + 35, { width: 130, align: 'center' });
      y += 85;

      // Payment details
      doc.rect(40, y, 250, 70).fillAndStroke('#FFFFFF', '#E5E7EB');
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_DARK).text('DETALLES DEL PAGO', 50, y + 8);
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY);
      doc.text(`Metodo: ${getPaymentMethodText(data.paymentMethod)}`, 50, y + 22);
      if (data.transactionId) doc.text(`ID: ${data.transactionId}`, 50, y + 34);
      doc.text(`Banco: ${BANK_INFO.name}`, 50, y + 46);
      doc.text(`Cuenta: ${BANK_INFO.account}`, 50, y + 58);

      // Thank you box
      doc.rect(305, y, 250, 70).fill(BRAND_LIGHT_GREEN);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#059669').text('¡Gracias por confiar en Easy US LLC!', 315, y + 18, { width: 230, align: 'center' });
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text('Estamos procesando tu solicitud. Te mantendremos informado de cada avance.', 315, y + 38, { width: 230, align: 'center' });
      y += 80;

      // Notes
      if (data.notes) {
        doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('Notas:', 40, y);
        doc.font('Helvetica').fontSize(8).text(data.notes, 40, y + 12, { width: 515 });
      }

      // Footer
      doc.moveTo(40, 780).lineTo(555, 780).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
      doc.font('Helvetica').fontSize(7).fillColor(BRAND_GRAY);
      doc.text('Documento oficial emitido por Fortuny Consulting LLC (Easy US LLC).', 40, 788, { align: 'center', width: 515 });
      doc.text('hola@easyusllc.com | +34 614 91 69 10 | easyusllc.com', 40, 798, { align: 'center', width: 515 });

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

      // Header
      doc.rect(0, 0, 595, 70).fill(BRAND_DARK);
      const logoPath = getLogoPath();
      if (logoPath) { try { doc.image(logoPath, 40, 10, { width: 45, height: 45 }); } catch {} }
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#FFFFFF').text('Easy US LLC', 95, 18);
      doc.font('Helvetica').fontSize(8).fillColor('#9CA3AF').text('Formacion de LLC en USA', 95, 38);
      doc.text('easyusllc.com | hola@easyusllc.com', 95, 50);

      doc.rect(420, 12, 135, 45).fill(BRAND_GREEN);
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_DARK).text('FACTURA', 450, 18);
      doc.font('Helvetica-Bold').fontSize(11).text(data.invoiceNumber, 430, 34, { width: 115, align: 'center' });

      let y = 85;
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY).text(`Fecha: ${formatDate(data.date)}`, 40, y);
      y += 25;

      // Customer
      doc.rect(40, y, 250, 80).fillAndStroke(BRAND_LIGHT_GRAY, '#E5E7EB');
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_DARK).text('CLIENTE', 50, y + 8);
      doc.font('Helvetica-Bold').fontSize(10).text(data.customer.name, 50, y + 22);
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text(data.customer.email, 50, y + 36);
      if (data.customer.phone) doc.text(data.customer.phone, 50, y + 48);

      // Company
      doc.rect(305, y, 250, 80).fillAndStroke(BRAND_LIGHT_GRAY, '#E5E7EB');
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_DARK).text('EMISOR', 315, y + 8);
      doc.font('Helvetica-Bold').fontSize(9).text('Fortuny Consulting LLC', 315, y + 22);
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY);
      doc.text('1209 Mountain Road Place NE, STE R', 315, y + 36);
      doc.text('Albuquerque, NM 87110, USA', 315, y + 48);
      doc.text('hola@easyusllc.com', 315, y + 60);
      y += 90;

      // Concept
      doc.rect(40, y, 515, 22).fill('#1F2937');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF').text('CONCEPTO', 50, y + 7);
      doc.text('IMPORTE', 480, y + 7);
      y += 22;

      doc.rect(40, y, 515, 40).fillAndStroke('#FFFFFF', '#E5E7EB');
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text(data.concept, 50, y + 8, { width: 380 });
      if (data.description) {
        doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text(data.description, 50, y + 22, { width: 380 });
      }
      doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_DARK).text(formatCurrency(data.amount, data.currency), 460, y + 14);
      y += 50;

      // Total
      doc.rect(350, y, 205, 35).fill(BRAND_GREEN);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text('TOTAL:', 360, y + 10);
      doc.fontSize(16).text(formatCurrency(data.amount, data.currency), 450, y + 8);

      const sColor = data.status === 'paid' ? '#10B981' : '#F59E0B';
      doc.rect(40, y + 3, 85, 28).fillAndStroke(data.status === 'paid' ? BRAND_LIGHT_GREEN : '#FEF3C7', sColor);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(sColor).text(getStatusText(data.status), 45, y + 11, { width: 75, align: 'center' });
      y += 50;

      // Payment info
      doc.rect(40, y, 250, 65).fillAndStroke('#FFFFFF', '#E5E7EB');
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_DARK).text('DATOS DE PAGO', 50, y + 8);
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY);
      doc.text(`Metodo: ${getPaymentMethodText(data.paymentMethod)}`, 50, y + 22);
      doc.text(`Banco: ${BANK_INFO.name}`, 50, y + 34);
      doc.text(`Cuenta: ${BANK_INFO.account}`, 50, y + 46);

      if (data.notes) {
        doc.rect(305, y, 250, 65).fillAndStroke('#FFFFFF', '#E5E7EB');
        doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_DARK).text('NOTAS', 315, y + 8);
        doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text(data.notes, 315, y + 22, { width: 230 });
      }

      // Footer
      doc.moveTo(40, 780).lineTo(555, 780).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
      doc.font('Helvetica').fontSize(7).fillColor(BRAND_GRAY);
      doc.text('Documento oficial emitido por Fortuny Consulting LLC (Easy US LLC).', 40, 788, { align: 'center', width: 515 });
      doc.text('hola@easyusllc.com | +34 614 91 69 10 | easyusllc.com', 40, 798, { align: 'center', width: 515 });

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
      phone: app?.ownerPhone || undefined,
      idType: llcApp?.ownerIdType || undefined,
      idNumber: llcApp?.ownerIdNumber || undefined,
      streetType: llcApp?.ownerStreetType || undefined,
      address: llcApp?.ownerAddress || undefined,
      city: llcApp?.ownerCity || undefined,
      province: llcApp?.ownerProvince || undefined,
      postalCode: llcApp?.ownerPostalCode || undefined,
      country: llcApp?.ownerCountry || undefined,
      clientId: orderData.user.email.split('@')[0].substring(0, 8).toUpperCase()
    },
    items: [{
      description: orderData.product.name,
      details: orderData.product.features?.slice(0, 3).join(' • ') || orderData.product.description.substring(0, 80),
      quantity: 1,
      unitPrice: orderData.order.originalAmount || orderData.order.amount,
      total: orderData.order.originalAmount || orderData.order.amount
    }],
    subtotal: orderData.order.originalAmount || orderData.order.amount,
    discount: orderData.order.discountAmount && orderData.order.discountAmount > 0 ? { code: orderData.order.discountCode || undefined, amount: orderData.order.discountAmount } : undefined,
    total: orderData.order.amount,
    currency: orderData.order.currency,
    status: orderData.order.status === 'paid' || orderData.order.status === 'completed' ? 'paid' : 'pending',
    paymentMethod: (app?.paymentMethod as 'transfer' | 'link') || undefined,
    paymentLink: orderData.paymentLink || undefined,
    notes: orderData.notes || undefined,
    isMaintenance: !!orderData.maintenanceApplication
  };
  return generateInvoicePdf(invoiceData);
}

export function generateOrderReceipt(orderData: {
  order: { id: number; invoiceNumber?: string | null; amount: number; currency: string; status: string; createdAt?: Date | null; };
  product: { name: string; description: string; features?: string[]; };
  user: { firstName?: string | null; lastName?: string | null; email: string; };
  application?: { requestCode?: string | null; ownerFullName?: string | null; ownerEmail?: string | null; ownerPhone?: string | null; ownerIdType?: string | null; ownerIdNumber?: string | null; ownerStreetType?: string | null; ownerAddress?: string | null; ownerCity?: string | null; ownerProvince?: string | null; ownerPostalCode?: string | null; ownerCountry?: string | null; companyName?: string | null; designator?: string | null; state?: string | null; paymentMethod?: string | null; llcCreatedDate?: Date | null; } | null;
  maintenanceApplication?: { requestCode?: string | null; ownerFullName?: string | null; ownerEmail?: string | null; ownerPhone?: string | null; companyName?: string | null; ein?: string | null; state?: string | null; creationYear?: string | null; paymentMethod?: string | null; bankAccount?: string | null; } | null;
}): Promise<Buffer> {
  const app = orderData.application;
  const maintApp = orderData.maintenanceApplication;
  const isMaintenance = !!maintApp;
  const currentApp = app || maintApp;
  const customerName = currentApp?.ownerFullName || [orderData.user.firstName, orderData.user.lastName].filter(Boolean).join(' ') || orderData.user.email.split('@')[0];

  const receiptData: ReceiptData = {
    orderNumber: orderData.order.invoiceNumber || `ORD-${orderData.order.id.toString().padStart(8, '0')}`,
    requestCode: currentApp?.requestCode || `REQ-${orderData.order.id.toString().padStart(8, '0')}`,
    date: orderData.order.createdAt?.toISOString() || new Date().toISOString(),
    customer: {
      name: customerName,
      email: currentApp?.ownerEmail || orderData.user.email,
      phone: currentApp?.ownerPhone || undefined,
      idType: app?.ownerIdType || undefined,
      idNumber: app?.ownerIdNumber || undefined,
      streetType: app?.ownerStreetType || undefined,
      address: app?.ownerAddress || undefined,
      city: app?.ownerCity || undefined,
      province: app?.ownerProvince || undefined,
      postalCode: app?.ownerPostalCode || undefined,
      country: app?.ownerCountry || undefined
    },
    service: { name: orderData.product.name, description: orderData.product.features?.join(' • ') || orderData.product.description, state: app?.state || maintApp?.state || undefined },
    llcDetails: isMaintenance ? { companyName: maintApp?.companyName || undefined, state: maintApp?.state || undefined, ein: maintApp?.ein || undefined, creationDate: maintApp?.creationYear || undefined } :
      app ? { companyName: app.companyName || undefined, designator: app.designator || undefined, state: app.state || undefined, creationDate: app.llcCreatedDate?.toISOString() || undefined, registeredAgent: 'Easy US LLC' } : undefined,
    amount: orderData.order.amount,
    currency: orderData.order.currency,
    paymentMethod: currentApp?.paymentMethod || undefined,
    paymentDate: orderData.order.createdAt?.toISOString(),
    isMaintenance
  };
  return generateReceiptPdf(receiptData);
}
