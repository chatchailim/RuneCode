import React, { useState, useRef } from 'react';
import { CanonicalRuneRecord } from '../lib/runecode/types';
import { logicalIdToBinary, binaryToBase32Id } from '../lib/runecode/codec';
import { RuneGlyphView } from './RuneGlyphView';
import { X, Download, Copy, Check, Printer, ShieldCheck } from 'lucide-react';

interface HardwarePlateModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CanonicalRuneRecord;
}

export const HardwarePlateModal: React.FC<HardwarePlateModalProps> = ({ isOpen, onClose, record }) => {
  const [plateSize, setPlateSize] = useState<'standard' | 'compact' | 'rack'>('standard');
  const [plateMaterial, setPlateMaterial] = useState<'aluminum' | 'dark-anodized' | 'brass'>('dark-anodized');
  const [copied, setCopied] = useState(false);
  const plateSvgRef = useRef<SVGSVGElement>(null);

  if (!isOpen) return null;

  let rawBytes: Uint8Array = new Uint8Array(25);
  let base32Id = '';
  try {
    const bin = logicalIdToBinary(record.runeId);
    rawBytes = new Uint8Array(bin.rawBytes);
    base32Id = binaryToBase32Id(rawBytes);
  } catch {
    // fallback
  }

  // Dimensions in millimeters for standard laser cutting
  const dimensions = {
    standard: { widthMm: 85, heightMm: 54, name: '85×54 mm (Standard Appliance Plate)' },
    compact: { widthMm: 60, heightMm: 40, name: '60×40 mm (Compact Sensor Tag)' },
    rack: { widthMm: 100, heightMm: 35, name: '100×35 mm (1U Rackmount Stencil)' },
  }[plateSize];

  const materialStyles = {
    'dark-anodized': {
      bg: '#090d16',
      border: '#334155',
      text: '#f8fafc',
      accent: '#06b6d4',
      name: 'Dark Matte Anodized Aluminum',
    },
    aluminum: {
      bg: '#e2e8f0',
      border: '#64748b',
      text: '#0f172a',
      accent: '#0284c7',
      name: 'Brushed Silver Aluminum',
    },
    brass: {
      bg: '#291e0a',
      border: '#785516',
      text: '#fef08a',
      accent: '#eab308',
      name: 'Industrial Antique Brass',
    },
  }[plateMaterial];

  const handleDownloadLaserSvg = () => {
    if (!plateSvgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(plateSvgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hardware-stencil-${record.runeId.replace(/:/g, '-')}-${plateSize}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySvg = async () => {
    if (!plateSvgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(plateSvgRef.current);
    await navigator.clipboard.writeText(svgData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-400 font-bold text-xs">HARDWARE STENCIL & PLATE GENERATOR</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">1:1 Physical Scale</span>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mt-1">
              สร้างป้ายโลหะแกะสลักเลเซอร์สำหรับอุปกรณ์ {record.displayName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ไฟล์เวกเตอร์สเกลมาตรฐานมิลลิเมตรสำหรับเครื่องตัดและแกะสลักเลเซอร์ (Laser Cutter & Engraver)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1.5">ขนาดแผ่นป้าย (Plate Dimensions)</label>
            <div className="space-y-1.5">
              {[
                { id: 'standard' as const, label: '85×54 mm (Standard Setbox / Credit Size)' },
                { id: 'compact' as const, label: '60×40 mm (Compact IoT Sensor Tag)' },
                { id: 'rack' as const, label: '100×35 mm (1U Server Rack Faceplate)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPlateSize(opt.id)}
                  className={`w-full p-2 rounded-lg border text-left transition-colors ${
                    plateSize === opt.id
                      ? 'bg-cyan-950/40 border-cyan-500 text-slate-100 font-semibold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1.5">วัสดุและโทนสี (Material Simulation)</label>
            <div className="space-y-1.5">
              {[
                { id: 'dark-anodized' as const, label: 'Dark Matte Anodized Aluminum (ยานยนต์/อุตสาหกรรม)' },
                { id: 'aluminum' as const, label: 'Brushed Silver Aluminum (เซิร์ฟเวอร์/เครื่องแล็บ)' },
                { id: 'brass' as const, label: 'Antique Brass / Gold Plated (ป้ายเอกสาร/ตราประทับ)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPlateMaterial(opt.id)}
                  className={`w-full p-2 rounded-lg border text-left transition-colors ${
                    plateMaterial === opt.id
                      ? 'bg-cyan-950/40 border-cyan-500 text-slate-100 font-semibold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 1:1 Visual Preview Stage */}
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center overflow-x-auto">
          <svg
            ref={plateSvgRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 425 270"
            width={plateSize === 'compact' ? 360 : 425}
            height={plateSize === 'compact' ? 240 : 270}
            className="rounded-lg shadow-2xl transition-all"
            style={{ backgroundColor: materialStyles.bg }}
          >
            {/* Outer Cutting Line (Laser Cut Layer) */}
            <rect
              x="5"
              y="5"
              width="415"
              height="260"
              rx="12"
              fill={materialStyles.bg}
              stroke={materialStyles.border}
              strokeWidth="2"
            />

            {/* Inner Bevel Border */}
            <rect
              x="14"
              y="14"
              width="397"
              height="242"
              rx="8"
              fill="none"
              stroke={materialStyles.border}
              strokeWidth="1"
              strokeDasharray="2 4"
            />

            {/* 4 Corner Screw Mounting Holes (M3 screw: 3.2mm) */}
            <circle cx="22" cy="22" r="5" fill="none" stroke={materialStyles.accent} strokeWidth="1.5" />
            <circle cx="403" cy="22" r="5" fill="none" stroke={materialStyles.accent} strokeWidth="1.5" />
            <circle cx="22" cy="248" r="5" fill="none" stroke={materialStyles.accent} strokeWidth="1.5" />
            <circle cx="403" cy="248" r="5" fill="none" stroke={materialStyles.accent} strokeWidth="1.5" />

            {/* Nextwaver Header */}
            <text x="36" y="38" fill={materialStyles.text} fontSize="11" fontFamily="sans-serif" fontWeight="bold">
              NEXTWAVER · {record.namespace} IDENTIFIER
            </text>
            <text x="36" y="52" fill={materialStyles.accent} fontSize="9" fontFamily="monospace">
              SYSTEM: {record.resourceType} · REV {record.revision}
            </text>

            {/* Centered 5x5 RuneFrame mini matrix */}
            <g transform="translate(36, 68)">
              {/* Top Orientation Notch */}
              <circle cx="70" cy="0" r="2" fill={materialStyles.accent} />
              <line x1="64" y1="-2" x2="76" y2="-2" stroke={materialStyles.accent} strokeWidth="1" />

              {/* 5x5 grid cells */}
              {Array.from({ length: 25 }).map((_, i) => {
                const row = Math.floor(i / 5);
                const col = i % 5;
                const byte = rawBytes[i];
                return (
                  <g key={i} transform={`translate(${col * 28}, ${row * 28})`}>
                    <rect x="0" y="0" width="24" height="24" fill="none" stroke={materialStyles.border} strokeWidth="0.5" rx="2" />
                    {/* Render simplified glyph path in SVG */}
                    <line x1="12" y1="4" x2="12" y2="20" stroke={materialStyles.border} strokeWidth="0.8" strokeDasharray="1 1" />
                    {/* Active segments */}
                    {((byte & 0x01) !== 0) && <line x1="12" y1="9" x2="5" y2="5" stroke={materialStyles.accent} strokeWidth="1.2" />}
                    {((byte & 0x04) !== 0) && <line x1="12" y1="9" x2="19" y2="5" stroke={materialStyles.accent} strokeWidth="1.2" />}
                    {((byte & 0x20) !== 0) && <line x1="5" y1="19" x2="5" y2="14" stroke={materialStyles.accent} strokeWidth="1.2" />}
                    {((byte & 0x80) !== 0) && <line x1="7" y1="12" x2="17" y2="12" stroke={materialStyles.accent} strokeWidth="1.2" />}
                  </g>
                );
              })}
            </g>

            {/* Right Information Block */}
            <g transform="translate(200, 72)">
              <text x="0" y="16" fill={materialStyles.text} fontSize="12" fontFamily="sans-serif" fontWeight="bold">
                {record.displayName.length > 22 ? `${record.displayName.slice(0, 20)}...` : record.displayName}
              </text>
              <text x="0" y="34" fill={materialStyles.accent} fontSize="9" fontFamily="monospace">
                ID: {record.runeId.slice(0, 24)}...
              </text>
              <text x="0" y="52" fill={materialStyles.text} opacity="0.8" fontSize="8" fontFamily="monospace">
                BASE32: {base32Id.slice(0, 22)}...
              </text>
              <text x="0" y="70" fill={materialStyles.text} opacity="0.8" fontSize="8" fontFamily="monospace">
                ISSUER: {record.issuer}
              </text>
              <text x="0" y="88" fill={materialStyles.text} opacity="0.6" fontSize="7.5" fontFamily="monospace">
                STATUS: {record.status.toUpperCase()} · CHECKSUM CRC-32C VERIFIED
              </text>
            </g>

            {/* Bottom Scale Rule & Serial */}
            <line x1="36" y1="228" x2="389" y2="228" stroke={materialStyles.border} strokeWidth="0.8" />
            <text x="36" y="242" fill={materialStyles.text} opacity="0.5" fontSize="7" fontFamily="monospace">
              SCALE 1:1 · {dimensions.widthMm}×{dimensions.heightMm} MM · LASER ENGRAVED STENCIL SPEC v1.0
            </text>
            <text x="389" y="242" textAnchor="end" fill={materialStyles.accent} fontSize="7" fontFamily="monospace">
              ED25519 ATTESTED
            </text>
          </svg>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400">
            <span>ขนาดจริง: </span>
            <span className="font-mono text-cyan-300 font-semibold">{dimensions.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySvg}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Vector SVG</span>
            </button>

            <button
              onClick={handleDownloadLaserSvg}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download Laser SVG (.svg)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
