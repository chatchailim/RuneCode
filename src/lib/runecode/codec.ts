import { calculateCRC32C, crc32cToHex } from './crc32c';
import { decodeBase32, encodeBase32 } from './base32';
import { bytesToUUIDString, uuidStringToBytes } from './uuidv7';
import { NAMESPACE_REGISTRY, Namespace, RuneBinaryPayload } from './types';

export const RUNECODE_VERSION = 0x01;

/**
 * Finds namespace code from its 1-byte numeric representation
 */
export function getNamespaceFromHex(hex: number): Namespace | null {
  for (const [key, val] of Object.entries(NAMESPACE_REGISTRY)) {
    if (val.hex === hex) return key as Namespace;
  }
  return null;
}

/**
 * Finds resource type key string from its namespace and numeric type code
 */
export function getTypeKeyFromHex(namespace: Namespace, typeHex: number): string | null {
  const ns = NAMESPACE_REGISTRY[namespace];
  if (!ns) return null;
  for (const [tKey, tVal] of Object.entries(ns.types)) {
    if (tVal.code === typeHex) return tKey;
  }
  return null;
}

/**
 * Converts a Logical ID into a 25-byte RuneCode Binary Payload
 * @param logicalId e.g. "RC1:OM:DEV:0199a5b2-7c80-7000-8000-000000000001"
 * @param flags optional 16-bit flags (default 0x0000)
 */
export function logicalIdToBinary(logicalId: string, flags: number = 0): RuneBinaryPayload {
  const parts = logicalId.trim().split(':');
  if (parts.length !== 4 || parts[0] !== 'RC1') {
    throw new Error(`Invalid Logical ID format. Must follow "RC1:<namespace>:<type>:<uuid>" (e.g. RC1:OM:DEV:...)`);
  }

  const nsKey = parts[1].toUpperCase() as Namespace;
  const nsConfig = NAMESPACE_REGISTRY[nsKey];
  if (!nsConfig) {
    throw new Error(`Unsupported namespace "${parts[1]}". Allowed: OM, OV, AI, BC`);
  }

  const typeKey = parts[2].toUpperCase();
  const typeConfig = nsConfig.types[typeKey];
  if (!typeConfig) {
    const valid = Object.keys(nsConfig.types).join(', ');
    throw new Error(`Unknown resource type "${typeKey}" in namespace ${nsKey}. Supported: ${valid}`);
  }

  const uuidBytes = uuidStringToBytes(parts[3]);

  // Construct 25-byte binary buffer
  const rawBytes = new Uint8Array(25);
  rawBytes[0] = RUNECODE_VERSION;
  rawBytes[1] = nsConfig.hex;
  rawBytes[2] = typeConfig.code;
  rawBytes.set(uuidBytes, 3);

  // Flags: 2 bytes Big-endian (Offset 19-20)
  rawBytes[19] = (flags >> 8) & 0xff;
  rawBytes[20] = flags & 0xff;

  // CRC-32C: 4 bytes Big-endian over the first 21 bytes (Offset 21-24)
  const crc = calculateCRC32C(rawBytes, 21);
  rawBytes[21] = (crc >>> 24) & 0xff;
  rawBytes[22] = (crc >>> 16) & 0xff;
  rawBytes[23] = (crc >>> 8) & 0xff;
  rawBytes[24] = crc & 0xff;

  return {
    version: RUNECODE_VERSION,
    namespaceHex: nsConfig.hex,
    typeHex: typeConfig.code,
    uuidBytes,
    flags,
    crc32c: crc,
    rawBytes,
  };
}

/**
 * Decodes a 25-byte binary buffer into RuneBinaryPayload and checks CRC-32C integrity
 */
export function binaryToPayload(rawBytes: Uint8Array): {
  payload: RuneBinaryPayload;
  logicalId: string;
  base32Id: string;
  namespace: Namespace;
  resourceType: string;
  uuid: string;
  crcValid: boolean;
  expectedCrc: number;
} {
  if (rawBytes.length !== 25) {
    throw new Error(`Invalid RuneCode binary size: expected 25 bytes, got ${rawBytes.length}`);
  }

  const version = rawBytes[0];
  if (version !== RUNECODE_VERSION) {
    throw new Error(`Unsupported RuneCode version: 0x${version.toString(16).padStart(2, '0')}. Expected 0x01.`);
  }

  const namespaceHex = rawBytes[1];
  const ns = getNamespaceFromHex(namespaceHex);
  if (!ns) {
    throw new Error(`Unknown namespace byte: 0x${namespaceHex.toString(16).padStart(2, '0')}`);
  }

  const typeHex = rawBytes[2];
  const resourceType = getTypeKeyFromHex(ns, typeHex);
  if (!resourceType) {
    throw new Error(`Unknown resource type byte 0x${typeHex.toString(16).padStart(2, '0')} for namespace ${ns}`);
  }

  const uuidBytes = rawBytes.slice(3, 19);
  const uuid = bytesToUUIDString(uuidBytes);

  const flags = (rawBytes[19] << 8) | rawBytes[20];
  const storedCrc = ((rawBytes[21] << 24) | (rawBytes[22] << 16) | (rawBytes[23] << 8) | rawBytes[24]) >>> 0;
  const computedCrc = calculateCRC32C(rawBytes, 21);
  const crcValid = storedCrc === computedCrc;

  const payload: RuneBinaryPayload = {
    version,
    namespaceHex,
    typeHex,
    uuidBytes,
    flags,
    crc32c: storedCrc,
    rawBytes,
  };

  const logicalId = `RC1:${ns}:${resourceType}:${uuid}`;
  const base32Str = encodeBase32(rawBytes);
  const base32Id = `RC1-${base32Str}`;

  return {
    payload,
    logicalId,
    base32Id,
    namespace: ns,
    resourceType,
    uuid,
    crcValid,
    expectedCrc: computedCrc,
  };
}

/**
 * Encodes a 25-byte payload to the Base32 representation "RC1-<BASE32>"
 */
export function binaryToBase32Id(rawBytes: Uint8Array): string {
  if (rawBytes.length !== 25) {
    throw new Error(`RuneCode payload must be 25 bytes, received ${rawBytes.length}`);
  }
  return `RC1-${encodeBase32(rawBytes)}`;
}

/**
 * Decodes a Base32 string "RC1-<BASE32>" or raw base32 string into binary bytes
 */
export function base32IdToBinary(base32Input: string): Uint8Array {
  let clean = base32Input.trim();
  if (clean.toUpperCase().startsWith('RC1-')) {
    clean = clean.slice(4);
  }
  const bytes = decodeBase32(clean);
  if (bytes.length !== 25) {
    throw new Error(`Decoded Base32 payload is ${bytes.length} bytes; expected 25 bytes for RuneCode v1`);
  }
  return bytes;
}

/**
 * Universal resolver: takes any valid RuneCode representation (Logical ID, Base32, or raw hex)
 * and resolves it completely.
 */
export function resolveRuneCode(input: string): {
  logicalId: string;
  base32Id: string;
  payload: RuneBinaryPayload;
  namespace: Namespace;
  resourceType: string;
  uuid: string;
  crcValid: boolean;
  hexString: string;
} {
  const trimmed = input.trim();

  // Case 1: Logical ID (RC1:NS:TYPE:UUID)
  if (trimmed.startsWith('RC1:')) {
    const payload = logicalIdToBinary(trimmed);
    const decoded = binaryToPayload(payload.rawBytes);
    return {
      logicalId: decoded.logicalId,
      base32Id: decoded.base32Id,
      payload,
      namespace: decoded.namespace,
      resourceType: decoded.resourceType,
      uuid: decoded.uuid,
      crcValid: decoded.crcValid,
      hexString: Array.from(payload.rawBytes).map(b => b.toString(16).padStart(2, '0')).join(' '),
    };
  }

  // Case 2: Base32 (RC1-ABC... or ABC...)
  if (trimmed.startsWith('RC1-') || (trimmed.length === 40 && /^[A-Za-z2-7]+$/.test(trimmed))) {
    const bytes = base32IdToBinary(trimmed);
    const decoded = binaryToPayload(bytes);
    return {
      logicalId: decoded.logicalId,
      base32Id: decoded.base32Id,
      payload: decoded.payload,
      namespace: decoded.namespace,
      resourceType: decoded.resourceType,
      uuid: decoded.uuid,
      crcValid: decoded.crcValid,
      hexString: Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' '),
    };
  }

  // Case 3: Hex bytes (50 hex chars, space or colon separated)
  const hexClean = trimmed.replace(/[\s:-]/g, '');
  if (hexClean.length === 50 && /^[0-9a-fA-F]+$/.test(hexClean)) {
    const bytes = new Uint8Array(25);
    for (let i = 0; i < 25; i++) {
      bytes[i] = parseInt(hexClean.slice(i * 2, i * 2 + 2), 16);
    }
    const decoded = binaryToPayload(bytes);
    return {
      logicalId: decoded.logicalId,
      base32Id: decoded.base32Id,
      payload: decoded.payload,
      namespace: decoded.namespace,
      resourceType: decoded.resourceType,
      uuid: decoded.uuid,
      crcValid: decoded.crcValid,
      hexString: Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' '),
    };
  }

  throw new Error(`Unrecognized RuneCode input format. Provide either "RC1:<namespace>:<type>:<uuid>", "RC1-<Base32>", or 25-byte hex.`);
}
