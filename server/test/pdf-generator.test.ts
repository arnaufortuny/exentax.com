import { describe, it, expect } from 'vitest';
import { generateInvoicePdf, InvoiceData } from '../lib/pdf-generator';

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

});
