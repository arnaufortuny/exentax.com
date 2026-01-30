import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

// Logo path - try multiple locations
const getLogoPath = (): string | null => {
  const possiblePaths = [
    path.join(process.cwd(), 'client/public/logo-icon.png'),
    path.join(process.cwd(), 'dist/public/logo-icon.png'),
    path.join(__dirname, '../../client/public/logo-icon.png'),
  ];
  
  for (const logoPath of possiblePaths) {
    if (fs.existsSync(logoPath)) {
      return logoPath;
    }
  }
  return null;
};

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  amount: number;
  currency: string;
  status: string;
  originalAmount?: number;
  discountAmount?: number;
  discountCode?: string;
}

interface ReceiptData {
  requestCode: string;
  date: string;
  customerName: string;
  productName: string;
  amount: number;
  currency: string;
  status: string;
  companyName?: string;
  state?: string;
  ein?: string;
  creationYear?: string;
  bankAccount?: string;
  paymentGateway?: string;
  notes?: string;
  isMaintenance?: boolean;
}

const BRAND_GREEN = '#6EDC8A';
const BRAND_DARK = '#0E1215';
const BRAND_GRAY = '#6B7280';

export function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        info: {
          Title: `Factura ${data.invoiceNumber}`,
          Author: 'Easy US LLC',
        }
      });
      
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header with logo
      doc.rect(0, 0, 595, 90).fill(BRAND_DARK);
      
      // Try to add logo
      const logoPath = getLogoPath();
      if (logoPath) {
        try {
          doc.image(logoPath, 50, 15, { width: 55, height: 55 });
          doc.font('Helvetica-Bold').fontSize(22).fillColor('#FFFFFF')
            .text('Easy US LLC', 115, 28);
          doc.font('Helvetica').fontSize(10).fillColor('#9CA3AF')
            .text('Tu socio para formar LLC en USA', 115, 52);
        } catch {
          // Fallback to text-only header
          doc.font('Helvetica-Bold').fontSize(24).fillColor('#FFFFFF')
            .text('Easy US LLC', 50, 30);
          doc.font('Helvetica').fontSize(10).fillColor('#9CA3AF')
            .text('Tu socio para formar LLC en USA', 50, 55);
        }
      } else {
        doc.font('Helvetica-Bold').fontSize(24).fillColor('#FFFFFF')
          .text('Easy US LLC', 50, 30);
        doc.font('Helvetica').fontSize(10).fillColor('#9CA3AF')
          .text('Tu socio para formar LLC en USA', 50, 55);
      }

      // Invoice title
      doc.moveDown(3);
      doc.font('Helvetica-Bold').fontSize(28).fillColor(BRAND_DARK)
        .text('FACTURA', 50, 130, { align: 'center' });
      
      // Invoice number badge
      doc.rect(220, 165, 155, 30).fill(BRAND_GREEN);
      doc.font('Helvetica-Bold').fontSize(12).fillColor(BRAND_DARK)
        .text(data.invoiceNumber, 220, 173, { width: 155, align: 'center' });

      // Invoice details
      doc.moveDown(4);
      const detailsY = 220;
      
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_GRAY)
        .text('FECHA DE EMISIÓN', 50, detailsY);
      doc.font('Helvetica').fontSize(12).fillColor(BRAND_DARK)
        .text(data.date, 50, detailsY + 15);

      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_GRAY)
        .text('CLIENTE', 300, detailsY);
      doc.font('Helvetica').fontSize(12).fillColor(BRAND_DARK)
        .text(data.customerName, 300, detailsY + 15);
      doc.font('Helvetica').fontSize(10).fillColor(BRAND_GRAY)
        .text(data.customerEmail, 300, detailsY + 30);

      // Company info
      const companyY = 300;
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_GRAY)
        .text('EMISOR', 50, companyY);
      doc.font('Helvetica').fontSize(11).fillColor(BRAND_DARK)
        .text('Easy US LLC (Fortuny Consulting LLC)', 50, companyY + 15);
      doc.font('Helvetica').fontSize(10).fillColor(BRAND_GRAY)
        .text('1209 Mountain Road Place NE, STE R', 50, companyY + 30);
      doc.font('Helvetica').fontSize(10).fillColor(BRAND_GRAY)
        .text('Albuquerque, NM 87110, USA', 50, companyY + 43);

      // Line separator
      doc.moveTo(50, 380).lineTo(545, 380).stroke(BRAND_GRAY);

      // Product table header
      const tableY = 400;
      doc.rect(50, tableY, 495, 30).fill('#F3F4F6');
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_DARK)
        .text('CONCEPTO', 60, tableY + 10);
      doc.text('ESTADO', 300, tableY + 10);
      doc.text('IMPORTE', 450, tableY + 10);

      // Product row
      doc.font('Helvetica').fontSize(11).fillColor(BRAND_DARK)
        .text(data.productName, 60, tableY + 45);
      
      // Status badge
      const statusColor = data.status === 'paid' || data.status === 'completed' ? BRAND_GREEN : '#F59E0B';
      const statusText = data.status === 'paid' ? 'PAGADO' : 
                         data.status === 'completed' ? 'COMPLETADO' : 
                         data.status.toUpperCase();
      doc.rect(295, tableY + 40, 70, 20).fill(statusColor);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND_DARK)
        .text(statusText, 295, tableY + 46, { width: 70, align: 'center' });

      doc.font('Helvetica').fontSize(12).fillColor(BRAND_DARK)
        .text(`${(data.amount / 100).toFixed(2)} ${data.currency}`, 450, tableY + 45);

      // Discount info if applicable
      let totalY = tableY + 100;
      if (data.discountAmount && data.discountAmount > 0) {
        doc.font('Helvetica').fontSize(10).fillColor(BRAND_GRAY)
          .text(`Subtotal: ${((data.originalAmount || data.amount) / 100).toFixed(2)} ${data.currency}`, 400, totalY);
        doc.font('Helvetica').fontSize(10).fillColor(BRAND_GREEN)
          .text(`Descuento${data.discountCode ? ` (${data.discountCode})` : ''}: -${(data.discountAmount / 100).toFixed(2)} ${data.currency}`, 400, totalY + 15);
        totalY += 40;
      }

      // Total box
      doc.rect(350, totalY, 195, 50).fill(BRAND_DARK);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#9CA3AF')
        .text('TOTAL FACTURADO', 360, totalY + 10);
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#FFFFFF')
        .text(`${(data.amount / 100).toFixed(2)} ${data.currency}`, 360, totalY + 25);

      // Footer
      const footerY = 720;
      doc.moveTo(50, footerY).lineTo(545, footerY).stroke('#E5E7EB');
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY)
        .text('Este documento es un comprobante oficial de pago emitido por Easy US LLC.', 50, footerY + 15, { align: 'center', width: 495 });
      doc.text('Para cualquier duda, contacte con soporte@easyusllc.com', 50, footerY + 28, { align: 'center', width: 495 });
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK)
        .text(`© ${new Date().getFullYear()} Easy US LLC. Todos los derechos reservados.`, 50, footerY + 45, { align: 'center', width: 495 });

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
        info: {
          Title: `Recibo ${data.requestCode}`,
          Author: 'Easy US LLC',
        }
      });
      
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header with logo
      doc.rect(0, 0, 595, 90).fill(BRAND_DARK);
      
      // Try to add logo
      const logoPath = getLogoPath();
      if (logoPath) {
        try {
          doc.image(logoPath, 50, 15, { width: 55, height: 55 });
          doc.font('Helvetica-Bold').fontSize(22).fillColor('#FFFFFF')
            .text('Easy US LLC', 115, 28);
          doc.font('Helvetica').fontSize(10).fillColor('#9CA3AF')
            .text('Recibo de Servicio', 115, 52);
        } catch {
          doc.font('Helvetica-Bold').fontSize(24).fillColor('#FFFFFF')
            .text('Easy US LLC', 50, 30);
          doc.font('Helvetica').fontSize(10).fillColor('#9CA3AF')
            .text('Recibo de Servicio', 50, 55);
        }
      } else {
        doc.font('Helvetica-Bold').fontSize(24).fillColor('#FFFFFF')
          .text('Easy US LLC', 50, 30);
        doc.font('Helvetica').fontSize(10).fillColor('#9CA3AF')
          .text('Recibo de Servicio', 50, 55);
      }

      // Receipt title
      doc.moveDown(3);
      doc.font('Helvetica-Bold').fontSize(24).fillColor(BRAND_DARK)
        .text('RECIBO DE PEDIDO', 50, 120, { align: 'center' });
      
      // Request code badge
      doc.rect(200, 155, 195, 30).fill(BRAND_GREEN);
      doc.font('Helvetica-Bold').fontSize(12).fillColor(BRAND_DARK)
        .text(data.requestCode, 200, 163, { width: 195, align: 'center' });

      // Details section
      const detailsY = 220;
      
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_GRAY)
        .text('FECHA', 50, detailsY);
      doc.font('Helvetica').fontSize(12).fillColor(BRAND_DARK)
        .text(data.date, 50, detailsY + 15);

      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_GRAY)
        .text('CLIENTE', 300, detailsY);
      doc.font('Helvetica').fontSize(12).fillColor(BRAND_DARK)
        .text(data.customerName, 300, detailsY + 15);

      // Maintenance/LLC specific details
      let extraDetailsY = 280;
      if (data.companyName || data.state || data.ein) {
        doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_GRAY)
          .text('DATOS DE LA LLC', 50, extraDetailsY);
        let detailLineY = extraDetailsY + 15;
        
        if (data.companyName) {
          doc.font('Helvetica').fontSize(11).fillColor(BRAND_DARK)
            .text(`Empresa: ${data.companyName}`, 50, detailLineY);
          detailLineY += 14;
        }
        if (data.state) {
          doc.font('Helvetica').fontSize(11).fillColor(BRAND_DARK)
            .text(`Estado: ${data.state}`, 50, detailLineY);
          detailLineY += 14;
        }
        if (data.ein) {
          doc.font('Helvetica').fontSize(11).fillColor(BRAND_DARK)
            .text(`EIN: ${data.ein}`, 50, detailLineY);
          detailLineY += 14;
        }
        if (data.creationYear) {
          doc.font('Helvetica').fontSize(11).fillColor(BRAND_DARK)
            .text(`Año creación: ${data.creationYear}`, 50, detailLineY);
          detailLineY += 14;
        }
        if (data.bankAccount) {
          doc.font('Helvetica').fontSize(11).fillColor(BRAND_DARK)
            .text(`Cuenta bancaria: ${data.bankAccount}`, 300, extraDetailsY + 15);
        }
        if (data.paymentGateway) {
          doc.font('Helvetica').fontSize(11).fillColor(BRAND_DARK)
            .text(`Pasarela de pago: ${data.paymentGateway}`, 300, extraDetailsY + 29);
        }
        extraDetailsY = detailLineY + 20;
      }

      // Service details
      const serviceY = data.companyName ? 380 : 300;
      doc.rect(50, serviceY, 495, 100).stroke(BRAND_GRAY);
      
      doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_DARK)
        .text('SERVICIO CONTRATADO', 70, serviceY + 20);
      doc.font('Helvetica').fontSize(14).fillColor(BRAND_DARK)
        .text(data.productName, 70, serviceY + 40);

      // Status
      const statusColor = data.status === 'paid' || data.status === 'completed' ? BRAND_GREEN : '#F59E0B';
      const statusText = data.status === 'paid' ? 'PAGADO' : 
                         data.status === 'completed' ? 'COMPLETADO' : 
                         data.status.toUpperCase();
      doc.rect(70, serviceY + 65, 80, 22).fill(statusColor);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK)
        .text(statusText, 70, serviceY + 71, { width: 80, align: 'center' });

      // Amount
      doc.font('Helvetica-Bold').fontSize(20).fillColor(BRAND_DARK)
        .text(`${(data.amount / 100).toFixed(2)} ${data.currency}`, 350, serviceY + 50);

      // Thank you message
      doc.moveDown(8);
      doc.font('Helvetica-Bold').fontSize(14).fillColor(BRAND_GREEN)
        .text('Gracias por confiar en Easy US LLC', 50, 450, { align: 'center', width: 495 });
      doc.font('Helvetica').fontSize(11).fillColor(BRAND_GRAY)
        .text('Estamos procesando tu solicitud. Te mantendremos informado del progreso.', 50, 475, { align: 'center', width: 495 });

      // Footer
      const footerY = 720;
      doc.moveTo(50, footerY).lineTo(545, footerY).stroke('#E5E7EB');
      doc.font('Helvetica').fontSize(9).fillColor(BRAND_GRAY)
        .text('Easy US LLC - 1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110', 50, footerY + 15, { align: 'center', width: 495 });
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_DARK)
        .text(`© ${new Date().getFullYear()} Easy US LLC`, 50, footerY + 30, { align: 'center', width: 495 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
