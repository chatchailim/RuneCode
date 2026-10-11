import nacl from 'tweetnacl';
import { CanonicalRuneRecord, RuneTrustRecord } from './types';

/**
 * Converts a Uint8Array into a lowercase hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts a hex string into a Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[\s:-]/g, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Computes SHA-256 hash using Web Crypto API
 */
export async function sha256Hex(content: string | Uint8Array): Promise<string> {
  const data = typeof content === 'string' ? new TextEncoder().encode(content) : content;
  // Use Uint8Array buffer slice for strict ArrayBuffer compatibility
  const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return bytesToHex(new Uint8Array(hashBuffer));
}

export interface KeyPair {
  publicKeyHex: string;
  secretKeyHex: string;
  publicKeyBytes: Uint8Array;
  secretKeyBytes: Uint8Array;
}

/**
 * Generates an Ed25519 cryptographic keypair
 */
export function generateEd25519KeyPair(): KeyPair {
  const kp = nacl.sign.keyPair();
  return {
    publicKeyHex: bytesToHex(kp.publicKey),
    secretKeyHex: bytesToHex(kp.secretKey),
    publicKeyBytes: kp.publicKey,
    secretKeyBytes: kp.secretKey,
  };
}

/**
 * Pre-defined root keypair for Nextwaver Root Trust Authority (did:web:nextwaver.net)
 * Derived from deterministic seed for demonstration and reproducible verification
 */
const SEED_ROOT = new Uint8Array(32);
const seedSource = new TextEncoder().encode('nextwaver.runecode.root.authority');
SEED_ROOT.set(seedSource.subarray(0, 32));
export const ROOT_AUTHORITY_KEYPAIR = nacl.sign.keyPair.fromSeed(SEED_ROOT);
export const ROOT_PUBLIC_KEY_HEX = bytesToHex(ROOT_AUTHORITY_KEYPAIR.publicKey);

/**
 * Creates canonical string representation for digital signing
 */
export function canonicalizeRecordForSigning(record: {
  runeId: string;
  namespace: string;
  resourceType: string;
  displayName: string;
  tenantId: string;
  issuer: string;
  createdAt: string;
  contentHash?: string;
  revision: number;
}): string {
  // Deterministic JSON key order
  return JSON.stringify({
    contentHash: record.contentHash || '',
    createdAt: record.createdAt,
    displayName: record.displayName,
    issuer: record.issuer,
    namespace: record.namespace,
    resourceType: record.resourceType,
    revision: record.revision,
    runeId: record.runeId,
    tenantId: record.tenantId,
  });
}

/**
 * Signs a canonical record payload with an Ed25519 secret key
 */
export async function signRuneRecord(
  recordPayload: {
    runeId: string;
    namespace: string;
    resourceType: string;
    displayName: string;
    tenantId: string;
    issuer: string;
    createdAt: string;
    contentHash?: string;
    revision: number;
  },
  secretKeyHexOrBytes: string | Uint8Array,
  keyId: string = 'key-root-01'
): Promise<RuneTrustRecord> {
  const secretKeyBytes = typeof secretKeyHexOrBytes === 'string'
    ? hexToBytes(secretKeyHexOrBytes)
    : secretKeyHexOrBytes;

  const canonicalStr = canonicalizeRecordForSigning(recordPayload);
  const canonicalBytes = new TextEncoder().encode(canonicalStr);

  const signatureBytes = nacl.sign.detached(canonicalBytes, secretKeyBytes);
  const signatureHex = bytesToHex(signatureBytes);

  // Extract public key (last 32 bytes of Ed25519 64-byte secretKey)
  const publicKeyBytes = secretKeyBytes.slice(32);
  const publicKeyHex = bytesToHex(publicKeyBytes);

  return {
    keyId,
    signature: signatureHex,
    publicKeyHex,
    verified: true,
    policyRef: 'urn:nextwaver:policy:strict-ed25519:v1',
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * Verifies a canonical record's Ed25519 digital signature
 */
export function verifyRuneRecordSignature(
  record: CanonicalRuneRecord,
  publicKeyHex?: string
): boolean {
  try {
    const pubKey = publicKeyHex ? hexToBytes(publicKeyHex) : hexToBytes(record.trust.publicKeyHex);
    const signature = hexToBytes(record.trust.signature);
    const canonicalStr = canonicalizeRecordForSigning({
      runeId: record.runeId,
      namespace: record.namespace,
      resourceType: record.resourceType,
      displayName: record.displayName,
      tenantId: record.tenantId,
      issuer: record.issuer,
      createdAt: record.createdAt,
      contentHash: record.contentHash,
      revision: record.revision,
    });
    const messageBytes = new TextEncoder().encode(canonicalStr);

    return nacl.sign.detached.verify(messageBytes, signature, pubKey);
  } catch {
    return false;
  }
}
