import React, { useState } from 'react';
import { RuneGlyphView } from './RuneGlyphView';
import { RUNE_BIT_SEGMENTS, isBitActive, byteToBits, bitsToByte } from '../lib/runecode/glyph';
import { Sliders, Sparkles, BookOpen, RotateCcw, Check } from 'lucide-react';

export const GlyphLab: React.FC = () => {
  // Start with 0xA5 (165 decimal) from the user's specification!
  const [currentByte, setCurrentByte] = useState<number>(0xa5);
  const [highlightedBit, setHighlightedBit] = useState<number | null>(null);
  const [textTest, setTextTest] = useState<string>('RUNE');
  const [copiedHex, setCopiedHex] = useState(false);

  const bits = byteToBits(currentByte);

  const toggleBit = (bitIndex: number) => {
    const newBits = [...bits];
    newBits[bitIndex] = !newBits[bitIndex];
    setCurrentByte(bitsToByte(newBits));
  };

  const setByteDirect = (val: number) => {
    setCurrentByte(Math.max(0, Math.min(255, val)));
  };

  const handleCopyHex = async () => {
    await navigator.clipboard.writeText(`0x${currentByte.toString(16).padStart(2, '0').toUpperCase()}`);
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 2000);
  };

  const presets = [
    { label: '0xA5 (Spec Example)', value: 0xa5, desc: 'Bits 0, 2, 5, 7 active' },
    { label: '0x01 (Version v1)', value: 0x01, desc: 'Bit 0 active' },
    { label: '0x03 (MyAI Namespace)', value: 0x03, desc: 'Bits 0, 1 active' },
    { label: '0x55 (Alternating Odd)', value: 0x55, desc: 'Bits 0, 2, 4, 6 active' },
    { label: '0xAA (Alternating Even)', value: 0xaa, desc: 'Bits 1, 3, 5, 7 active' },
    { label: '0xFF (Full Geometry)', value: 0xff, desc: 'All 8 data bits active' },
    { label: '0x00 (Null Glyph)', value: 0x00, desc: 'Only faint reference axis' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Editorial Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">RuneGlyph 8-bit Geometry Laboratory</h2>
        <p className="mt-1 text-sm text-slate-400">
          Interactive Trunic-inspired geometric rune synthesizer. Each glyph encodes exactly 1 byte (8 bits)
          where bits 0–7 deterministically activate geometric line segments around a faint reference axis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Interactive Canvas & Anatomy (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 relative">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Giant Glyph Viewport */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-950/70 border border-slate-800 rounded-xl relative group">
                <RuneGlyphView
                  byte={currentByte}
                  size={160}
                  color="#06b6d4"
                  referenceColor="rgba(148, 163, 184, 0.25)"
                  strokeWidth={4.5}
                  highlightedBit={highlightedBit}
                  interactive={true}
                  onBitClick={toggleBit}
                />
                <span className="mt-3 text-[11px] font-mono text-slate-500">
                  Click glyph arms or toggles to switch bits
                </span>
              </div>

              {/* Real-time Value Breakdown */}
              <div className="flex-1 w-full space-y-4">
                <div className="p-4 bg-slate-950/50 border border-slate-800/80 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Hexadecimal</span>
                    <button
                      onClick={handleCopyHex}
                      className="flex items-center gap-1 font-mono text-base font-semibold text-cyan-400 hover:text-cyan-300 transition-colors tabular-nums"
                    >
                      0x{currentByte.toString(16).padStart(2, '0').toUpperCase()}
                      {copiedHex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Decimal Value</span>
                    <span className="font-mono text-base font-semibold text-slate-200 tabular-nums">
                      {currentByte} <span className="text-xs font-normal text-slate-500">/ 255</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Binary Byte (MSB→LSB)</span>
                    <span className="font-mono text-sm font-semibold text-slate-200 tabular-nums tracking-wider">
                      {bits.slice().reverse().map((b, i) => (
                        <span key={i} className={b ? 'text-cyan-400 font-bold' : 'text-slate-600'}>
                          {b ? '1' : '0'}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Byte Value Slider</span>
                    <span className="font-mono tabular-nums">{currentByte}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={currentByte}
                    onChange={(e) => setByteDirect(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Quick reset */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentByte(0x00)}
                    className="flex-1 py-1.5 px-3 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset (0x00)
                  </button>
                  <button
                    onClick={() => setCurrentByte(0xff)}
                    className="flex-1 py-1.5 px-3 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                  >
                    Fill (0xFF)
                  </button>
                </div>
              </div>
            </div>

            {/* 8-Bit Interactive Switch Grid */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                8-Bit Segment Matrix (LSB Bit 0 to MSB Bit 7)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {RUNE_BIT_SEGMENTS.map((seg) => {
                  const active = isBitActive(currentByte, seg.bit);
                  return (
                    <button
                      key={seg.bit}
                      onClick={() => toggleBit(seg.bit)}
                      onMouseEnter={() => setHighlightedBit(seg.bit)}
                      onMouseLeave={() => setHighlightedBit(null)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        active
                          ? 'bg-cyan-950/40 border-cyan-500/60 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-medium text-slate-200">
                          Bit {seg.bit}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            active ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-700'
                          }`}
                        />
                      </div>
                      <div className="mt-1 text-[11px] font-mono text-cyan-300 font-semibold">
                        0x{(1 << seg.bit).toString(16).padStart(2, '0').toUpperCase()}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400 line-clamp-1">
                        {seg.shortName}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Text String Sequence Explorer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">RuneGlyph Inscription Strip</h3>
                <p className="text-xs text-slate-400">Type any text to render its UTF-8 bytes as consecutive geometric runes</p>
              </div>
              <input
                type="text"
                value={textTest}
                onChange={(e) => setTextTest(e.target.value.slice(0, 16))}
                placeholder="Type word..."
                className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono tracking-wider focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-lg overflow-x-auto flex items-center gap-4 py-6">
              {Array.from(new TextEncoder().encode(textTest || ' ')).map((byte, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentByte(byte)}
                  className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-slate-800/60 cursor-pointer transition-colors group shrink-0"
                >
                  <RuneGlyphView
                    byte={byte}
                    size={48}
                    color="#06b6d4"
                    strokeWidth={2.8}
                  />
                  <div className="text-center font-mono text-[11px]">
                    <span className="text-cyan-300 font-bold block">'{textTest[idx]}'</span>
                    <span className="text-slate-500 text-[10px]">0x{byte.toString(16).toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Reference Presets & Mathematical Constitution (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Presets */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Standard Geometric Presets
            </h3>
            <div className="space-y-2">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setCurrentByte(preset.value)}
                  className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                    currentByte === preset.value
                      ? 'bg-cyan-950/40 border-cyan-500/70'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{preset.label}</div>
                    <div className="text-[11px] text-slate-400">{preset.desc}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-300 tabular-nums">
                      0x{preset.value.toString(16).padStart(2, '0').toUpperCase()}
                    </span>
                    <RuneGlyphView byte={preset.value} size={28} strokeWidth={2.5} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Architectural Notes & Trunic Principles */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Geometric Specification Rules
            </h3>
            <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/60">
                <span className="font-semibold text-slate-200 block mb-1">1. Faint Reference Stem</span>
                The central vertical axis and horizontal guide marks are strictly structural alignment aids. They convey zero entropy/data and remain visible to preserve visual balance and machine OCR orientation.
              </div>
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/60">
                <span className="font-semibold text-slate-200 block mb-1">2. 8-Bit Discrete Symmetry</span>
                Bits 0, 1 (Upper-Left), Bits 2, 3 (Upper-Right), Bits 4, 5 (Lower-Left), Bit 6 (Lower-Right), and Bit 7 (Central Keystone Belt) form an unambiguous orthogonal coordinate space.
              </div>
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/60">
                <span className="font-semibold text-slate-200 block mb-1">3. Human & Machine Readability</span>
                Unlike barcodes or QR dots that are illegible to humans, RuneGlyphs read as elegant runic insignia while remaining 100% reversible into exact byte payloads.
              </div>
            </div>
          </div>

          {/* Fault Tolerance & Error Correction Simulator (Recommendation 2) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Fault Tolerance & ECC Simulation
            </h3>
            <p className="text-xs text-slate-400">
              จำลองความทนทานต่อรอยขีดข่วนหรือแสงสะท้อนของกล้อง (Camera Occlusion Recovery):
            </p>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Even Parity Check:</span>
                <span className="font-mono text-cyan-300">
                  {bits.filter(Boolean).length % 2 === 0 ? '0 (Even Parity)' : '1 (Odd Parity)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Hamming Weight:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {bits.filter(Boolean).length} / 8 Bits
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800">
                เมื่อใช้ร่วมกับ RuneFrame 25-Byte Matrix และ CRC-32C ระบบสามารถตรวจจับข้อผิดพลาดบิตเดี่ยวและบิตคู่ได้อย่างสมบูรณ์แบบ
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
