import { encrypt, decrypt, isEncrypted, maskSensitiveData } from "../utils/encryption";

export const SENSITIVE_LLC_FIELDS = [
  "ownerIdNumber",
  "ownerPhone", 
  "ownerAddress",
  "ownerBirthDate",
] as const;

export const SENSITIVE_USER_FIELDS = [
  "phone",
  "address",
] as const;

export type SensitiveLlcField = typeof SENSITIVE_LLC_FIELDS[number];
export type SensitiveUserField = typeof SENSITIVE_USER_FIELDS[number];

export function encryptSensitiveFields<T extends Record<string, any>>(
  data: T,
  fieldsToEncrypt: readonly string[]
): T {
  const result: Record<string, any> = { ...data };
  
  for (const field of fieldsToEncrypt) {
    if (field in result && result[field] && typeof result[field] === "string") {
      if (!isEncrypted(result[field])) {
        result[field] = encrypt(result[field]);
      }
    }
  }
  
  return result as T;
}

export function decryptSensitiveFields<T extends Record<string, any>>(
  data: T,
  fieldsToDecrypt: readonly string[]
): T {
  const result: Record<string, any> = { ...data };
  
  for (const field of fieldsToDecrypt) {
    if (field in result && result[field] && typeof result[field] === "string") {
      if (isEncrypted(result[field])) {
        result[field] = decrypt(result[field]);
      }
    }
  }
  
  return result as T;
}

export function maskSensitiveFields<T extends Record<string, any>>(
  data: T,
  fieldsToMask: readonly string[],
  visibleChars: number = 4
): T {
  const result: Record<string, any> = { ...data };
  
  for (const field of fieldsToMask) {
    if (field in result && result[field] && typeof result[field] === "string") {
      let value = result[field];
      if (isEncrypted(value)) {
        value = decrypt(value);
      }
      result[field] = maskSensitiveData(value, visibleChars);
    }
  }
  
  return result as T;
}

export function encryptLlcApplicationData<T extends Record<string, any>>(data: T): T {
  return encryptSensitiveFields(data, SENSITIVE_LLC_FIELDS);
}

export function decryptLlcApplicationData<T extends Record<string, any>>(data: T): T {
  return decryptSensitiveFields(data, SENSITIVE_LLC_FIELDS);
}

export function prepareLlcDataForStorage<T extends Record<string, any>>(data: T): T {
  return encryptLlcApplicationData(data);
}

export function prepareLlcDataForDisplay<T extends Record<string, any>>(
  data: T, 
  fullAccess: boolean = false
): T {
  if (fullAccess) {
    return decryptLlcApplicationData(data);
  }
  return maskSensitiveFields(decryptLlcApplicationData(data), SENSITIVE_LLC_FIELDS);
}

export function encryptValue(value: string | null | undefined): string | null {
  if (!value || value.trim() === "") return null;
  if (isEncrypted(value)) return value;
  return encrypt(value);
}

export function decryptValue(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!isEncrypted(value)) return value;
  return decrypt(value);
}

export function isSensitiveField(fieldName: string): boolean {
  return (
    SENSITIVE_LLC_FIELDS.includes(fieldName as SensitiveLlcField) ||
    SENSITIVE_USER_FIELDS.includes(fieldName as SensitiveUserField)
  );
}
