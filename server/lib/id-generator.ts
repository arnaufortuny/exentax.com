import { db } from "../db";
import { users, llcApplications, maintenanceApplications, messages, userNotifications, applicationDocuments, consultationBookings, orders } from "@shared/schema";
import { eq } from "drizzle-orm";

export function generate8DigitId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

export async function generateUniqueClientId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const clientId = generate8DigitId();
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.clientId, clientId)).limit(1);
    if (existing.length === 0) {
      return clientId;
    }
    attempts++;
  }
  
  return Date.now().toString().slice(-8);
}

export function generateOrderCode(state: string): string {
  const statePrefix = getStatePrefix(state);
  const digits = generate8DigitId();
  return `${statePrefix}-${digits}`;
}

export function getStatePrefix(state: string): string {
  const stateMap: Record<string, string> = {
    'New Mexico': 'NM',
    'new mexico': 'NM',
    'nm': 'NM',
    'Wyoming': 'WY',
    'wyoming': 'WY',
    'wy': 'WY',
    'Delaware': 'DE',
    'delaware': 'DE',
    'de': 'DE',
  };
  return stateMap[state] || stateMap[state.toLowerCase()] || 'US';
}

export async function generateUniqueOrderCode(state: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const code = generateOrderCode(state);
    
    const existingLlc = await db.select({ id: llcApplications.id })
      .from(llcApplications)
      .where(eq(llcApplications.requestCode, code))
      .limit(1);
    
    const existingMaint = await db.select({ id: maintenanceApplications.id })
      .from(maintenanceApplications)
      .where(eq(maintenanceApplications.requestCode, code))
      .limit(1);
    
    if (existingLlc.length === 0 && existingMaint.length === 0) {
      return code;
    }
    attempts++;
  }
  
  const timestamp = Date.now().toString().slice(-8);
  return `${getStatePrefix(state)}-${timestamp}`;
}

export async function generateUniqueTicketId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const ticketId = generate8DigitId();
    
    const existingNotif = await db.select({ id: userNotifications.id })
      .from(userNotifications)
      .where(eq(userNotifications.ticketId, ticketId))
      .limit(1);
    
    if (existingNotif.length === 0) {
      return ticketId;
    }
    attempts++;
  }
  
  return Date.now().toString().slice(-8);
}

export async function generateUniqueMessageId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const messageId = generate8DigitId();
    
    const existing = await db.select({ id: messages.id })
      .from(messages)
      .where(eq(messages.messageId, messageId))
      .limit(1);
    
    if (existing.length === 0) {
      return messageId;
    }
    attempts++;
  }
  
  return Date.now().toString().slice(-8);
}

export function generateDocumentId(): string {
  return generate8DigitId();
}

export function formatOrderDisplay(requestCode: string | null | undefined): string {
  if (requestCode) {
    return requestCode;
  }
  return 'N/A';
}

export async function generateUniqueBookingCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const bookingCode = `CON-${generate8DigitId()}`;
    
    const existing = await db.select({ id: consultationBookings.id })
      .from(consultationBookings)
      .where(eq(consultationBookings.bookingCode, bookingCode))
      .limit(1);
    
    if (existing.length === 0) {
      return bookingCode;
    }
    attempts++;
  }
  
  return `CON-${Date.now().toString().slice(-8)}`;
}

export async function generateUniqueAdminOrderCode(state: string): Promise<string> {
  const statePrefix = getStatePrefix(state);
  const year = new Date().getFullYear();
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const digits = generate8DigitId();
    const code = `${statePrefix}-${year}-${digits}`;
    
    const existingLlc = await db.select({ id: llcApplications.id })
      .from(llcApplications)
      .where(eq(llcApplications.requestCode, code))
      .limit(1);
    
    const existingMaint = await db.select({ id: maintenanceApplications.id })
      .from(maintenanceApplications)
      .where(eq(maintenanceApplications.requestCode, code))
      .limit(1);
    
    const existingOrder = await db.select({ id: orders.id })
      .from(orders)
      .where(eq(orders.invoiceNumber, code))
      .limit(1);
    
    if (existingLlc.length === 0 && existingMaint.length === 0 && existingOrder.length === 0) {
      return code;
    }
    attempts++;
  }
  
  return `${statePrefix}-${year}-${Date.now().toString().slice(-8)}`;
}

export async function generateUniqueInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const digits = generate8DigitId();
    const invoiceNum = `INV-${year}-${digits}`;
    
    const existing = await db.select({ id: orders.id })
      .from(orders)
      .where(eq(orders.invoiceNumber, invoiceNum))
      .limit(1);
    
    if (existing.length === 0) {
      return invoiceNum;
    }
    attempts++;
  }
  
  return `INV-${year}-${Date.now().toString().slice(-8)}`;
}

export function generateDocRequestId(): string {
  return generate8DigitId();
}
