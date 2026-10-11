/**
 * CRC-32C (Castagnoli) Implementation
 * Reflected Polynomial: 0x82F63B78
 * Initial Value: 0xFFFFFFFF
 * Final XOR Value: 0xFFFFFFFF
 */

const CRC32C_TABLE = new Uint32Array(256);

// Precompute CRC-32C lookup table with reflected polynomial 0x82F63B78
(function initCRC32CTable() {
  const POLY = 0x82F63B78 >>> 0;
  for (let i = 0; i < 256; i++) {
    let crc = i >>> 0;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 1) !== 0) {
        crc = ((crc >>> 1) ^ POLY) >>> 0;
      } else {
        crc = (crc >>> 1) >>> 0;
      }
    }
    CRC32C_TABLE[i] = crc >>> 0;
  }
})();

/**
 * Computes the 32-bit CRC-32C checksum of a byte buffer.
 * @param buffer Uint8Array of bytes
 * @param length Optional byte length (defaults to buffer.length)
 * @returns 32-bit unsigned integer checksum
 */
export function calculateCRC32C(buffer: Uint8Array, length?: number): number {
  const len = length !== undefined ? length : buffer.length;
  let crc = 0xFFFFFFFF >>> 0;
  for (let i = 0; i < len; i++) {
    const byte = buffer[i];
    const tableIndex = (crc ^ byte) & 0xFF;
    crc = ((crc >>> 8) ^ CRC32C_TABLE[tableIndex]) >>> 0;
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Formats a 32-bit integer as an 8-character uppercase hex string (e.g. "E3B0C442")
 */
export function crc32cToHex(crc: number): string {
  return (crc >>> 0).toString(16).padStart(8, '0').toUpperCase();
}
