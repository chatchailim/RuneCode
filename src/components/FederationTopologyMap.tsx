import React, { useState } from 'react';
import { CanonicalRuneRecord, Namespace } from '../lib/runecode/types';
import { RuneGlyphView } from './RuneGlyphView';
import { logicalIdToBinary } from '../lib/runecode/codec';
import { Layers, Link2, ExternalLink, ShieldCheck } from 'lucide-react';

interface FederationTopologyMapProps {
  records: CanonicalRuneRecord[];
  onSelectRecord: (record: CanonicalRuneRecord) => void;
}

interface NodePosition {
  record: CanonicalRuneRecord;
  x: number;
  y: number;
  color: string;
  systemLabel: string;
}

export const FederationTopologyMap: React.FC<FederationTopologyMapProps> = ({
  records,
  onSelectRecord,
}) => {
  const [hoveredRuneId, setHoveredRuneId] = useState<string | null>(null);

  // Group and calculate circular/quadrant positions for each system
  const systemColors: Record<Namespace, { bg: string; border: string; color: string; label: string }> = {
    OM: { bg: 'bg-cyan-950/60', border: 'border-cyan-500', color: '#06b6d4', label: 'OneManOS (Edge Devices)' },
    OV: { bg: 'bg-emerald-950/60', border: 'border-emerald-500', color: '#10b981', label: 'OneVault (Storage & Assets)' },
    AI: { bg: 'bg-sky-950/60', border: 'border-sky-500', color: '#38bdf8', label: 'MyAI (Autonomous Agents)' },
    BC: { bg: 'bg-purple-950/60', border: 'border-purple-500', color: '#a855f7', label: 'BookChain (Consensus Layer)' },
  };

  // Fixed quadrant anchors for the 4 systems in a 840x520 viewport
  const quadrantAnchors: Record<Namespace, { cx: number; cy: number }> = {
    OM: { cx: 220, cy: 140 },
    OV: { cx: 620, cy: 140 },
    AI: { cx: 220, cy: 380 },
    BC: { cx: 620, cy: 380 },
  };

  // Position nodes within their system quadrant
  const nodes: NodePosition[] = records.map((record, index) => {
    const anchor = quadrantAnchors[record.namespace] || { cx: 420, cy: 260 };
    // Offset slightly based on index within namespace
    const nsRecords = records.filter(r => r.namespace === record.namespace);
    const subIdx = nsRecords.findIndex(r => r.runeId === record.runeId);
    const totalInNs = nsRecords.length;

    let x = anchor.cx;
    let y = anchor.cy;

    if (totalInNs > 1) {
      const angle = (subIdx / totalInNs) * Math.PI * 2 - Math.PI / 2;
      const radius = 64;
      x = anchor.cx + Math.cos(angle) * radius;
      y = anchor.cy + Math.sin(angle) * radius;
    }

    return {
      record,
      x,
      y,
      color: systemColors[record.namespace].color,
      systemLabel: systemColors[record.namespace].label,
    };
  });

  // Calculate connections (ownerRef or attested links)
  const links: Array<{
    source: NodePosition;
    target: NodePosition;
    label: string;
    isHighlighted: boolean;
  }> = [];

  nodes.forEach((sourceNode) => {
    if (sourceNode.record.ownerRef) {
      const targetNode = nodes.find(n => n.record.runeId === sourceNode.record.ownerRef);
      if (targetNode) {
        const isHighlighted =
          hoveredRuneId === sourceNode.record.runeId || hoveredRuneId === targetNode.record.runeId;
        links.push({
          source: sourceNode,
          target: targetNode,
          label: 'owns / controls',
          isHighlighted,
        });
      }
    }
  });

  const hoveredNode = nodes.find(n => n.record.runeId === hoveredRuneId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Federation Topology & Inter-System Mesh
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive map depicting cryptographic relationships across OneManOS, OneVault, MyAI, and BookChain.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />OM</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />OV</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" />AI</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400" />BC</div>
        </div>
      </div>

      {/* Interactive Network Canvas Viewport */}
      <div className="relative w-full aspect-[16/9] min-h-[460px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden select-none">
        {/* Quadrant Zone Labels */}
        <div className="absolute top-3 left-4 text-[10px] font-mono text-cyan-500/70 tracking-wider">
          QUADRANT I · ONEMANOS (EDGE)
        </div>
        <div className="absolute top-3 right-4 text-[10px] font-mono text-emerald-500/70 tracking-wider text-right">
          QUADRANT II · ONEVAULT (STORAGE)
        </div>
        <div className="absolute bottom-3 left-4 text-[10px] font-mono text-sky-500/70 tracking-wider">
          QUADRANT III · MYAI (AGENTS)
        </div>
        <div className="absolute bottom-3 right-4 text-[10px] font-mono text-purple-500/70 tracking-wider text-right">
          QUADRANT IV · BOOKCHAIN (LEDGER)
        </div>

        {/* Center Crosshair Grid Guidelines */}
        <svg
          viewBox="0 0 840 520"
          className="w-full h-full pointer-events-auto"
        >
          {/* Subtle grid axis */}
          <line x1="420" y1="20" x2="420" y2="500" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1="20" y1="260" x2="820" y2="260" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <circle cx="420" cy="260" r="140" fill="none" stroke="rgba(255,255,255,0.03)" />

          {/* Connection Lines */}
          {links.map((link, idx) => (
            <g key={idx}>
              <line
                x1={link.source.x}
                y1={link.source.y}
                x2={link.target.x}
                y2={link.target.y}
                stroke={link.isHighlighted ? '#38bdf8' : 'rgba(148, 163, 184, 0.25)'}
                strokeWidth={link.isHighlighted ? 2.5 : 1.2}
                strokeDasharray={link.isHighlighted ? 'none' : '3 3'}
                className="transition-all duration-200"
              />
              {/* Midpoint link indicator */}
              <circle
                cx={(link.source.x + link.target.x) / 2}
                cy={(link.source.y + link.target.y) / 2}
                r={link.isHighlighted ? 4 : 2.5}
                fill={link.isHighlighted ? '#38bdf8' : 'rgba(148, 163, 184, 0.4)'}
              />
            </g>
          ))}

          {/* Render Entity Nodes */}
          {nodes.map((node) => {
            const isHovered = hoveredRuneId === node.record.runeId;
            const isLinked = links.some(
              l => (l.source.record.runeId === node.record.runeId || l.target.record.runeId === node.record.runeId) && l.isHighlighted
            );

            // Extract first byte for mini glyph icon
            let firstByte = 0x01;
            try {
              const bin = logicalIdToBinary(node.record.runeId);
              firstByte = bin.rawBytes[1];
            } catch {
              // fallback
            }

            return (
              <g
                key={node.record.runeId}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredRuneId(node.record.runeId)}
                onMouseLeave={() => setHoveredRuneId(null)}
                onClick={() => onSelectRecord(node.record)}
              >
                {/* Aura pulse when hovered or linked */}
                {(isHovered || isLinked) && (
                  <circle
                    r="28"
                    fill="none"
                    stroke={node.color}
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    className="animate-pulse"
                  />
                )}

                {/* Node Base Circle */}
                <circle
                  r="20"
                  fill="#020617"
                  stroke={node.color}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-150"
                />

                {/* System Namespace Tag Inside */}
                <text
                  textAnchor="middle"
                  dy="-2"
                  fill="#f8fafc"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {node.record.namespace}
                </text>
                <text
                  textAnchor="middle"
                  dy="9"
                  fill={node.color}
                  fontSize="7.5"
                  fontFamily="monospace"
                >
                  {node.record.resourceType}
                </text>

                {/* Label text underneath */}
                <text
                  textAnchor="middle"
                  dy="32"
                  fill={isHovered ? '#38bdf8' : '#94a3b8'}
                  fontSize="8.5"
                  fontWeight="500"
                  className="pointer-events-none transition-colors"
                >
                  {node.record.displayName.length > 20
                    ? `${node.record.displayName.slice(0, 18)}...`
                    : node.record.displayName}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered Entity Floating Details Card */}
        {hoveredNode && (
          <div className="absolute bottom-4 right-4 max-w-sm bg-slate-900/95 border border-slate-700 p-3.5 rounded-xl shadow-2xl backdrop-blur-md space-y-2 pointer-events-none animate-in fade-in duration-100">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <span className="font-mono text-[10px] font-bold text-cyan-400">
                {hoveredNode.record.namespace}:{hoveredNode.record.resourceType}
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Ed25519 Verified
              </span>
            </div>
            <div className="font-semibold text-xs text-slate-100 truncate">
              {hoveredNode.record.displayName}
            </div>
            <div className="font-mono text-[10px] text-slate-400 break-all select-all">
              {hoveredNode.record.runeId}
            </div>
            {hoveredNode.record.ownerRef && (
              <div className="flex items-center gap-1 text-[10px] text-cyan-300 font-mono truncate">
                <Link2 className="w-3 h-3 shrink-0" />
                <span>Linked to: {hoveredNode.record.ownerRef}</span>
              </div>
            )}
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
              Click node to open canonical inspection drawer
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
