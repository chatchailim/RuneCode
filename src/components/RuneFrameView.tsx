import React, { useState, useRef } from 'react';
import { RuneGlyphView } from './RuneGlyphView';
import { getByteSemanticInfo } from '../lib/runecode/glyph';
import { Download, Copy, Check, Info } from 'lucide-react';

interface RuneFrameViewProps {
  rawBytes: Uint8Array;
  logicalId?: string;
  base32Id?: string;
  size?: 'compact' | 'standard' | 'large';
  showControls?: boolean;
}

export const RuneFrameView: React.FC<RuneFrameViewProps> = ({
  rawBytes,
  logicalId,
  base32Id,
  size = 'standard',
  showControls = true,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // Normalize rawBytes to 25 bytes
  const bytes = rawBytes.length === 25 ? rawBytes : new Uint8Array(25);

  const cellSize = size === 'compact' ? 44 : size === 'large' ? 76 : 58;

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'VERSION':
      case 'NAMESPACE':
        return '#06b6d4'; // cyan
      case 'TYPE':
        return '#10b981'; // emerald
      case 'UUID':
        return '#38bdf8'; // sky
      case 'FLAGS':
        return '#f59e0b'; // amber
      case 'CRC32C':
        return '#a78bfa'; // purple
      default:
        return '#94a3b8';
    }
  };

  const handleCopySvg = async () => {
    if (!frameRef.current) return;
    const svgEl = frameRef.current.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    await navigator.clipboard.writeText(svgData);
    setCopiedType('svg');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadSvg = () => {
    if (!frameRef.current) return;
    const svgEl = frameRef.current.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `runecode-${logicalId ? logicalId.replace(/:/g, '-') : 'v1'}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const hoveredInfo = hoveredIndex !== null ? getByteSemanticInfo(hoveredIndex) : null;
  const hoveredByteVal = hoveredIndex !== null ? bytes[hoveredIndex] : null;

  return (
    <div className="flex flex-col items-center">
      {/* Visual Frame Container */}
      <div
        ref={frameRef}
        className="relative p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col items-center"
      >
        {/* Top Orientation Notch & Header */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-70">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <div className="w-3 h-1 bg-cyan-400 rounded-full" />
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        </div>

        {/* 4 Corner Optical Calibration Brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-500/80" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-500/80" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-500/80" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-500/80" />

        {/* 5x5 RuneGlyph Matrix */}
        <div
          className="grid grid-cols-5 gap-2 sm:gap-3"
          style={{ width: cellSize * 5 + 16 }}
        >
          {Array.from({ length: 25 }).map((_, i) => {
            const byte = bytes[i];
            const info = getByteSemanticInfo(i);
            const color = getSectionColor(info.section);
            const isHovered = hoveredIndex === i;

            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative flex flex-col items-center justify-center p-1 rounded-md transition-all duration-150 cursor-pointer ${
                  isHovered
                    ? 'bg-slate-800 ring-1 ring-cyan-400 scale-105 z-10 shadow-lg'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60'
                }`}
                style={{ width: cellSize, height: Math.round(cellSize * 1.35) }}
              >
                <RuneGlyphView
                  byte={byte}
                  size={cellSize * 0.72}
                  color={color}
                  referenceColor="rgba(148, 163, 184, 0.18)"
                  strokeWidth={size === 'compact' ? 2.5 : 3.2}
                />
                <span className="absolute bottom-1 right-1 text-[9px] font-mono tabular-nums text-slate-500 pointer-events-none">
                  {i}
                </span>
              </div>
            );
          })}
        </div>

        {/* Subtle Bottom Timing Strip */}
        <div className="mt-4 flex items-center justify-between w-full px-2 text-[10px] font-mono text-slate-500 border-t border-slate-800/80 pt-2">
          <span>RuneFrame v1 · 25B</span>
          <span className="tabular-nums">5×5 Geometry</span>
          <span>CRC-32C Active</span>
        </div>
      </div>

      {/* Interactive Byte Inspector Pill */}
      <div className="mt-3 min-h-[38px] flex items-center justify-center text-xs text-slate-400">
        {hoveredInfo && hoveredByteVal !== null ? (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-sm">
            <span
              className="font-medium text-slate-200"
              style={{ color: getSectionColor(hoveredInfo.section) }}
            >
              Offset {hoveredInfo.index} ({hoveredInfo.label})
            </span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-cyan-300 tabular-nums">
              0x{hoveredByteVal.toString(16).padStart(2, '0').toUpperCase()}
            </span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-slate-300 tabular-nums">
              0b{hoveredByteVal.toString(2).padStart(8, '0')}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{hoveredInfo.description}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-500">
            <Info className="w-3.5 h-3.5" />
            <span>Hover any cell to inspect byte offset, bit pattern, and structural layer</span>
          </div>
        )}
      </div>

      {/* Frame Controls & Export Actions */}
      {showControls && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={handleCopySvg}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
          >
            {copiedType === 'svg' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">SVG Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SVG</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadSvg}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download SVG</span>
          </button>

          {base32Id && (
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(base32Id);
                setCopiedType('base32');
                setTimeout(() => setCopiedType(null), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
            >
              {copiedType === 'base32' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Base32 Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Base32 ID</span>
                </>
              )}
            </button>
          )}

          {logicalId && (
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(logicalId);
                setCopiedType('logical');
                setTimeout(() => setCopiedType(null), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
            >
              {copiedType === 'logical' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Logical ID Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Logical ID</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
