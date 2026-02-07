import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const applicationFormSchema = z.object({
  ownerFullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  ownerPhone: z.string().min(9, 'El teléfono debe tener al menos 9 dígitos'),
  ownerEmail: z.string().email('Email inválido'),
  ownerBirthDate: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  ownerIdType: z.enum(['DNI', 'NIE', 'Passport']),
  ownerIdNumber: z.string().min(5, 'El número de documento debe tener al menos 5 caracteres'),
  ownerCountryResidency: z.string().min(1, 'El país de residencia es obligatorio'),
  ownerAddress: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  companyName: z.string().min(2, 'El nombre de empresa debe tener al menos 2 caracteres'),
  businessActivity: z.string().min(5, 'Describe la actividad del negocio'),
  businessCategory: z.string().min(1, 'Selecciona una categoría'),
  needsBankAccount: z.enum(['Mercury', 'Relay', 'No', 'Yes']),
  notes: z.string().optional(),
  dataProcessingConsent: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar el tratamiento de datos' }) }),
  termsConsent: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar los términos y condiciones' }) }),
});

describe('Application Form Validation', () => {
  it('should validate a complete valid form', () => {
    const validData = {
      ownerFullName: 'Juan García',
      ownerPhone: '+34612345678',
      ownerEmail: 'juan@example.com',
      ownerBirthDate: '1990-01-15',
      ownerIdType: 'DNI' as const,
      ownerIdNumber: '12345678A',
      ownerCountryResidency: 'España',
      ownerAddress: 'Calle Mayor 123, Madrid',
      companyName: 'Mi Empresa LLC',
      businessActivity: 'Desarrollo de software y consultoría tecnológica',
      businessCategory: 'Tecnología y Software',
      needsBankAccount: 'Mercury' as const,
      notes: '',
      dataProcessingConsent: true as const,
      termsConsent: true as const,
    };

    const result = applicationFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail with invalid email', () => {
    const invalidData = {
      ownerFullName: 'Juan García',
      ownerPhone: '+34612345678',
      ownerEmail: 'invalid-email',
      ownerBirthDate: '1990-01-15',
      ownerIdType: 'DNI' as const,
      ownerIdNumber: '12345678A',
      ownerCountryResidency: 'España',
      ownerAddress: 'Calle Mayor 123, Madrid',
      companyName: 'Mi Empresa LLC',
      businessActivity: 'Desarrollo de software',
      businessCategory: 'Tecnología y Software',
      needsBankAccount: 'Mercury' as const,
      dataProcessingConsent: true as const,
      termsConsent: true as const,
    };

    const result = applicationFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('ownerEmail');
    }
  });

  it('should fail without consent', () => {
    const noConsentData = {
      ownerFullName: 'Juan García',
      ownerPhone: '+34612345678',
      ownerEmail: 'juan@example.com',
      ownerBirthDate: '1990-01-15',
      ownerIdType: 'DNI' as const,
      ownerIdNumber: '12345678A',
      ownerCountryResidency: 'España',
      ownerAddress: 'Calle Mayor 123, Madrid',
      companyName: 'Mi Empresa LLC',
      businessActivity: 'Desarrollo de software',
      businessCategory: 'Tecnología y Software',
      needsBankAccount: 'Mercury' as const,
      dataProcessingConsent: false,
      termsConsent: true as const,
    };

    const result = applicationFormSchema.safeParse(noConsentData);
    expect(result.success).toBe(false);
  });

  it('should fail with short phone number', () => {
    const shortPhoneData = {
      ownerFullName: 'Juan García',
      ownerPhone: '12345',
      ownerEmail: 'juan@example.com',
      ownerBirthDate: '1990-01-15',
      ownerIdType: 'DNI' as const,
      ownerIdNumber: '12345678A',
      ownerCountryResidency: 'España',
      ownerAddress: 'Calle Mayor 123, Madrid',
      companyName: 'Mi Empresa LLC',
      businessActivity: 'Desarrollo de software',
      businessCategory: 'Tecnología y Software',
      needsBankAccount: 'Mercury' as const,
      dataProcessingConsent: true as const,
      termsConsent: true as const,
    };

    const result = applicationFormSchema.safeParse(shortPhoneData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('ownerPhone');
    }
  });
});

describe('Email Validation', () => {
  const emailSchema = z.string().email();

  it('should accept valid emails', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.org',
      'user+tag@example.co.uk',
    ];

    validEmails.forEach(email => {
      expect(emailSchema.safeParse(email).success).toBe(true);
    });
  });

  it('should reject invalid emails', () => {
    const invalidEmails = [
      'invalid',
      'test@',
      '@example.com',
      'test..test@example.com',
    ];

    invalidEmails.forEach(email => {
      expect(emailSchema.safeParse(email).success).toBe(false);
    });
  });
});

describe('Order Amount Validation', () => {
  const orderSchema = z.object({
    amount: z.number().positive('El importe debe ser positivo'),
    currency: z.enum(['EUR', 'USD']),
    status: z.enum(['pending', 'processing', 'paid', 'completed', 'cancelled']),
  });

  it('should validate valid order data', () => {
    const validOrder = {
      amount: 73900,
      currency: 'EUR' as const,
      status: 'pending' as const,
    };

    expect(orderSchema.safeParse(validOrder).success).toBe(true);
  });

  it('should reject negative amounts', () => {
    const negativeOrder = {
      amount: -100,
      currency: 'EUR' as const,
      status: 'pending' as const,
    };

    expect(orderSchema.safeParse(negativeOrder).success).toBe(false);
  });
});
