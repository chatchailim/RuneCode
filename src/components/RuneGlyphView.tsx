import React from 'react';
import { isBitActive, RUNE_BIT_SEGMENTS } from '../lib/runecode/glyph';

interface RuneGlyphViewProps {
  byte: number;
  size?: number;
  color?: string;
  referenceColor?: string;
  strokeWidth?: number;
  showReference?: boolean;
  highlightedBit?: number | null;
  interactive?: boolean;
  onBitClick?: (bitIndex: number) => void;
  className?: string;
}

export const RuneGlyphView: React.FC<RuneGlyphViewProps> = ({
  byte,
  size = 90,
  color = '#06b6d4', // cyan-500
  referenceColor = 'rgba(148, 163, 184, 0.25)', // slate-400/25
  strokeWidth = 3.5,
  showReference = true,
  highlightedBit = null,
  interactive = false,
  onBitClick,
  className = '',
}) => {
  const height = Math.round(size * 1.35);

  return (
    <div
      className={`inline-flex items-center justify-center relative select-none ${className}`}
      style={{ width: size, height }}
    >
      <svg
        viewBox="0 0 100 140"
        width={size}
        height={height}
        className="overflow-visible"
      >
        {/* Faint Center Axis & Reference Frame (Non-data reference stem) */}
        {showReference && (
          <g stroke={referenceColor} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3">
            <line x1="50" y1="16" x2="50" y2="124" />
            <line x1="44" y1="70" x2="56" y2="70" strokeDasharray="none" />
            <line x1="46" y1="16" x2="54" y2="16" strokeDasharray="none" />
            <line x1="46" y1="124" x2="54" y2="124" strokeDasharray="none" />
            <circle cx="50" cy="46" r="1.5" fill={referenceColor} />
            <circle cx="50" cy="94" r="1.5" fill={referenceColor} />
          </g>
        )}

        {/* 8 Data Segments (Bits 0–7) */}
        {RUNE_BIT_SEGMENTS.map(seg => {
          const active = isBitActive(byte, seg.bit);
          const isHighlighted = highlightedBit === seg.bit;

          let segStroke = 'transparent';
          let segWidth = strokeWidth;

          if (active) {
            segStroke = isHighlighted ? '#38bdf8' : color;
            segWidth = isHighlighted ? strokeWidth + 1.5 : strokeWidth;
          } else if (interactive) {
            segStroke = 'rgba(255, 255, 255, 0.08)';
          }

          return (
            <g
              key={seg.bit}
              className={interactive ? 'cursor-pointer group' : undefined}
              onClick={() => interactive && onBitClick?.(seg.bit)}
            >
              {/* Invisible thicker stroke for hit detection if interactive */}
              {interactive && (
                <path
                  d={seg.path}
                  stroke="transparent"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              )}
              {/* Visible segment stroke */}
              <path
                d={seg.path}
                stroke={segStroke}
                strokeWidth={segWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="transition-all duration-150"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
