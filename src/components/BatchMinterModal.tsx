import React, { useState } from 'react';
import { NAMESPACE_REGISTRY, Namespace, CanonicalRuneRecord } from '../lib/runecode/types';
import { generateUUIDv7 } from '../lib/runecode/uuidv7';
import { ROOT_AUTHORITY_KEYPAIR, signRuneRecord } from '../lib/runecode/crypto';
import { X, Layers, Download, CheckCircle2, RefreshCw } from 'lucide-react';

interface BatchMinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchMinted: (records: CanonicalRuneRecord[]) => void;
}

export const BatchMinterModal: React.FC<BatchMinterModalProps> = ({
  isOpen,
  onClose,
  onBatchMinted,
}) => {
  const [namespace, setNamespace] = useState<Namespace>('OM');
  const [resourceType, setResourceType] = useState<string>('DEV');
  const [prefixName, setPrefixName] = useState<string>('Edge Setbox Batch');
  const [tenantId, setTenantId] = useState<string>('nextwaver-edge');
  const [count, setCount] = useState<number>(5);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [mintedResults, setMintedResults] = useState<CanonicalRuneRecord[]>([]);

  if (!isOpen) return null;

  const handleRunBatch = async () => {
    setIsMinting(true);
    const records: CanonicalRuneRecord[] = [];

    try {
      const now = new Date().toISOString();
      for (let i = 1; i <= count; i++) {
        const fresh = generateUUIDv7();
        const runeId = `RC1:${namespace}:${resourceType}:${fresh.string}`;
        const displayName = `${prefixName} #${String(i).padStart(3, '0')}`;

        const trust = await signRuneRecord(
          {
            runeId,
            namespace,
            resourceType,
            displayName,
            tenantId,
            issuer: 'did:web:nextwaver.net',
            createdAt: now,
            revision: 1,
          },
          ROOT_AUTHORITY_KEYPAIR.secretKey,
          'did:web:nextwaver.net#key-1'
        );

        records.push({
          schema: 'https://schemas.nextwaver.net/runecode/v1/record',
          runeId,
          namespace,
          resourceType,
          displayName,
          tenantId,
          issuer: 'did:web:nextwaver.net',
          status: 'active',
          createdAt: now,
          updatedAt: now,
          revision: 1,
          metadata: {
            batchId: `BATCH-${Date.now()}`,
            sequence: i,
            totalBatch: count,
          },
          trust,
        });
      }

      setMintedResults(records);
      onBatchMinted(records);
    } finally {
      setIsMinting(false);
    }
  };

  const handleDownloadBatchJson = () => {
    const blob = new Blob([JSON.stringify(mintedResults, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `runecode-batch-${namespace}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const types = Object.keys(NAMESPACE_REGISTRY[namespace].types);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-400 font-bold text-xs">ENTERPRISE PIPELINE</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Bulk Generation</span>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Batch Minting & Registration Pipeline
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              สร้าง RuneCode พร้อมกันเป็นชุดสำหรับโรงงานผลิตฮาร์ดแวร์ หรือการทำดัชนีเอกสารทั้งคลัง
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Ecosystem Namespace</label>
              <select
                value={namespace}
                onChange={(e) => {
                  const ns = e.target.value as Namespace;
                  setNamespace(ns);
                  setResourceType(Object.keys(NAMESPACE_REGISTRY[ns].types)[0]);
                }}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:border-cyan-500"
              >
                <option value="OM">OneManOS (OM)</option>
                <option value="OV">OneVault (OV)</option>
                <option value="AI">MyAI (AI)</option>
                <option value="BC">BookChain (BC)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Resource Type</label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:border-cyan-500"
              >
                {types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">ชื่อนำหน้า (Prefix Name)</label>
              <input
                type="text"
                value={prefixName}
                onChange={(e) => setPrefixName(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">จำนวนที่ต้องการสร้าง (Batch Count)</label>
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:border-cyan-500"
              >
                <option value={5}>5 รายการ</option>
                <option value={10}>10 รายการ</option>
                <option value={20}>20 รายการ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Tenant ID</label>
            <input
              type="text"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRunBatch}
          disabled={isMinting}
          className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isMinting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating & Signing Batch ({count} Records)...</span>
            </>
          ) : (
            <>
              <Layers className="w-4 h-4" />
              <span>Execute Batch Minting ({count} Records)</span>
            </>
          )}
        </button>

        {/* Results */}
        {mintedResults.length > 0 && (
          <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/40 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                สำเร็จ! สร้างและเซ็นลายเซ็นเรียบร้อย {mintedResults.length} รายการ
              </span>
              <button
                onClick={handleDownloadBatchJson}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Batch JSON</span>
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 font-mono text-[11px] text-slate-400 divide-y divide-slate-800/60">
              {mintedResults.map((r, i) => (
                <div key={r.runeId} className="pt-1 flex items-center justify-between">
                  <span className="text-slate-200">{r.displayName}</span>
                  <span className="text-cyan-400 text-[10px]">{r.runeId}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
