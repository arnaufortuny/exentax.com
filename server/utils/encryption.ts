import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;
const HASH_ALGORITHM = "sha256";

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  const isProduction = process.env.NODE_ENV === "production";
  
  if (!key && isProduction) {
    throw new Error("ENCRYPTION_KEY environment variable is required in production");
  }
  
  if (!key) {
    console.warn("⚠️ Using fallback encryption key for development. Set ENCRYPTION_KEY in production.");
    return Buffer.from("dev_fallback_key_32_chars_long!!".slice(0, 32));
  }
  
  if (key.length < 32) {
    throw new Error("ENCRYPTION_KEY must be at least 32 characters long");
  }
  
  return Buffer.from(key.slice(0, 32));
}

export function encrypt(text: string): string {
  if (!text) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(text, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string): string {
  if (!text || !text.includes(":")) return text;
  try {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
  } catch (error) {
    console.error("[ENCRYPTION] Decrypt error - returning original text");
    return text;
  }
}

export function encryptBuffer(buffer: Buffer): { encrypted: Buffer; iv: string } {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return { encrypted, iv: iv.toString("hex") };
}

export function decryptBuffer(encryptedBuffer: Buffer, ivHex: string): Buffer {
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
}

export function generateFileHash(buffer: Buffer): string {
  return crypto.createHash(HASH_ALGORITHM).update(buffer).digest("hex");
}

export function verifyFileIntegrity(buffer: Buffer, expectedHash: string): boolean {
  const actualHash = generateFileHash(buffer);
  return actualHash === expectedHash;
}

export function encryptSensitiveField(value: string | null | undefined): string | null {
  if (!value || value.trim() === "") return null;
  return encrypt(value);
}

export function decryptSensitiveField(value: string | null | undefined): string | null {
  if (!value) return null;
  return decrypt(value);
}

export interface EncryptedFileMetadata {
  iv: string;
  hash: string;
  originalSize: number;
  encryptedAt: string;
}

export function encryptFileWithMetadata(buffer: Buffer): { 
  encryptedBuffer: Buffer; 
  metadata: EncryptedFileMetadata;
} {
  const hash = generateFileHash(buffer);
  const { encrypted, iv } = encryptBuffer(buffer);
  
  return {
    encryptedBuffer: encrypted,
    metadata: {
      iv,
      hash,
      originalSize: buffer.length,
      encryptedAt: new Date().toISOString()
    }
  };
}

export function decryptFileWithVerification(
  encryptedBuffer: Buffer, 
  metadata: EncryptedFileMetadata
): { buffer: Buffer; verified: boolean } {
  const decrypted = decryptBuffer(encryptedBuffer, metadata.iv);
  const verified = verifyFileIntegrity(decrypted, metadata.hash);
  
  if (!verified) {
    console.error("[ENCRYPTION] File integrity verification failed!");
  }
  
  return { buffer: decrypted, verified };
}

export function maskSensitiveData(value: string, visibleChars: number = 4): string {
  if (!value || value.length <= visibleChars) return "****";
  return "*".repeat(value.length - visibleChars) + value.slice(-visibleChars);
}

export function isEncrypted(text: string): boolean {
  if (!text) return false;
  const parts = text.split(":");
  if (parts.length !== 2) return false;
  return /^[a-f0-9]{32}$/.test(parts[0]);
}
