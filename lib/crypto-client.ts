'use client';

const textEncoder = new TextEncoder();

export type EncryptedPayload = {
  code: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  expiresAt: string;
  encryptedFileBase64: string;
  encryptedFileKeyBase64: string;
  fileIvBase64: string;
  keyIvBase64: string;
  saltBase64: string;
};

export type DecryptionMaterial = {
  code: string;
  encryptedFile: ArrayBuffer;
  encryptedFileKey: ArrayBuffer;
  fileIv: Uint8Array;
  keyIv: Uint8Array;
  salt: Uint8Array;
};

export function generateCode(length = 6): string {
  const digits = "0123456789";
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += digits[array[i] % digits.length];
  }
  return result;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function generateFileKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
}

async function deriveKeyFromCode(
  code: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(code),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: 210_000,
      hash: "SHA-256",
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptFileClientSide(
  file: File,
  code: string,
  ttlSeconds: number
): Promise<EncryptedPayload> {
  const fileArrayBuffer = await file.arrayBuffer();
  const fileKey = await generateFileKey();

  const fileIv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedFile = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: fileIv,
    },
    fileKey,
    fileArrayBuffer
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const kek = await deriveKeyFromCode(code, salt);
  const rawFileKey = await crypto.subtle.exportKey("raw", fileKey);
  const keyIv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedFileKey = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: keyIv,
    },
    kek,
    rawFileKey
  );

  const now = Date.now();
  const expiresAt = new Date(now + ttlSeconds * 1000).toISOString();

  return {
    code,
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
    expiresAt,
    encryptedFileBase64: arrayBufferToBase64(encryptedFile),
    encryptedFileKeyBase64: arrayBufferToBase64(encryptedFileKey),
    fileIvBase64: arrayBufferToBase64(fileIv.buffer),
    keyIvBase64: arrayBufferToBase64(keyIv.buffer),
    saltBase64: arrayBufferToBase64(salt.buffer),
  };
}

export async function decryptFileClientSide(
  material: DecryptionMaterial
): Promise<{ blob: Blob; fileType: string }> {
  const { code, encryptedFile, encryptedFileKey, fileIv, keyIv, salt } =
    material;

  const kek = await deriveKeyFromCode(code, salt);

  const rawFileKey = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: keyIv as unknown as ArrayBuffer,
    },
    kek,
    encryptedFileKey
  );

  const fileKey = await crypto.subtle.importKey(
    "raw",
    rawFileKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["decrypt"],
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: fileIv as unknown as ArrayBuffer,
    },
    fileKey,
    encryptedFile
  );

  return {
    blob: new Blob([decrypted]),
    fileType: "application/octet-stream",
  };
}

