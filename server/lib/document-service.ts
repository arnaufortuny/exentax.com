import { db } from "../db";
import { documentAccessLogs, applicationDocuments } from "@shared/schema";
import { eq } from "drizzle-orm";
import { 
  encryptFileWithMetadata, 
  decryptFileWithVerification, 
  generateFileHash,
  type EncryptedFileMetadata 
} from "../utils/encryption";

export type DocumentAction = "view" | "download" | "upload" | "delete";

interface LogDocumentAccessParams {
  documentId: number;
  userId?: string;
  action: DocumentAction;
  ip?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export async function logDocumentAccess(params: LogDocumentAccessParams): Promise<void> {
  try {
    await db.insert(documentAccessLogs).values({
      documentId: params.documentId,
      userId: params.userId || null,
      action: params.action,
      ip: params.ip || null,
      userAgent: params.userAgent || null,
      success: params.success !== false,
      errorMessage: params.errorMessage || null,
      metadata: params.metadata || null,
    });
  } catch (error) {
    console.error("[DOCUMENT_SERVICE] Failed to log document access:", error);
  }
}

export async function getDocumentAccessHistory(documentId: number): Promise<any[]> {
  try {
    const logs = await db
      .select()
      .from(documentAccessLogs)
      .where(eq(documentAccessLogs.documentId, documentId))
      .orderBy(documentAccessLogs.createdAt);
    return logs;
  } catch (error) {
    console.error("[DOCUMENT_SERVICE] Failed to get access history:", error);
    return [];
  }
}

export interface SecureDocument {
  encryptedBuffer: Buffer;
  metadata: EncryptedFileMetadata;
  originalFileName: string;
  mimeType: string;
}

export function prepareDocumentForStorage(
  buffer: Buffer, 
  fileName: string, 
  mimeType: string
): SecureDocument {
  const { encryptedBuffer, metadata } = encryptFileWithMetadata(buffer);
  
  return {
    encryptedBuffer,
    metadata,
    originalFileName: fileName,
    mimeType
  };
}

export function decryptDocument(
  encryptedBuffer: Buffer, 
  metadata: EncryptedFileMetadata
): { buffer: Buffer; verified: boolean } {
  return decryptFileWithVerification(encryptedBuffer, metadata);
}

export function calculateDocumentHash(buffer: Buffer): string {
  return generateFileHash(buffer);
}

export async function updateDocumentMetadata(
  documentId: number,
  metadata: {
    encryptionIv?: string;
    fileHash?: string;
    isEncrypted?: boolean;
    originalSize?: number;
  }
): Promise<void> {
  try {
    const updateData: Record<string, any> = {};
    if (metadata.encryptionIv !== undefined) updateData.encryptionIv = metadata.encryptionIv;
    if (metadata.fileHash !== undefined) updateData.fileHash = metadata.fileHash;
    if (metadata.isEncrypted !== undefined) updateData.isEncrypted = metadata.isEncrypted;
    if (metadata.originalSize !== undefined) updateData.originalSize = metadata.originalSize;
    
    if (Object.keys(updateData).length > 0) {
      await db
        .update(applicationDocuments)
        .set(updateData)
        .where(eq(applicationDocuments.id, documentId));
    }
  } catch (error) {
    console.error("[DOCUMENT_SERVICE] Failed to update document metadata:", error);
    throw error;
  }
}

export function validateDocumentType(mimeType: string, fileName: string): boolean {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  
  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp"];
  
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  
  return allowedMimeTypes.includes(mimeType) && allowedExtensions.includes(ext);
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 255);
}

export function generateSecureFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 10);
  const ext = originalName.substring(originalName.lastIndexOf("."));
  const baseName = sanitizeFileName(originalName.replace(ext, "")).slice(0, 50);
  
  return `${baseName}_${timestamp}_${randomPart}${ext}`;
}
