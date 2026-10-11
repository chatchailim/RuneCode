/**
 * RFC 4648 Base32 implementation without padding
 * Alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BASE32_LOOKUP: Record<string, number> = {};
for (let i = 0; i < BASE32_ALPHABET.length; i++) {
  BASE32_LOOKUP[BASE32_ALPHABET[i]] = i;
}

/**
 * Encodes a Uint8Array into an unpadded RFC 4648 Base32 string.
 */
export function encodeBase32(bytes: Uint8Array): string {
  let output = '';
  let buffer = 0;
  let bitsLeft = 0;

  for (let i = 0; i < bytes.length; i++) {
    buffer = (buffer << 8) | bytes[i];
    bitsLeft += 8;

    while (bitsLeft >= 5) {
      bitsLeft -= 5;
      const index = (buffer >> bitsLeft) & 0x1f;
      output += BASE32_ALPHABET[index];
    }
  }

  if (bitsLeft > 0) {
    const index = (buffer << (5 - bitsLeft)) & 0x1f;
    output += BASE32_ALPHABET[index];
  }

  return output;
}

/**
 * Decodes an unpadded RFC 4648 Base32 string back into a Uint8Array.
 */
export function decodeBase32(base32Str: string): Uint8Array {
  const cleanStr = base32Str.toUpperCase().replace(/=/g, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bitsLeft = 0;

  for (let i = 0; i < cleanStr.length; i++) {
    const char = cleanStr[i];
    const value = BASE32_LOOKUP[char];
    if (value === undefined) {
      throw new Error(`Invalid Base32 character encountered: '${char}'`);
    }

    buffer = (buffer << 5) | value;
    bitsLeft += 5;

    if (bitsLeft >= 8) {
      bitsLeft -= 8;
      bytes.push((buffer >> bitsLeft) & 0xff);
    }
  }

  return new Uint8Array(bytes);
}
