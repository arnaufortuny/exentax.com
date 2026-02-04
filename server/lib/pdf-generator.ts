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
  application?: { ownerFullName?: string | null; ownerEmail?: string | null; ownerPhone?: string | null; ownerIdType?: string | null; ownerIdNumber?: string | null; ownerStreetType?: string | null; ownerAddress?: string | null; ownerCity?: string | null; ownerProvince?: string | null; ownerPostalCode?: string | null; ownerCountry?: string | null; companyName?: string | null; designator?: string | null; state?: string | null; ein?: string | null; llcCreatedDate?: string | Date | null; registeredAgent?: string | null; };
  isMaintenance?: boolean;
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
  };
  return generateInvoicePdf(invoiceData);
}
