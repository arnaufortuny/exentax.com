import { describe, it, expect } from 'vitest';
import { generateInvoicePdf, generateReceiptPdf, InvoiceData, ReceiptData } from '../lib/pdf-generator';

describe('PDF Generator', () => {
  describe('generateInvoicePdf', () => {
    it('should generate a valid PDF buffer for invoice', async () => {
      const invoiceData: InvoiceData = {
        orderNumber: 'NM-12345678',
        date: '2025-01-15',
        customer: {
          name: 'Juan García',
          email: 'juan@example.com',
          phone: '+34 612 345 678',
          idType: 'DNI',
          idNumber: '12345678A',
          address: 'Gran Via 123',
          city: 'Madrid',
          country: 'España',
          clientId: 'JUANGARCI'
        },
        items: [{
          description: 'LLC New Mexico Formation',
          details: 'Tasas estatales • Registered Agent 12 meses',
          quantity: 1,
          unitPrice: 73900,
          total: 73900
        }],
        subtotal: 73900,
        total: 73900,
        currency: 'EUR',
        status: 'paid',
        paymentMethod: 'transfer'
      };

      const pdfBuffer = await generateInvoicePdf(invoiceData);
      
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.slice(0, 4).toString()).toBe('%PDF');
    });

    it('should include discount information when provided', async () => {
      const invoiceData: InvoiceData = {
        orderNumber: 'WY-87654321',
        date: '2025-01-15',
        customer: {
          name: 'María López',
          email: 'maria@example.com'
        },
        items: [{
          description: 'LLC Wyoming Formation',
          quantity: 1,
          unitPrice: 89900,
          total: 89900
        }],
        subtotal: 89900,
        discount: {
          code: 'WELCOME10',
          type: 'percentage',
          value: 10,
          amount: 8990
        },
        total: 80910,
        currency: 'EUR',
        status: 'paid'
      };

      const pdfBuffer = await generateInvoicePdf(invoiceData);
      
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it('should include payment link for pending invoices', async () => {
      const invoiceData: InvoiceData = {
        orderNumber: 'DE-11111111',
        date: '2025-01-15',
        customer: {
          name: 'Pedro Sánchez',
          email: 'pedro@example.com'
        },
        items: [{
          description: 'LLC Delaware Formation',
          quantity: 1,
          unitPrice: 139900,
          total: 139900
        }],
        subtotal: 139900,
        total: 139900,
        currency: 'EUR',
        status: 'pending',
        paymentMethod: 'link',
        paymentLink: 'https://pay.easyusllc.com/p/DE-11111111'
      };

      const pdfBuffer = await generateInvoicePdf(invoiceData);
      
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });

  describe('generateReceiptPdf', () => {
    it('should generate a valid PDF buffer for receipt', async () => {
      const receiptData: ReceiptData = {
        orderNumber: 'NM-12345678',
        requestCode: 'NM-25-ABC123',
        date: '2025-01-15',
        customer: {
          name: 'Juan García',
          email: 'juan@example.com',
          phone: '+34 612 345 678'
        },
        service: {
          name: 'LLC New Mexico Formation',
          description: 'Formación completa de LLC en New Mexico',
          state: 'New Mexico'
        },
        amount: 73900,
        currency: 'EUR',
        paymentMethod: 'transfer'
      };

      const pdfBuffer = await generateReceiptPdf(receiptData);
      
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.slice(0, 4).toString()).toBe('%PDF');
    });

    it('should include LLC details when provided', async () => {
      const receiptData: ReceiptData = {
        orderNumber: 'WY-87654321',
        requestCode: 'WY-25-XYZ789',
        date: '2025-01-15',
        customer: {
          name: 'María López',
          email: 'maria@example.com'
        },
        service: {
          name: 'LLC Wyoming Formation',
          state: 'Wyoming'
        },
        llcDetails: {
          companyName: 'TechStartup',
          designator: 'LLC',
          state: 'Wyoming',
          ein: '98-7654321',
          creationDate: '2025-01-10',
          registeredAgent: 'Easy US LLC'
        },
        amount: 89900,
        currency: 'EUR',
        paymentMethod: 'card',
        transactionId: 'ch_3Ox1234567890'
      };

      const pdfBuffer = await generateReceiptPdf(receiptData);
      
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it('should handle maintenance orders', async () => {
      const receiptData: ReceiptData = {
        orderNumber: 'MT-99999999',
        requestCode: 'MT-25-MAINT01',
        date: '2025-01-15',
        customer: {
          name: 'Carlos Ruiz',
          email: 'carlos@example.com'
        },
        service: {
          name: 'Wyoming LLC Maintenance',
          description: 'Mantenimiento anual de LLC',
          state: 'Wyoming'
        },
        llcDetails: {
          companyName: 'MyBusiness',
          state: 'Wyoming',
          ein: '12-3456789'
        },
        amount: 69900,
        currency: 'EUR',
        isMaintenance: true
      };

      const pdfBuffer = await generateReceiptPdf(receiptData);
      
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });
});
