/**
 * UUIDv7 implementation according to RFC 9562
 * 128-bit time-ordered UUID
 */

export function generateUUIDv7(timestampMs?: number): { string: string; bytes: Uint8Array } {
  const ts = timestampMs !== undefined ? timestampMs : Date.now();
  const bytes = new Uint8Array(16);

  // 48-bit timestamp in big-endian
  bytes[0] = Math.floor(ts / 0x10000000000) & 0xff;
  bytes[1] = Math.floor(ts / 0x100000000) & 0xff;
  bytes[2] = Math.floor(ts / 0x1000000) & 0xff;
  bytes[3] = Math.floor(ts / 0x10000) & 0xff;
  bytes[4] = Math.floor(ts / 0x100) & 0xff;
  bytes[5] = ts & 0xff;

  // Random bytes for the rest
  const random = new Uint8Array(10);
  crypto.getRandomValues(random);

  // Byte 6: 4 bits version (0x7) + 4 bits rand_a
  bytes[6] = 0x70 | (random[0] & 0x0f);
  bytes[7] = random[1];

  // Byte 8: 2 bits variant (0x80) + 6 bits rand_b
  bytes[8] = 0x80 | (random[2] & 0x3f);
  bytes[9] = random[3];
  bytes[10] = random[4];
  bytes[11] = random[5];
  bytes[12] = random[6];
  bytes[13] = random[7];
  bytes[14] = random[8];
  bytes[15] = random[9];

  return {
    string: bytesToUUIDString(bytes),
    bytes,
  };
}

export function bytesToUUIDString(bytes: Uint8Array): string {
  if (bytes.length !== 16) {
    throw new Error(`UUID bytes must be exactly 16 bytes, received ${bytes.length}`);
  }
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`.toLowerCase();
}

export function uuidStringToBytes(uuidStr: string): Uint8Array {
  const clean = uuidStr.replace(/-/g, '').toLowerCase();
  if (clean.length !== 32 || !/^[0-9a-f]{32}$/.test(clean)) {
    throw new Error(`Invalid UUID string format: "${uuidStr}"`);
  }
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function extractUUIDv7Timestamp(uuidBytesOrString: Uint8Array | string): number {
  const bytes = typeof uuidBytesOrString === 'string'
    ? uuidStringToBytes(uuidBytesOrString)
    : uuidBytesOrString;
  let ts = 0;
  for (let i = 0; i < 6; i++) {
    ts = ts * 256 + bytes[i];
  }
  return ts;
}
