import React, { useState } from 'react';
import {
  ROOT_PUBLIC_KEY_HEX,
  generateEd25519KeyPair,
  verifyRuneRecordSignature,
  sha256Hex,
} from '../lib/runecode/crypto';
import { CanonicalRuneRecord } from '../lib/runecode/types';
import { McpPlayground } from './McpPlayground';
import { ShieldCheck, Key, RefreshCw, Copy, Check, FileCheck, CheckCircle2, XCircle, Terminal } from 'lucide-react';

interface TrustAuthorityProps {
  registry?: CanonicalRuneRecord[];
  onMintedRecord?: (record: CanonicalRuneRecord) => void;
}

export const TrustAuthority: React.FC<TrustAuthorityProps> = ({ registry = [], onMintedRecord }) => {
  const [activeSubTab, setActiveSubTab] = useState<'authority' | 'mcp'>('authority');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [generatedKeypair, setGeneratedKeypair] = useState<{
    publicKeyHex: string;
    secretKeyHex: string;
  } | null>(null);

  // Verification testbed state
  const [testJson, setTestJson] = useState<string>(
    JSON.stringify(
      {
        schema: 'https://schemas.nextwaver.net/runecode/v1/record',
        runeId: 'RC1:AI:AGT:0199a5b2-7c80-7000-8000-000000000003',
        namespace: 'AI',
        resourceType: 'AGT',
        displayName: 'MyAI Sovereign Executive Agent - Nova',
        tenantId: 'nextwaver-ai',
        issuer: 'did:web:nextwaver.net',
        createdAt: '2026-10-10T12:00:00Z',
        revision: 1,
        trust: {
          keyId: 'did:web:nextwaver.net#key-1',
          signature: '',
          publicKeyHex: ROOT_PUBLIC_KEY_HEX,
          verified: true,
          policyRef: 'urn:nextwaver:policy:strict-ed25519:v1',
        },
      },
      null,
      2
    )
  );
  const [verificationResult, setVerificationResult] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
  } | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateKey = () => {
    const kp = generateEd25519KeyPair();
    setGeneratedKeypair(kp);
  };

  const handleTestVerification = () => {
    try {
      const parsed = JSON.parse(testJson) as CanonicalRuneRecord;
      if (!parsed.trust || !parsed.trust.signature) {
        setVerificationResult({
          tested: true,
          valid: false,
          message: 'Record missing trust object or signature hex string.',
        });
        return;
      }
      const isValid = verifyRuneRecordSignature(parsed);
      setVerificationResult({
        tested: true,
        valid: isValid,
        message: isValid
          ? 'Ed25519 signature is authentic and cryptographic envelope is untampered!'
          : 'Invalid signature! Content or key does not match canonical payload.',
      });
    } catch (err: unknown) {
      setVerificationResult({
        tested: true,
        valid: false,
        message: 'JSON parse error: ' + (err as Error).message,
      });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Trust Layer & Cryptographic Authority</h2>
          <p className="mt-1 text-sm text-slate-400">
            Ed25519 digital signature validation, DID resolution (`did:web:nextwaver.net`), and separation of
            Identity, Metadata, and Trust Records according to RuneCode Specification 1.0.
          </p>
        </div>

        {/* Sub-tab toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
          <button
            onClick={() => setActiveSubTab('authority')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeSubTab === 'authority'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authority & Keyrings</span>
          </button>
          <button
            onClick={() => setActiveSubTab('mcp')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeSubTab === 'mcp'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Agent MCP Console</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'mcp' ? (
        <McpPlayground registry={registry} onMintedRecord={onMintedRecord} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Authority & Keyring Management (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Root Trust Authority Profile */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Root Trust Authority (`did:web`)
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  Authoritative Root
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block mb-1">Decentralized Identifier (DID):</span>
                  <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-cyan-300 border border-slate-800 flex items-center justify-between">
                    <span>did:web:nextwaver.net</span>
                    <button
                      onClick={() => handleCopy('did:web:nextwaver.net', 'did')}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      {copiedKey === 'did' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1">Authority Ed25519 Public Key (Hex):</span>
                  <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-slate-200 border border-slate-800 break-all select-all flex items-center justify-between">
                    <span className="text-[11px]">{ROOT_PUBLIC_KEY_HEX}</span>
                    <button
                      onClick={() => handleCopy(ROOT_PUBLIC_KEY_HEX, 'root-pub')}
                      className="text-slate-400 hover:text-slate-200 ml-2 shrink-0"
                    >
                      {copiedKey === 'root-pub' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                  All RuneCodes minted by this authority carry detached Ed25519 signatures binding the canonical
                  Identity Record (Namespace, Type, UUIDv7, Timestamp) and Content Hash.
                </div>
              </div>
            </div>

            {/* Tenant & Device Key Generator */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  Sub-Authority Keypair Generator
                </h3>
                <button
                  onClick={handleGenerateKey}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  Generate New
                </button>
              </div>

              {generatedKeypair ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Generated Public Key:</span>
                    <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-cyan-300 border border-slate-800 break-all select-all flex items-center justify-between">
                      <span className="text-[11px]">{generatedKeypair.publicKeyHex}</span>
                      <button
                        onClick={() => handleCopy(generatedKeypair.publicKeyHex, 'gen-pub')}
                        className="text-slate-400 hover:text-slate-200 ml-2 shrink-0"
                      >
                        {copiedKey === 'gen-pub' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">Secret Key (Keep Secure):</span>
                    <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-amber-300 border border-slate-800 break-all select-all flex items-center justify-between">
                      <span className="text-[11px]">{generatedKeypair.secretKeyHex.slice(0, 32)}...</span>
                      <button
                        onClick={() => handleCopy(generatedKeypair.secretKeyHex, 'gen-sec')}
                        className="text-slate-400 hover:text-slate-200 ml-2 shrink-0"
                      >
                        {copiedKey === 'gen-sec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Click "Generate New" to create a fresh 32-byte Ed25519 keypair for edge appliances or independent tenants.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Signature Verification Testbed (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                Cryptographic Signature Verifier Testbed
              </h3>

              <p className="text-xs text-slate-400">
                Test detached Ed25519 verification on any canonical JSON record payload:
              </p>

              <textarea
                rows={12}
                value={testJson}
                onChange={(e) => setTestJson(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />

              <button
                onClick={handleTestVerification}
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Verify Canonical Signature Envelope
              </button>

              {verificationResult && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                    verificationResult.valid
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {verificationResult.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">
                      {verificationResult.valid ? 'Signature Authenticity Verified' : 'Verification Failed'}
                    </span>
                    <span className="opacity-90">{verificationResult.message}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
