import { webcrypto } from "node:crypto";

export const PBKDF2_ITERATIONS = 210_000;

const subtle = webcrypto.subtle;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function b64Encode(bytes) {
  return Buffer.from(bytes).toString("base64");
}

export function b64Decode(str) {
  return new Uint8Array(Buffer.from(str, "base64"));
}

export async function deriveAesKey(password, saltBytes) {
  const keyMaterial = await subtle.importKey("raw", textEncoder.encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
  return subtle.deriveKey(
    { name: "PBKDF2", salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptPrivatePayload(password, payloadObject) {
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt);
  const plaintext = textEncoder.encode(JSON.stringify(payloadObject));
  const ciphertext = await subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return {
    v: 1,
    alg: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iterations: PBKDF2_ITERATIONS,
    salt: b64Encode(salt),
    iv: b64Encode(iv),
    ciphertext: b64Encode(new Uint8Array(ciphertext)),
  };
}

export async function decryptPrivatePayload(password, envelope) {
  const salt = b64Decode(envelope.salt);
  const iv = b64Decode(envelope.iv);
  const data = b64Decode(envelope.ciphertext);
  const key = await deriveAesKey(password, salt);
  try {
    const plain = await subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return JSON.parse(textDecoder.decode(plain));
  } catch {
    return null;
  }
}
