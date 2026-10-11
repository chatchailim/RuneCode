import React, { useState } from 'react';
import { resolveRuneCode, logicalIdToBinary } from '../lib/runecode/codec';
import { generateUUIDv7 } from '../lib/runecode/uuidv7';
import { ROOT_AUTHORITY_KEYPAIR, signRuneRecord, verifyRuneRecordSignature, ROOT_PUBLIC_KEY_HEX } from '../lib/runecode/crypto';
import { CanonicalRuneRecord, Namespace } from '../lib/runecode/types';
import { Terminal, Play, Copy, Check, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface McpPlaygroundProps {
  registry: CanonicalRuneRecord[];
  onMintedRecord?: (record: CanonicalRuneRecord) => void;
}

export const McpPlayground: React.FC<McpPlaygroundProps> = ({ registry, onMintedRecord }) => {
  const [selectedTool, setSelectedTool] = useState<'runecode_resolve' | 'runecode_mint' | 'runecode_verify_signature'>('runecode_resolve');
  const [inputJson, setInputJson] = useState<string>(
    JSON.stringify({ runeCode: 'RC1:AI:AGT:0199a5b2-7c80-7000-8000-000000000003' }, null, 2)
  );
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const setToolPreset = (tool: 'runecode_resolve' | 'runecode_mint' | 'runecode_verify_signature') => {
    setSelectedTool(tool);
    setResponseJson(null);
    setLatencyMs(null);

    if (tool === 'runecode_resolve') {
      setInputJson(JSON.stringify({ runeCode: 'RC1:AI:AGT:0199a5b2-7c80-7000-8000-000000000003' }, null, 2));
    } else if (tool === 'runecode_mint') {
      setInputJson(
        JSON.stringify(
          {
            namespace: 'AI',
            resourceType: 'AGT',
            displayName: 'Agent Orion (Autonomous Code Reviewer)',
            tenantId: 'nextwaver-ai',
            metadata: {
              model: 'gemini-2.5-pro',
              sandboxLevel: 'level-3-isolated',
              permissions: ['code.read', 'lint.execute'],
            },
          },
          null,
          2
        )
      );
    } else if (tool === 'runecode_verify_signature') {
      const sample = registry[0] || {
        runeId: 'RC1:OM:DEV:0199a5b2-7c80-7000-8000-000000000001',
        trust: { signature: 'dummy', publicKeyHex: ROOT_PUBLIC_KEY_HEX },
      };
      setInputJson(
        JSON.stringify(
          {
            canonicalRecord: sample,
            publicKeyHex: ROOT_PUBLIC_KEY_HEX,
          },
          null,
          2
        )
      );
    }
  };

  const executeMcpTool = async () => {
    setIsExecuting(true);
    const start = performance.now();
    try {
      const params = JSON.parse(inputJson);
      let result: unknown = null;

      if (selectedTool === 'runecode_resolve') {
        const resolved = resolveRuneCode(params.runeCode);
        const matched = registry.find(r => r.runeId === resolved.logicalId);
        result = {
          status: 'success',
          resolved: {
            logicalId: resolved.logicalId,
            base32Id: resolved.base32Id,
            namespace: resolved.namespace,
            resourceType: resolved.resourceType,
            uuid: resolved.uuid,
            crcValid: resolved.crcValid,
            hexPayload: resolved.hexString,
          },
          canonicalRecord: matched || null,
        };
      } else if (selectedTool === 'runecode_mint') {
        const freshUuid = generateUUIDv7().string;
        const logicalId = `RC1:${params.namespace}:${params.resourceType}:${freshUuid}`;
        const now = new Date().toISOString();

        const trust = await signRuneRecord(
          {
            runeId: logicalId,
            namespace: params.namespace,
            resourceType: params.resourceType,
            displayName: params.displayName,
            tenantId: params.tenantId,
            issuer: 'did:web:nextwaver.net',
            createdAt: now,
            revision: 1,
          },
          ROOT_AUTHORITY_KEYPAIR.secretKey,
          'did:web:nextwaver.net#key-1'
        );

        const newRecord: CanonicalRuneRecord = {
          schema: 'https://schemas.nextwaver.net/runecode/v1/record',
          runeId: logicalId,
          namespace: params.namespace as Namespace,
          resourceType: params.resourceType,
          displayName: params.displayName,
          tenantId: params.tenantId,
          issuer: 'did:web:nextwaver.net',
          status: 'active',
          createdAt: now,
          updatedAt: now,
          revision: 1,
          metadata: params.metadata || {},
          trust,
        };

        if (onMintedRecord) {
          onMintedRecord(newRecord);
        }

        result = {
          status: 'success',
          message: 'RuneCode minted and attested by Root Authority',
          record: newRecord,
        };
      } else if (selectedTool === 'runecode_verify_signature') {
        const isValid = verifyRuneRecordSignature(params.canonicalRecord, params.publicKeyHex);
        result = {
          status: 'success',
          verified: isValid,
          algorithm: 'Ed25519-SHA256',
          authority: params.canonicalRecord?.issuer || 'did:web:nextwaver.net',
        };
      }

      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setResponseJson(JSON.stringify(result, null, 2));
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setResponseJson(
        JSON.stringify(
          {
            status: 'error',
            error: (err as Error).message,
            jsonrpc: '2.0',
          },
          null,
          2
        )
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyResponse = async () => {
    if (!responseJson) return;
    await navigator.clipboard.writeText(responseJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            Model Context Protocol (MCP) Agent Console
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            จำลองและทดสอบการเรียกใช้งานเครื่องมือ RuneCode โดยตรงแบบ AI Agent (JSON-RPC Protocol Client)
          </p>
        </div>

        {/* Tool Selectors */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
          {[
            { id: 'runecode_resolve' as const, label: 'runecode_resolve' },
            { id: 'runecode_mint' as const, label: 'runecode_mint' },
            { id: 'runecode_verify_signature' as const, label: 'runecode_verify_signature' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setToolPreset(t.id)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
                selectedTool === t.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Payload (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Tool Arguments (Input JSON):</span>
            <span className="text-[11px] font-mono text-cyan-400">Tool: {selectedTool}</span>
          </div>

          <textarea
            rows={12}
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 shadow-inner"
          />

          <button
            onClick={executeMcpTool}
            disabled={isExecuting}
            className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Execute MCP Tool Request</span>
          </button>
        </div>

        {/* Right: Response Output (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">JSON-RPC Response:</span>
              {latencyMs !== null && (
                <span className="font-mono text-[11px] text-emerald-400 tabular-nums">
                  Latency: {latencyMs} ms
                </span>
              )}
            </div>

            {responseJson && (
              <button
                onClick={handleCopyResponse}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copy Response
              </button>
            )}
          </div>

          <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs overflow-x-auto min-h-[285px] max-h-[340px] shadow-inner select-all">
            {responseJson || '// Output response will be displayed here upon tool execution...'}
          </pre>
        </div>
      </div>
    </div>
  );
};
