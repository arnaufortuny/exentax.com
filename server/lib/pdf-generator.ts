import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BRAND_GREEN = '#6EDC8A';
const BRAND_DARK = '#0E1215';
const BRAND_GRAY = '#6B7280';
const BRAND_LIGHT_GREEN = '#D1FAE5';
const BRAND_LIGHT_GRAY = '#F3F4F6';

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
  bankDetails?: {
    bankName?: string;
    accountHolder?: string;
    iban?: string;
    swift?: string;
  };
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
  bankDetails?: {
    bankName?: string;
    iban?: string;
  };
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
  const amount = (cents / 100).toFixed(2);
  return currency === 'EUR' ? `${amount} €` : `${amount} ${currency}`;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  } catch {
    return dateStr;
  }
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'PENDIENTE',
    'paid': 'PAGADO',
    'completed': 'COMPLETADO',
    'cancelled': 'CANCELADO',
    'refunded': 'REEMBOLSADO',
    'processing': 'EN PROCESO',
    'documents_ready': 'DOCS LISTOS'
  };
  return statusMap[status] || status.toUpperCase();
}

function getPaymentMethodText(method?: string): string {
  if (!method) return 'No especificado';
  const methodMap: Record<string, string> = {
    'transfer': 'Transferencia bancaria',
    'card': 'Tarjeta de crédito/débito',
    'stripe': 'Stripe',
    'paypal': 'PayPal',
    'link': 'Enlace de pago',
    'other': 'Otro'
  };
  return methodMap[method] || method;
}

function drawHeader(doc: PDFKit.PDFDocument): number {
  doc.rect(0, 0, 595, 85).fill(BRAND_DARK);
  
  const logoPath = getLogoPath();
  let textX = 50;
  
  if (logoPath) {
    try {
      doc.image(logoPath, 50, 12, { width: 50, height: 50 });
      textX = 110;
    } catch { /* ignore logo errors */ }
  }
  
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#FFFFFF')
    .text('Easy US LLC', textX, 22);
  doc.font('Helvetica').fontSize(9).fillColor('#9CA3AF')
    .text('Tu socio para formar LLC en USA', textX, 44);
  doc.font('Helvetica').fontSize(8).fillColor('#9CA3AF')
    .text('www.easyusllc.com | info@easyusllc.com', textX, 56);
  
  return 95;
}

function drawCompanyInfo(doc: PDFKit.PDFDocument, y: number): number {
  doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_GRAY).text('EMISOR:', 380, y);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text('FORTUNY CONSULTING LLC', 380, y + 12);
  doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY);
  doc.text('(operando como Easy US LLC)', 380, y + 23);
  doc.text('1209 Mountain Road Pl NE, STE R', 380, y + 34);
  doc.text('Albuquerque, NM 87110, USA', 380, y + 45);
  doc.text('CIF/NIF: 88-3961621', 380, y + 56);
  return y + 70;
}

function drawCustomerInfo(doc: PDFKit.PDFDocument, customer: CustomerData, y: number): number {
  doc.rect(50, y, 300, 95).fillAndStroke(BRAND_LIGHT_GRAY, '#E5E7EB');
  
  doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text('DATOS DEL CLIENTE:', 60, y + 8);
  
  let lineY = y + 22;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text(customer.name, 60, lineY);
  lineY += 13;
  
  if (customer.idType && customer.idNumber) {
    doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY)
      .text(`${customer.idType}: ${customer.idNumber}`, 60, lineY);
    lineY += 11;
  }
  
  doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY).text(customer.email, 60, lineY);
  lineY += 11;
  
  if (customer.phone) {
    doc.text(customer.phone, 60, lineY);
    lineY += 11;
  }
  
  const addressParts: string[] = [];
  if (customer.streetType && customer.address) {
    addressParts.push(`${customer.streetType} ${customer.address}`);
  } else if (customer.address) {
    addressParts.push(customer.address);
  }
  if (customer.postalCode || customer.city) {
    addressParts.push([customer.postalCode, customer.city].filter(Boolean).join(' '));
  }
  if (customer.province) addressParts.push(customer.province);
  if (customer.country) addressParts.push(customer.country);
  
  if (addressParts.length > 0) {
    const address = addressParts.join(', ');
    doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY)
      .text(address, 60, lineY, { width: 280 });
  }
  
  if (customer.clientId) {
    doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY)
      .text(`ID Cliente: ${customer.clientId}`, 60, y + 82);
  }
  
  return y + 105;
}

function drawFooter(doc: PDFKit.PDFDocument): void {
  const footerY = 760;
  doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
  
  doc.font('Helvetica').fontSize(7).fillColor(BRAND_GRAY);
  doc.text('Este documento es un comprobante oficial emitido por Easy US LLC. Valido sin firma ni sello.', 50, footerY + 8, { align: 'center', width: 495 });
  doc.text('Contacto: info@easyusllc.com | +34 614 91 69 10 | Horario: Lun-Vie 9:00-18:00 (CET)', 50, footerY + 18, { align: 'center', width: 495 });
  doc.font('Helvetica-Bold').fontSize(7).fillColor(BRAND_DARK)
    .text(`© ${new Date().getFullYear()} Easy US LLC (Fortuny Consulting LLC). Todos los derechos reservados.`, 50, footerY + 30, { align: 'center', width: 495 });
}

export function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        bufferPages: true,
        info: {
          Title: `Factura ${data.orderNumber}`,
          Author: 'Easy US LLC',
          Subject: `Factura para ${data.customer.name}`,
          Creator: 'Easy US LLC PDF Generator'
        }
      });
      
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      let y = drawHeader(doc);

      doc.font('Helvetica-Bold').fontSize(22).fillColor(BRAND_DARK).text('FACTURA', 50, y);
      doc.moveTo(50, y + 28).lineTo(180, y + 28).strokeColor(BRAND_GREEN).lineWidth(3).stroke();
      
      doc.rect(380, y, 165, 40).fill(BRAND_GREEN);
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_DARK).text('N° PEDIDO', 405, y + 6);
      doc.font('Helvetica-Bold').fontSize(14).text(data.orderNumber, 395, y + 18, { width: 155, align: 'center' });
      
      y += 50;
      
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY);
      doc.text(`Fecha emisión: ${formatDate(data.date)}`, 50, y);
      if (data.dueDate) {
        doc.text(`Fecha vencimiento: ${formatDate(data.dueDate)}`, 50, y + 12);
        y += 12;
      }
      y += 20;

      y = drawCustomerInfo(doc, data.customer, y);
      drawCompanyInfo(doc, y - 95);
      
      y += 10;
      
      doc.rect(50, y, 495, 25).fill('#1F2937');
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
      doc.text('CONCEPTO', 60, y + 8);
      doc.text('CANT.', 330, y + 8);
      doc.text('P.UNIT.', 380, y + 8);
      doc.text('TOTAL', 460, y + 8);
      y += 25;
      
      for (const item of data.items) {
        const rowHeight = item.details ? 35 : 25;
        doc.rect(50, y, 495, rowHeight).fillAndStroke('#FFFFFF', '#E5E7EB');
        
        doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK)
          .text(item.description, 60, y + 6, { width: 260 });
        
        if (item.details) {
          doc.font('Helvetica').fontSize(7).fillColor(BRAND_GRAY)
            .text(item.details, 60, y + 18, { width: 260 });
        }
        
        doc.font('Helvetica').fontSize(9).fillColor(BRAND_DARK);
        doc.text(item.quantity.toString(), 340, y + 8);
        doc.text(formatCurrency(item.unitPrice, data.currency), 370, y + 8);
        doc.text(formatCurrency(item.total, data.currency), 450, y + 8);
        
        y += rowHeight;
      }
      
      y += 5;
      
      if (data.discount && data.discount.amount > 0) {
        doc.rect(50, y, 495, 28).fillAndStroke('#ECFDF5', '#10B981');
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#059669');
        
        let discountText = 'Descuento aplicado';
        if (data.discount.code) {
          discountText += `: ${data.discount.code}`;
        }
        if (data.discount.type === 'percentage' && data.discount.value) {
          discountText += ` (${data.discount.value}%)`;
        }
        
        doc.text(discountText, 60, y + 9);
        doc.text(`-${formatCurrency(data.discount.amount, data.currency)}`, 450, y + 9);
        y += 33;
      }
      
      const totalsX = 350;
      doc.rect(totalsX, y, 195, 55).fill(BRAND_LIGHT_GRAY);
      
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY);
      doc.text('Subtotal:', totalsX + 10, y + 8);
      doc.text(formatCurrency(data.subtotal, data.currency), totalsX + 120, y + 8);
      
      if (data.discount && data.discount.amount > 0) {
        doc.fillColor('#059669').text('Descuento:', totalsX + 10, y + 22);
        doc.text(`-${formatCurrency(data.discount.amount, data.currency)}`, totalsX + 120, y + 22);
      }
      
      doc.rect(totalsX, y + 35, 195, 30).fill(BRAND_GREEN);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text('TOTAL:', totalsX + 10, y + 43);
      doc.font('Helvetica-Bold').fontSize(14).text(formatCurrency(data.total, data.currency), totalsX + 100, y + 41);
      
      const statusColors: Record<string, string> = {
        'pending': '#F59E0B',
        'paid': '#10B981',
        'completed': '#10B981',
        'cancelled': '#EF4444',
        'refunded': '#8B5CF6'
      };
      
      doc.rect(50, y + 5, 90, 28).fillAndStroke(BRAND_LIGHT_GREEN, statusColors[data.status] || '#10B981');
      doc.font('Helvetica-Bold').fontSize(10).fillColor(statusColors[data.status] || '#10B981')
        .text(getStatusText(data.status), 55, y + 13, { width: 80, align: 'center' });
      
      y += 75;
      
      if (data.paymentMethod || data.bankDetails) {
        doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text('INFORMACION DE PAGO:', 50, y);
        y += 14;
        
        doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY);
        
        if (data.paymentMethod) {
          doc.text(`Forma de pago: ${getPaymentMethodText(data.paymentMethod)}`, 50, y);
          y += 11;
        }
        
        if (data.paymentDate) {
          doc.text(`Fecha de pago: ${formatDate(data.paymentDate)}`, 50, y);
          y += 11;
        }
        
        if (data.bankDetails) {
          if (data.bankDetails.bankName) {
            doc.text(`Banco: ${data.bankDetails.bankName}`, 50, y);
            y += 11;
          }
          if (data.bankDetails.iban) {
            doc.text(`IBAN: ${data.bankDetails.iban}`, 50, y);
            y += 11;
          }
          if (data.bankDetails.swift) {
            doc.text(`SWIFT/BIC: ${data.bankDetails.swift}`, 50, y);
            y += 11;
          }
          if (data.bankDetails.accountHolder) {
            doc.text(`Titular: ${data.bankDetails.accountHolder}`, 50, y);
            y += 11;
          }
        }
        y += 5;
      }
      
      if (data.notes) {
        doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('Notas:', 50, y);
        doc.font('Helvetica').fontSize(8).text(data.notes, 50, y + 10, { width: 495 });
      }

      drawFooter(doc);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateReceiptPdf(data: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        bufferPages: true,
        info: {
          Title: `Recibo ${data.requestCode}`,
          Author: 'Easy US LLC',
          Subject: `Recibo de pago para ${data.customer.name}`,
          Creator: 'Easy US LLC PDF Generator'
        }
      });
      
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      let y = drawHeader(doc);

      doc.font('Helvetica-Bold').fontSize(22).fillColor(BRAND_DARK)
        .text(data.isMaintenance ? 'RECIBO - MANTENIMIENTO' : 'RECIBO DE PAGO', 50, y);
      doc.moveTo(50, y + 28).lineTo(280, y + 28).strokeColor(BRAND_GREEN).lineWidth(3).stroke();
      
      doc.rect(380, y - 5, 165, 50).fill(BRAND_GREEN);
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_DARK).text('CODIGO SOLICITUD', 400, y + 2);
      doc.font('Helvetica-Bold').fontSize(12).text(data.requestCode, 390, y + 14, { width: 155, align: 'center' });
      doc.font('Helvetica').fontSize(8).text(`Pedido: ${data.orderNumber}`, 390, y + 30, { width: 155, align: 'center' });
      
      y += 55;
      
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY);
      doc.text(`Fecha: ${formatDate(data.date)}`, 50, y);
      if (data.paymentDate) {
        doc.text(`Pagado: ${formatDate(data.paymentDate)}`, 150, y);
      }
      y += 20;

      y = drawCustomerInfo(doc, data.customer, y);
      
      y += 10;
      
      if (data.llcDetails && (data.llcDetails.companyName || data.llcDetails.state)) {
        doc.rect(50, y, 495, 75).fillAndStroke('#F0FDF4', '#86EFAC');
        
        doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK)
          .text('DATOS DE LA LLC:', 60, y + 8);
        
        let col1Y = y + 22;
        let col2Y = y + 22;
        
        if (data.llcDetails.companyName) {
          doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text('Nombre:', 60, col1Y);
          doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK)
            .text(`${data.llcDetails.companyName}${data.llcDetails.designator ? ` ${data.llcDetails.designator}` : ''}`, 105, col1Y);
          col1Y += 13;
        }
        
        if (data.llcDetails.state) {
          doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text('Estado:', 60, col1Y);
          doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text(data.llcDetails.state, 105, col1Y);
          col1Y += 13;
        }
        
        if (data.llcDetails.ein) {
          doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text('EIN:', 60, col1Y);
          doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text(data.llcDetails.ein, 105, col1Y);
        }
        
        if (data.llcDetails.creationDate) {
          doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text('Constitucion:', 300, col2Y);
          doc.font('Helvetica').fontSize(9).fillColor(BRAND_DARK).text(formatDate(data.llcDetails.creationDate), 370, col2Y);
          col2Y += 13;
        }
        
        if (data.llcDetails.registeredAgent) {
          doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY).text('Agente:', 300, col2Y);
          doc.font('Helvetica').fontSize(9).fillColor(BRAND_DARK).text(data.llcDetails.registeredAgent, 340, col2Y);
        }
        
        y += 85;
      }
      
      doc.rect(50, y, 495, 80).fillAndStroke('#FFFFFF', '#E5E7EB');
      
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK)
        .text('SERVICIO CONTRATADO:', 60, y + 8);
      
      doc.font('Helvetica-Bold').fontSize(12).fillColor(BRAND_DARK)
        .text(data.service.name, 60, y + 24);
      
      if (data.service.description) {
        doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY)
          .text(data.service.description, 60, y + 40, { width: 340 });
      }
      
      if (data.service.state) {
        doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY)
          .text(`Estado: ${data.service.state}`, 60, y + 55);
      }
      
      doc.rect(400, y + 20, 135, 45).fill(BRAND_GREEN);
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_DARK).text('TOTAL PAGADO', 420, y + 28);
      doc.font('Helvetica-Bold').fontSize(16).text(formatCurrency(data.amount, data.currency), 410, y + 42, { width: 115, align: 'center' });
      
      y += 90;
      
      if (data.paymentMethod || data.transactionId || data.bankDetails) {
        doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK).text('DETALLES DEL PAGO:', 50, y);
        y += 14;
        
        doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY);
        
        if (data.paymentMethod) {
          doc.text(`Forma de pago: ${getPaymentMethodText(data.paymentMethod)}`, 50, y);
          y += 11;
        }
        
        if (data.transactionId) {
          doc.text(`ID Transaccion: ${data.transactionId}`, 50, y);
          y += 11;
        }
        
        if (data.bankDetails?.bankName) {
          doc.text(`Banco: ${data.bankDetails.bankName}`, 50, y);
          y += 11;
        }
        
        if (data.bankDetails?.iban) {
          doc.text(`IBAN destino: ${data.bankDetails.iban}`, 50, y);
          y += 11;
        }
        
        y += 10;
      }
      
      doc.rect(50, y, 495, 45).fill(BRAND_LIGHT_GREEN);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#059669')
        .text('¡Gracias por confiar en Easy US LLC!', 50, y + 10, { align: 'center', width: 495 });
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY)
        .text('Estamos procesando tu solicitud. Te mantendremos informado de cada avance.', 50, y + 26, { align: 'center', width: 495 });
      
      if (data.notes) {
        y += 55;
        doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('Notas:', 50, y);
        doc.font('Helvetica').fontSize(8).text(data.notes, 50, y + 10, { width: 495 });
      }

      drawFooter(doc);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateCustomInvoicePdf(data: CustomInvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        bufferPages: true,
        info: {
          Title: `Factura ${data.invoiceNumber}`,
          Author: 'Easy US LLC',
          Subject: `Factura libre para ${data.customer.name}`,
          Creator: 'Easy US LLC PDF Generator'
        }
      });
      
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      let y = drawHeader(doc);

      doc.font('Helvetica-Bold').fontSize(22).fillColor(BRAND_DARK).text('FACTURA', 50, y);
      doc.moveTo(50, y + 28).lineTo(180, y + 28).strokeColor(BRAND_GREEN).lineWidth(3).stroke();
      
      doc.rect(380, y, 165, 40).fill(BRAND_GREEN);
      doc.font('Helvetica').fontSize(8).fillColor(BRAND_DARK).text('N° FACTURA', 405, y + 6);
      doc.font('Helvetica-Bold').fontSize(14).text(data.invoiceNumber, 395, y + 18, { width: 155, align: 'center' });
      
      y += 50;
      
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY);
      doc.text(`Fecha de emision: ${formatDate(data.date)}`, 50, y);
      y += 20;

      y = drawCustomerInfo(doc, data.customer, y);
      drawCompanyInfo(doc, y - 95);
      
      y += 15;
      
      doc.rect(50, y, 495, 25).fill('#1F2937');
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
      doc.text('CONCEPTO', 60, y + 8);
      doc.text('IMPORTE', 460, y + 8);
      y += 25;
      
      const rowHeight = data.description ? 45 : 30;
      doc.rect(50, y, 495, rowHeight).fillAndStroke('#FFFFFF', '#E5E7EB');
      
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK)
        .text(data.concept, 60, y + 8, { width: 380 });
      
      if (data.description) {
        doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY)
          .text(data.description, 60, y + 22, { width: 380 });
      }
      
      doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_DARK)
        .text(formatCurrency(data.amount, data.currency), 450, y + 12);
      
      y += rowHeight + 15;
      
      doc.rect(350, y, 195, 40).fill(BRAND_GREEN);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK).text('TOTAL:', 360, y + 8);
      doc.font('Helvetica-Bold').fontSize(16).text(formatCurrency(data.amount, data.currency), 360, y + 22);
      
      const statusColor = data.status === 'paid' ? '#10B981' : '#F59E0B';
      doc.rect(50, y + 5, 90, 28).fillAndStroke(BRAND_LIGHT_GREEN, statusColor);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(statusColor)
        .text(getStatusText(data.status), 55, y + 13, { width: 80, align: 'center' });
      
      y += 55;
      
      if (data.paymentMethod) {
        doc.font('Helvetica').fontSize(8).fillColor(BRAND_GRAY)
          .text(`Forma de pago: ${getPaymentMethodText(data.paymentMethod)}`, 50, y);
        y += 15;
      }
      
      if (data.notes) {
        doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_GRAY).text('Notas:', 50, y);
        doc.font('Helvetica').fontSize(8).text(data.notes, 50, y + 10, { width: 495 });
      }

      drawFooter(doc);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateOrderInvoice(orderData: {
  order: {
    id: number;
    invoiceNumber?: string | null;
    amount: number;
    originalAmount?: number | null;
    discountCode?: string | null;
    discountAmount?: number | null;
    currency: string;
    status: string;
    createdAt?: Date | null;
  };
  product: {
    name: string;
    description: string;
    features?: string[];
  };
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
  };
  application?: {
    ownerFullName?: string | null;
    ownerEmail?: string | null;
    ownerPhone?: string | null;
    ownerIdType?: string | null;
    ownerIdNumber?: string | null;
    ownerStreetType?: string | null;
    ownerAddress?: string | null;
    ownerCity?: string | null;
    ownerProvince?: string | null;
    ownerPostalCode?: string | null;
    ownerCountry?: string | null;
    paymentMethod?: string | null;
    state?: string | null;
  } | null;
  maintenanceApplication?: {
    ownerFullName?: string | null;
    ownerEmail?: string | null;
    ownerPhone?: string | null;
    state?: string | null;
    paymentMethod?: string | null;
  } | null;
}): Promise<Buffer> {
  const app = orderData.application || orderData.maintenanceApplication;
  const isMaintenance = !!orderData.maintenanceApplication;
  
  const customerName = app?.ownerFullName || 
    [orderData.user.firstName, orderData.user.lastName].filter(Boolean).join(' ') || 
    orderData.user.email.split('@')[0];
  
  const llcApp = orderData.application;
  
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
      details: orderData.product.features?.slice(0, 4).join(' • ') || orderData.product.description.substring(0, 100),
      quantity: 1,
      unitPrice: orderData.order.originalAmount || orderData.order.amount,
      total: orderData.order.originalAmount || orderData.order.amount
    }],
    subtotal: orderData.order.originalAmount || orderData.order.amount,
    discount: orderData.order.discountAmount && orderData.order.discountAmount > 0 ? {
      code: orderData.order.discountCode || undefined,
      amount: orderData.order.discountAmount
    } : undefined,
    total: orderData.order.amount,
    currency: orderData.order.currency,
    status: orderData.order.status === 'paid' || orderData.order.status === 'completed' ? 'paid' : 'pending',
    paymentMethod: (app?.paymentMethod as 'transfer' | 'link') || undefined,
    isMaintenance
  };
  
  return generateInvoicePdf(invoiceData);
}

export function generateOrderReceipt(orderData: {
  order: {
    id: number;
    invoiceNumber?: string | null;
    amount: number;
    currency: string;
    status: string;
    createdAt?: Date | null;
  };
  product: {
    name: string;
    description: string;
    features?: string[];
  };
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
  };
  application?: {
    requestCode?: string | null;
    ownerFullName?: string | null;
    ownerEmail?: string | null;
    ownerPhone?: string | null;
    ownerIdType?: string | null;
    ownerIdNumber?: string | null;
    ownerStreetType?: string | null;
    ownerAddress?: string | null;
    ownerCity?: string | null;
    ownerProvince?: string | null;
    ownerPostalCode?: string | null;
    ownerCountry?: string | null;
    companyName?: string | null;
    designator?: string | null;
    state?: string | null;
    paymentMethod?: string | null;
    llcCreatedDate?: Date | null;
  } | null;
  maintenanceApplication?: {
    requestCode?: string | null;
    ownerFullName?: string | null;
    ownerEmail?: string | null;
    ownerPhone?: string | null;
    companyName?: string | null;
    ein?: string | null;
    state?: string | null;
    creationYear?: string | null;
    paymentMethod?: string | null;
    bankAccount?: string | null;
  } | null;
}): Promise<Buffer> {
  const app = orderData.application;
  const maintApp = orderData.maintenanceApplication;
  const isMaintenance = !!maintApp;
  const currentApp = app || maintApp;
  
  const customerName = currentApp?.ownerFullName || 
    [orderData.user.firstName, orderData.user.lastName].filter(Boolean).join(' ') || 
    orderData.user.email.split('@')[0];
  
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
      country: app?.ownerCountry || undefined,
      clientId: orderData.user.email.split('@')[0].substring(0, 8).toUpperCase()
    },
    service: {
      name: orderData.product.name,
      description: orderData.product.features?.join(' • ') || orderData.product.description,
      state: app?.state || maintApp?.state || undefined
    },
    llcDetails: isMaintenance ? {
      companyName: maintApp?.companyName || undefined,
      state: maintApp?.state || undefined,
      ein: maintApp?.ein || undefined,
      creationDate: maintApp?.creationYear || undefined
    } : app ? {
      companyName: app.companyName || undefined,
      designator: app.designator || undefined,
      state: app.state || undefined,
      creationDate: app.llcCreatedDate?.toISOString() || undefined,
      registeredAgent: 'Easy US LLC'
    } : undefined,
    amount: orderData.order.amount,
    currency: orderData.order.currency,
    paymentMethod: currentApp?.paymentMethod || undefined,
    paymentDate: orderData.order.createdAt?.toISOString(),
    bankDetails: maintApp?.bankAccount ? {
      iban: maintApp.bankAccount
    } : undefined,
    isMaintenance
  };
  
  return generateReceiptPdf(receiptData);
}
