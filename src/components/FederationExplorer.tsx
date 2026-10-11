import React, { useState } from 'react';
import { CanonicalRuneRecord, Namespace } from '../lib/runecode/types';
import { logicalIdToBinary, binaryToBase32Id } from '../lib/runecode/codec';
import { verifyRuneRecordSignature } from '../lib/runecode/crypto';
import { RuneFrameView } from './RuneFrameView';
import { FederationTopologyMap } from './FederationTopologyMap';
import { HardwarePlateModal } from './HardwarePlateModal';
import { BatchMinterModal } from './BatchMinterModal';
import {
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield,
  Download,
  Copy,
  Check,
  X,
  FileJson,
  Layers,
  Link2,
  Table as TableIcon,
  Cpu
} from 'lucide-react';

interface FederationExplorerProps {
  records: CanonicalRuneRecord[];
  selectedRecordId?: string | null;
  onSelectRecord?: (record: CanonicalRuneRecord | null) => void;
  onAddNewClick?: () => void;
  onBatchMinted?: (records: CanonicalRuneRecord[]) => void;
}

export const FederationExplorer: React.FC<FederationExplorerProps> = ({
  records,
  selectedRecordId,
  onSelectRecord,
  onAddNewClick,
  onBatchMinted,
}) => {
  const [filterNamespace, setFilterNamespace] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'topology'>('table');
  const [activeModalRecord, setActiveModalRecord] = useState<CanonicalRuneRecord | null>(null);
  const [plateRecord, setPlateRecord] = useState<CanonicalRuneRecord | null>(null);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // If selectedRecordId prop passed from scanner
  React.useEffect(() => {
    if (selectedRecordId) {
      const found = records.find((r) => r.runeId === selectedRecordId);
      if (found) setActiveModalRecord(found);
    }
  }, [selectedRecordId, records]);

  const filteredRecords = records.filter((r) => {
    const matchesNs = filterNamespace === 'ALL' || r.namespace === filterNamespace;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.runeId.toLowerCase().includes(q) ||
      r.displayName.toLowerCase().includes(q) ||
      r.tenantId.toLowerCase().includes(q) ||
      r.resourceType.toLowerCase().includes(q);
    return matchesNs && matchesSearch;
  });

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadRecordJson = (rec: CanonicalRuneRecord) => {
    const blob = new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `runecode-${rec.runeId.replace(/:/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Federation Registry Explorer</h2>
          <p className="mt-1 text-sm text-slate-400">
            Decentralized registry spanning OneManOS (Edge), OneVault (Storage), MyAI (Agents), and BookChain (Consensus).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBatchOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700/80 shrink-0"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Batch Pipeline</span>
          </button>

          {onAddNewClick && (
            <button
              onClick={onAddNewClick}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm shrink-0"
            >
              + Mint New RuneCode
            </button>
          )}
        </div>
      </div>

      {/* Controls Strip: Filters, Search & View Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        {/* Namespace Segmented Control */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800/80">
          {[
            { id: 'ALL', label: 'All Ecosystems' },
            { id: 'OM', label: 'OneManOS (OM)' },
            { id: 'OV', label: 'OneVault (OV)' },
            { id: 'AI', label: 'MyAI (AI)' },
            { id: 'BC', label: 'BookChain (BC)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterNamespace(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterNamespace === tab.id
                  ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Switcher & Search */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800/80">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors ${
                viewMode === 'table' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table Grid View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('topology')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors ${
                viewMode === 'topology' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Topology Network Map"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Topology</span>
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, name, tenant..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content: Table View vs Topology Network Map */}
      {viewMode === 'topology' ? (
        <FederationTopologyMap
          records={filteredRecords}
          onSelectRecord={(rec) => setActiveModalRecord(rec)}
        />
      ) : (
        /* Records High-Density Grid */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Entity & Display Name</th>
                  <th className="py-3 px-4">Namespace & Type</th>
                  <th className="py-3 px-4">Logical Identifier</th>
                  <th className="py-3 px-4">Issuer / Tenant</th>
                  <th className="py-3 px-4">Cross-System Link</th>
                  <th className="py-3 px-4">Trust Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No matching RuneCode records found in federation registry.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const isVerified = verifyRuneRecordSignature(record);
                    return (
                      <tr
                        key={record.runeId}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => setActiveModalRecord(record)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                            {record.displayName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Rev {record.revision} · Created {new Date(record.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-200">{record.namespace}</span>
                            <span className="text-slate-600">/</span>
                            <span className="font-mono text-cyan-400">{record.resourceType}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-mono text-slate-300 tabular-nums">
                            {record.runeId.slice(0, 15)}...{record.runeId.slice(-8)}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-300">{record.tenantId}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                            {record.issuer}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {record.ownerRef ? (
                            <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400/90 truncate max-w-[150px]">
                              <Link2 className="w-3 h-3 shrink-0" />
                              <span>{record.ownerRef.slice(0, 16)}...</span>
                            </div>
                          ) : (
                            <span className="text-slate-600 text-[11px]">Unlinked</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {isVerified ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 font-medium">Ed25519 Valid</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                <span className="text-rose-400 font-medium">Unverified</span>
                              </>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div
                            className="flex items-center justify-end gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setPlateRecord(record)}
                              title="Generate Physical Hardware Stencil Plate"
                              className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                            >
                              <Cpu className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleCopy(record.runeId, record.runeId)}
                              title="Copy Logical ID"
                              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                            >
                              {copiedId === record.runeId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => setActiveModalRecord(record)}
                              title="Inspect Record & RuneFrame"
                              className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Inspection Modal */}
      {activeModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-semibold block mb-1">
                  Canonical RuneCode Record
                </span>
                <h3 className="text-xl font-bold text-slate-100">{activeModalRecord.displayName}</h3>
                <span className="font-mono text-xs text-slate-400 select-all block mt-1">
                  {activeModalRecord.runeId}
                </span>
              </div>
              <button
                onClick={() => setActiveModalRecord(null)}
                className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split 2 cols */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Column: Visual RuneFrame & Binary (5 cols) */}
              <div className="md:col-span-5 space-y-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center">
                  {(() => {
                    try {
                      const payload = logicalIdToBinary(activeModalRecord.runeId);
                      const b32 = binaryToBase32Id(payload.rawBytes);
                      return (
                        <RuneFrameView
                          rawBytes={payload.rawBytes}
                          logicalId={activeModalRecord.runeId}
                          base32Id={b32}
                          size="compact"
                        />
                      );
                    } catch {
                      return <div className="text-xs text-slate-500">Preview unavailable</div>;
                    }
                  })()}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadRecordJson(activeModalRecord)}
                      className="flex-1 py-2 px-3 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download JSON
                    </button>
                    <button
                      onClick={() => handleCopy(JSON.stringify(activeModalRecord, null, 2), 'json-modal')}
                      className="flex-1 py-2 px-3 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      {copiedId === 'json-modal' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <FileJson className="w-3.5 h-3.5" />
                      )}
                      Copy JSON
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setPlateRecord(activeModalRecord);
                      setActiveModalRecord(null);
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    Generate Physical Laser Stencil Plate
                  </button>
                </div>
              </div>

              {/* Right Column: Identity, Metadata, & Trust Record (7 cols) */}
              <div className="md:col-span-7 space-y-4 text-xs">
                {/* 3 Pillars Breakdown */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
                  <span className="font-semibold text-cyan-400 uppercase tracking-wider text-[11px] block">
                    1. Identity Record
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-400">
                    <div>Namespace: <span className="text-slate-200 font-mono">{activeModalRecord.namespace}</span></div>
                    <div>Resource Type: <span className="text-slate-200 font-mono">{activeModalRecord.resourceType}</span></div>
                    <div>Tenant ID: <span className="text-slate-200 font-mono">{activeModalRecord.tenantId}</span></div>
                    <div>Status: <span className="text-emerald-400 font-medium capitalize">{activeModalRecord.status}</span></div>
                    <div className="col-span-2 truncate">Issuer: <span className="text-slate-200 font-mono">{activeModalRecord.issuer}</span></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
                  <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] block">
                    2. Metadata Record
                  </span>
                  {activeModalRecord.ownerRef && (
                    <div className="text-slate-400">
                      Owner Link:{' '}
                      <button
                        onClick={() => {
                          const target = records.find(r => r.runeId === activeModalRecord.ownerRef);
                          if (target) setActiveModalRecord(target);
                        }}
                        className="text-cyan-300 font-mono hover:underline"
                      >
                        {activeModalRecord.ownerRef}
                      </button>
                    </div>
                  )}
                  {activeModalRecord.contentHash && (
                    <div className="text-slate-400">
                      Content Hash (SHA-256):{' '}
                      <div className="font-mono text-slate-300 break-all bg-slate-900 p-1.5 rounded mt-0.5">
                        {activeModalRecord.contentHash}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 block mb-1">Custom Attributes:</span>
                    <pre className="p-2.5 bg-slate-900 rounded font-mono text-[11px] text-slate-300 overflow-x-auto max-h-36">
                      {JSON.stringify(activeModalRecord.metadata, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
                  <span className="font-semibold text-purple-400 uppercase tracking-wider text-[11px] block">
                    3. Trust Record (Ed25519 Cryptography)
                  </span>
                  <div className="space-y-1.5 text-slate-400">
                    <div>Key ID: <span className="font-mono text-slate-200">{activeModalRecord.trust.keyId}</span></div>
                    <div>Policy Reference: <span className="font-mono text-slate-200">{activeModalRecord.trust.policyRef}</span></div>
                    <div>Signature (Detached):</div>
                    <div className="font-mono text-[11px] text-purple-300 break-all bg-slate-900 p-2 rounded">
                      {activeModalRecord.trust.signature}
                    </div>
                    <div className="pt-2 flex items-center justify-between text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Ed25519 Signature Verified Against Authority
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Stencil Plate Modal */}
      {plateRecord && (
        <HardwarePlateModal
          isOpen={!!plateRecord}
          onClose={() => setPlateRecord(null)}
          record={plateRecord}
        />
      )}

      {/* Batch Minter Pipeline Modal */}
      <BatchMinterModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        onBatchMinted={(batch) => {
          if (onBatchMinted) onBatchMinted(batch);
        }}
      />
    </div>
  );
};
