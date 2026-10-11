/**
 * RuneGlyph v1 & RuneFrame Geometric Vector Engine
 * Trunic-inspired 8-bit glyph composition for Universal Visual Identifiers
 */

export interface GlyphBitSegment {
  bit: number;
  label: string;
  shortName: string;
  path: string;
  description: string;
}

/**
 * Geometric definition of the 8 bit positions in a single RuneGlyph
 * Coordinate bounds: viewBox 0 0 100 140
 * Reference axis: Center stem (50, 16) to (50, 124)
 */
export const RUNE_BIT_SEGMENTS: GlyphBitSegment[] = [
  {
    bit: 0,
    label: 'Bit 0 (0x01)',
    shortName: 'UL-Diagonal',
    path: 'M 50,46 L 18,22',
    description: 'Upper-left diagonal arm from stem junction to upper-left node',
  },
  {
    bit: 1,
    label: 'Bit 1 (0x02)',
    shortName: 'UL-Lateral',
    path: 'M 18,22 L 18,52',
    description: 'Upper-left lateral boundary vertical wing',
  },
  {
    bit: 2,
    label: 'Bit 2 (0x04)',
    shortName: 'UR-Diagonal',
    path: 'M 50,46 L 82,22',
    description: 'Upper-right diagonal arm from stem junction to upper-right node',
  },
  {
    bit: 3,
    label: 'Bit 3 (0x08)',
    shortName: 'UR-Lateral',
    path: 'M 82,22 L 82,52',
    description: 'Upper-right lateral boundary vertical wing',
  },
  {
    bit: 4,
    label: 'Bit 4 (0x10)',
    shortName: 'LL-Diagonal',
    path: 'M 50,94 L 18,118',
    description: 'Lower-left diagonal leg from stem junction to lower-left node',
  },
  {
    bit: 5,
    label: 'Bit 5 (0x20)',
    shortName: 'LL-Lateral',
    path: 'M 18,118 L 18,88',
    description: 'Lower-left lateral boundary vertical wing',
  },
  {
    bit: 6,
    label: 'Bit 6 (0x40)',
    shortName: 'LR-Diagonal',
    path: 'M 50,94 L 82,118',
    description: 'Lower-right diagonal leg from stem junction to lower-right node',
  },
  {
    bit: 7,
    label: 'Bit 7 (0x80)',
    shortName: 'Keystone-Belt',
    path: 'M 26,70 L 74,70 M 50,60 L 60,70 L 50,80 L 40,70 Z',
    description: 'Central horizontal belt bar and diamond keystone node',
  },
];

/**
 * Checks if a specific bit (0 to 7) is active in a byte
 */
export function isBitActive(byte: number, bitIndex: number): boolean {
  return ((byte >> bitIndex) & 1) === 1;
}

/**
 * Converts a byte value (0-255) to an array of 8 boolean flags [bit0, ..., bit7]
 */
export function byteToBits(byte: number): boolean[] {
  const bits: boolean[] = [];
  for (let i = 0; i < 8; i++) {
    bits.push(isBitActive(byte, i));
  }
  return bits;
}

/**
 * Converts an array of 8 boolean flags [bit0, ..., bit7] into a byte value (0-255)
 */
export function bitsToByte(bits: boolean[]): number {
  let byte = 0;
  for (let i = 0; i < 8; i++) {
    if (bits[i]) {
      byte |= (1 << i);
    }
  }
  return byte & 0xff;
}

/**
 * Generates an SVG string for a single 8-bit RuneGlyph
 */
export function renderGlyphSvgString(
  byte: number,
  options?: {
    size?: number;
    color?: string;
    referenceColor?: string;
    showReference?: boolean;
    strokeWidth?: number;
    backgroundColor?: string;
  }
): string {
  const size = options?.size || 140;
  const color = options?.color || '#06b6d4';
  const refColor = options?.referenceColor || 'rgba(148, 163, 184, 0.25)';
  const showRef = options?.showReference ?? true;
  const strokeWidth = options?.strokeWidth || 3.5;
  const bg = options?.backgroundColor || 'transparent';

  const activePaths: string[] = [];
  for (let bit = 0; bit < 8; bit++) {
    if (isBitActive(byte, bit)) {
      activePaths.push(RUNE_BIT_SEGMENTS[bit].path);
    }
  }

  const refElements = showRef
    ? `
      <g stroke="${refColor}" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 3">
        <!-- Vertical Reference Stem -->
        <line x1="50" y1="16" x2="50" y2="124" />
        <!-- Reference ticks -->
        <line x1="44" y1="70" x2="56" y2="70" stroke-dasharray="none" />
        <line x1="46" y1="16" x2="54" y2="16" stroke-dasharray="none" />
        <line x1="46" y1="124" x2="54" y2="124" stroke-dasharray="none" />
        <circle cx="50" cy="46" r="1.5" fill="${refColor}" />
        <circle cx="50" cy="94" r="1.5" fill="${refColor}" />
      </g>
    `
    : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" width="${size}" height="${(size * 1.4).toFixed(0)}" style="background: ${bg};">
      ${refElements}
      <g stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none">
        ${activePaths.map(p => `<path d="${p}" />`).join('\n        ')}
      </g>
    </svg>
  `.trim();
}

/**
 * Metadata info for each byte in the 25-byte RuneCode layout
 */
export interface ByteSemanticInfo {
  index: number;
  row: number;
  col: number;
  section: 'VERSION' | 'NAMESPACE' | 'TYPE' | 'UUID' | 'FLAGS' | 'CRC32C';
  label: string;
  description: string;
}

export function getByteSemanticInfo(index: number): ByteSemanticInfo {
  const row = Math.floor(index / 5);
  const col = index % 5;

  if (index === 0) {
    return { index, row, col, section: 'VERSION', label: 'Version (0x01)', description: 'RuneCode Specification v1' };
  }
  if (index === 1) {
    return { index, row, col, section: 'NAMESPACE', label: 'Namespace', description: 'System Domain (OM=0x01, OV=0x02, AI=0x03, BC=0x04)' };
  }
  if (index === 2) {
    return { index, row, col, section: 'TYPE', label: 'Resource Type', description: 'Entity classification within namespace' };
  }
  if (index >= 3 && index <= 18) {
    const uuidOffset = index - 3;
    let desc = `UUIDv7 byte ${uuidOffset}/16`;
    if (uuidOffset < 6) desc += ' (Timestamp)';
    else if (uuidOffset === 6) desc += ' (Ver 7 & Rand)';
    else if (uuidOffset === 8) desc += ' (Variant)';
    return { index, row, col, section: 'UUID', label: `UUID[${uuidOffset}]`, description: desc };
  }
  if (index === 19 || index === 20) {
    return { index, row, col, section: 'FLAGS', label: `Flags[${index - 19}]`, description: 'Reserved policy and security flags' };
  }
  return { index, row, col, section: 'CRC32C', label: `CRC-32C[${index - 21}]`, description: 'Castagnoli integrity check byte' };
}
