import React, { useState, useEffect } from 'react';
import { NAMESPACE_REGISTRY, Namespace, CanonicalRuneRecord, RuneBinaryPayload } from '../lib/runecode/types';
import { generateUUIDv7 } from '../lib/runecode/uuidv7';
import { logicalIdToBinary, binaryToBase32Id } from '../lib/runecode/codec';
import { ROOT_AUTHORITY_KEYPAIR, signRuneRecord, sha256Hex } from '../lib/runecode/crypto';
import { RuneFrameView } from './RuneFrameView';
import { Sparkles, Key, FileCheck, CheckCircle2, RefreshCw, Hash, Database } from 'lucide-react';

interface StudioMinterProps {
  onMintSuccess: (record: CanonicalRuneRecord) => void;
}

export const StudioMinter: React.FC<StudioMinterProps> = ({ onMintSuccess }) => {
  const [namespace, setNamespace] = useState<Namespace>('AI');
  const [resourceType, setResourceType] = useState<string>('AGT');
  const [uuid, setUuid] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('Office Assistant');
  const [tenantId, setTenantId] = useState<string>('nextwaver');
  const [issuer, setIssuer] = useState<string>('did:web:nextwaver.net');
  const [ownerRef, setOwnerRef] = useState<string>('RC1:OM:DEV:0199a5b2-7c80-7000-8000-000000000001');
  const [contentHash, setContentHash] = useState<string>('');
  const [metadataJson, setMetadataJson] = useState<string>(
    JSON.stringify(
      {
        runtime: 'ollama',
        capabilities: ['document.search', 'task.assist'],
      },
      null,
      2
    )
  );
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [mintedRecord, setMintedRecord] = useState<CanonicalRuneRecord | null>(null);

  // Initialize fresh UUIDv7 on mount
  useEffect(() => {
    const fresh = generateUUIDv7();
    setUuid(fresh.string);
  }, []);

  // When namespace changes, set first available resource type
  const handleNamespaceChange = (newNs: Namespace) => {
    setNamespace(newNs);
    const types = Object.keys(NAMESPACE_REGISTRY[newNs].types);
    if (!types.includes(resourceType)) {
      setResourceType(types[0]);
    }
  };

  const handleGenerateFreshUuid = () => {
    const fresh = generateUUIDv7();
    setUuid(fresh.string);
  };

  const handleQuickHashText = async (text: string) => {
    if (!text) return;
    const hash = await sha256Hex(text);
    setContentHash(hash);
  };

  // Compute live logical ID and binary payload
  const logicalId = `RC1:${namespace}:${resourceType}:${uuid || '00000000-0000-7000-8000-000000000000'}`;

  let binaryPayload: RuneBinaryPayload | undefined;
  let base32Id = '';
  let formatError = '';

  try {
    if (uuid && uuid.replace(/-/g, '').length === 32) {
      binaryPayload = logicalIdToBinary(logicalId);
      base32Id = binaryToBase32Id(binaryPayload.rawBytes);
    }
  } catch (err: unknown) {
    formatError = (err as Error).message;
  }

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!binaryPayload || formatError) return;

    setIsMinting(true);
    try {
      let parsedMetadata: Record<string, unknown> = {};
      try {
        parsedMetadata = JSON.parse(metadataJson);
      } catch {
        parsedMetadata = { rawDescription: metadataJson };
      }

      const now = new Date().toISOString();
      const trust = await signRuneRecord(
        {
          runeId: logicalId,
          namespace,
          resourceType,
          displayName,
          tenantId,
          issuer,
          createdAt: now,
          contentHash: contentHash.trim() || undefined,
          revision: 1,
        },
        ROOT_AUTHORITY_KEYPAIR.secretKey,
        `${issuer}#key-1`
      );

      const record: CanonicalRuneRecord = {
        schema: 'https://schemas.nextwaver.net/runecode/v1/record',
        runeId: logicalId,
        namespace,
        resourceType,
        displayName,
        tenantId,
        issuer,
        ownerRef: ownerRef.trim() || undefined,
        contentHash: contentHash.trim() || undefined,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        revision: 1,
        metadata: parsedMetadata,
        trust,
      };

      setMintedRecord(record);
      onMintSuccess(record);
    } finally {
      setIsMinting(false);
    }
  };

  const nsConfig = NAMESPACE_REGISTRY[namespace];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">RuneCode Minter & Studio</h2>
        <p className="mt-1 text-sm text-slate-400">
          Mint cryptographically verifiable Universal Visual Identifiers with UUIDv7, CRC-32C, Base32,
          and Ed25519 digital signatures according to the Nextwaver RuneCode Specification 1.0.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Identity & Metadata (7 cols) */}
        <form onSubmit={handleMint} className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              1. Identity Layer Specification
            </h3>

            {/* Namespace Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Ecosystem Namespace
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(NAMESPACE_REGISTRY) as Namespace[]).map((nsKey) => {
                  const item = NAMESPACE_REGISTRY[nsKey];
                  const isSelected = namespace === nsKey;
                  return (
                    <button
                      type="button"
                      key={nsKey}
                      onClick={() => handleNamespaceChange(nsKey)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-slate-100">{item.code}</span>
                        <span className="text-[10px] font-mono text-slate-500">0x{item.hex.toString(16).padStart(2, '0').toUpperCase()}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-300 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.system}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resource Type */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Resource Type ({nsConfig.name})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {Object.entries(nsConfig.types).map(([tKey, tVal]) => {
                  const isSelected = resourceType === tKey;
                  return (
                    <button
                      type="button"
                      key={tKey}
                      onClick={() => setResourceType(tKey)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-100">{tKey}</span>
                        <span className="text-[10px] font-mono text-slate-500">0x{tVal.code.toString(16).padStart(2, '0').toUpperCase()}</span>
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">{tVal.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* UUIDv7 Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  128-Bit Unique Identifier (RFC 9562 UUIDv7)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateFreshUuid}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Generate Fresh
                </button>
              </div>
              <input
                type="text"
                value={uuid}
                onChange={(e) => setUuid(e.target.value.toLowerCase())}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs tracking-wider focus:outline-none focus:border-cyan-500"
                placeholder="0199a5b2-7c80-7000-8000-000000000001"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Time-ordered timestamp embedded in the first 48 bits for deterministic chronological sorting.
              </span>
            </div>
          </div>

          {/* Metadata Record Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              2. Canonical Metadata Record
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tenant ID</label>
                <input
                  type="text"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Issuer (DID)</label>
                <input
                  type="text"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Owner Ref (Cross-System Link)</label>
                <input
                  type="text"
                  value={ownerRef}
                  onChange={(e) => setOwnerRef(e.target.value)}
                  placeholder="RC1:OM:DEV:..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  Content Hash (SHA-256 for OneVault / Documents)
                </label>
                <button
                  type="button"
                  onClick={() => handleQuickHashText(displayName)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Hash Title
                </button>
              </div>
              <input
                type="text"
                value={contentHash}
                onChange={(e) => setContentHash(e.target.value)}
                placeholder="a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Custom Metadata JSON Attributes
              </label>
              <textarea
                rows={4}
                value={metadataJson}
                onChange={(e) => setMetadataJson(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Mint Action Button */}
          <button
            type="submit"
            disabled={isMinting || !!formatError}
            className="w-full py-3 px-6 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isMinting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Signing & Minting RuneCode...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Mint & Attest RuneCode v1.0</span>
              </>
            )}
          </button>
        </form>

        {/* Right Preview: Live RuneFrame v1 Visual & Encodings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                RuneFrame v1 Visual Seal
              </span>
              <span className="text-xs font-mono text-cyan-400">25 Bytes</span>
            </h3>

            {binaryPayload ? (
              <RuneFrameView
                rawBytes={binaryPayload.rawBytes}
                logicalId={logicalId}
                base32Id={base32Id}
                size="standard"
              />
            ) : (
              <div className="p-8 text-center text-xs text-rose-400 bg-rose-950/20 border border-rose-900/40 rounded-lg">
                {formatError || 'Invalid UUID format'}
              </div>
            )}

            {/* Encodings Inspector Box */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block mb-1">
                  Logical Identifier (Text)
                </span>
                <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-xs text-cyan-300 break-all select-all border border-slate-800">
                  {logicalId}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400 block mb-1">
                  RFC 4648 Base32 Unpadded Payload
                </span>
                <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-xs text-slate-300 break-all select-all border border-slate-800">
                  {base32Id || '...'}
                </div>
              </div>

              {binaryPayload && (
                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-950/50 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400">CRC-32C Castagnoli</span>
                  <span className="font-mono text-emerald-400 font-semibold tabular-nums">
                    0x{binaryPayload.crc32c.toString(16).padStart(8, '0').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {mintedRecord && (
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>RuneCode Minted & Signed Successfully!</span>
              </div>
              <p className="text-xs text-emerald-300/80 leading-relaxed">
                Record added to the local Federation Registry. Digital signature generated with Ed25519 key ID{' '}
                <span className="font-mono text-emerald-200">{mintedRecord.trust.keyId}</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
