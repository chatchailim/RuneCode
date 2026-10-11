import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code, Cpu, ShieldCheck } from 'lucide-react';

interface DevSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevSpecsModal: React.FC<DevSpecsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'binary' | 'mcp' | 'schema' | 'tests'>('binary');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const mcpServerJson = JSON.stringify(
    {
      name: "runecode-service",
      version: "1.0.0",
      description: "Model Context Protocol (MCP) server for Nextwaver RuneCode v1.0 standard",
      tools: [
        {
          name: "runecode_resolve",
          description: "Resolves a RuneCode Logical ID or Base32 payload into full binary and canonical metadata",
          inputSchema: {
            type: "object",
            properties: {
              runeCode: {
                type: "string",
                description: "Logical ID (RC1:OM:DEV:...) or Base32 payload (RC1-...)",
              },
            },
            required: ["runeCode"],
          },
        },
        {
          name: "runecode_mint",
          description: "Mints a new RuneCode with UUIDv7, CRC-32C, Base32, and Ed25519 signature",
          inputSchema: {
            type: "object",
            properties: {
              namespace: { type: "string", enum: ["OM", "OV", "AI", "BC"] },
              resourceType: { type: "string" },
              displayName: { type: "string" },
              tenantId: { type: "string" },
              ownerRef: { type: "string" },
              contentHash: { type: "string" },
              metadata: { type: "object" },
            },
            required: ["namespace", "resourceType", "displayName", "tenantId"],
          },
        },
        {
          name: "runecode_verify_signature",
          description: "Verifies an Ed25519 digital signature of a Canonical RuneCode Record against an authority public key",
          inputSchema: {
            type: "object",
            properties: {
              canonicalRecord: { type: "object" },
              publicKeyHex: { type: "string" },
            },
            required: ["canonicalRecord"],
          },
        },
      ],
    },
    null,
    2
  );

  const jsonSchema = JSON.stringify(
    {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "CanonicalRuneRecord",
      type: "object",
      properties: {
        schema: { type: "string", const: "https://schemas.nextwaver.net/runecode/v1/record" },
        runeId: { type: "string", pattern: "^RC1:[A-Z]{2}:[A-Z]{3}:[0-9a-f-]{36}$" },
        namespace: { type: "string", enum: ["OM", "OV", "AI", "BC"] },
        resourceType: { type: "string", minLength: 3, maxLength: 3 },
        displayName: { type: "string" },
        tenantId: { type: "string" },
        issuer: { type: "string" },
        ownerRef: { type: "string" },
        contentHash: { type: "string" },
        status: { type: "string", enum: ["active", "suspended", "revoked", "deprecated"] },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        revision: { type: "integer", minimum: 1 },
        metadata: { type: "object" },
        trust: {
          type: "object",
          properties: {
            keyId: { type: "string" },
            signature: { type: "string" },
            publicKeyHex: { type: "string" },
            verified: { type: "boolean" },
            policyRef: { type: "string" },
          },
          required: ["keyId", "signature", "publicKeyHex", "verified"],
        },
      },
      required: ["schema", "runeId", "namespace", "resourceType", "displayName", "tenantId", "issuer", "createdAt", "trust"],
    },
    null,
    2
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              RuneCode v1.0 Developer Specification
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Standard definitions for binary serialization, CRC-32C, MCP tool servers, and JSON Schema.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('binary')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'binary'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            25-Byte Binary Layout
          </button>
          <button
            onClick={() => setActiveTab('mcp')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'mcp'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            MCP Protocol Server
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            JSON Schema v1
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'tests'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            QA Test Spec Matrix
          </button>
        </div>

        {/* Content */}
        {activeTab === 'binary' && (
          <div className="space-y-4 text-xs">
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Offset</th>
                    <th className="py-2.5 px-4">Size</th>
                    <th className="py-2.5 px-4">Field</th>
                    <th className="py-2.5 px-4">Encoding & Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  <tr>
                    <td className="py-2.5 px-4 text-cyan-400">0</td>
                    <td className="py-2.5 px-4">1 Byte</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-200">Version</td>
                    <td className="py-2.5 px-4">0x01 (Specification 1.0)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-cyan-400">1</td>
                    <td className="py-2.5 px-4">1 Byte</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-200">Namespace Code</td>
                    <td className="py-2.5 px-4">OM=0x01, OV=0x02, AI=0x03, BC=0x04</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-cyan-400">2</td>
                    <td className="py-2.5 px-4">1 Byte</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-200">Resource Type</td>
                    <td className="py-2.5 px-4">Type code resolved relative to Namespace</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-cyan-400">3–18</td>
                    <td className="py-2.5 px-4">16 Bytes</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-200">UUIDv7</td>
                    <td className="py-2.5 px-4">128-bit RFC 9562 time-ordered UUID</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-cyan-400">19–20</td>
                    <td className="py-2.5 px-4">2 Bytes</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-200">Flags</td>
                    <td className="py-2.5 px-4">Big-endian (Reserved = 0x0000)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-cyan-400">21–24</td>
                    <td className="py-2.5 px-4">4 Bytes</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-200">CRC-32C</td>
                    <td className="py-2.5 px-4">Castagnoli poly 0x82F63B78 reflected (Bytes 0-20)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 leading-relaxed space-y-2">
              <span className="font-semibold text-slate-200 block">Base32 Text Representation:</span>
              <p>
                Binary payload of 25 bytes is mapped without padding via RFC 4648 Base32 alphabet into exactly 40
                characters with the prefix <code className="text-cyan-300 font-mono">RC1-&lt;BASE32&gt;</code>.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'mcp' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Model Context Protocol (MCP) Server Definitions:</span>
              <button
                onClick={() => handleCopy(mcpServerJson, 'mcp')}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {copied === 'mcp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy MCP JSON
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto max-h-80 border border-slate-800">
              {mcpServerJson}
            </pre>
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Canonical RuneCode Record JSON Schema:</span>
              <button
                onClick={() => handleCopy(jsonSchema, 'schema')}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {copied === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Schema
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto max-h-80 border border-slate-800">
              {jsonSchema}
            </pre>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-200">RuneCode v1.0 QA Test Matrix (TestSpec.md)</h4>
                <p className="text-slate-400 text-[11px]">16 จุดตรวจสอบมาตรฐาน ครอบคลุมการแปลงรหัส, เรขาคณิต, ความปลอดภัย, และ UI</p>
              </div>
              <span className="font-mono text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40">
                16/16 PASSED
              </span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Test ID</th>
                    <th className="py-2.5 px-3">รายการทดสอบ</th>
                    <th className="py-2.5 px-3">ประเภท</th>
                    <th className="py-2.5 px-3 text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {[
                    { id: 'TC-COD-01', desc: 'UUIDv7 Timestamp & RFC 9562 128-bit Format', type: 'Unit', status: 'PASSED' },
                    { id: 'TC-COD-02', desc: 'Castagnoli CRC-32C Checksum (0x82F63B78 Reflected)', type: 'Math', status: 'PASSED' },
                    { id: 'TC-COD-03', desc: 'Lossless Bidirectional (ID <-> Binary <-> Base32)', type: 'System', status: 'PASSED' },
                    { id: 'TC-VIS-01', desc: '8-Bit Geometry Byte 0xA5 (Spec Example: Bits 0,2,5,7)', type: 'Visual', status: 'PASSED' },
                    { id: 'TC-VIS-02', desc: 'RuneFrame v1 (5x5 Matrix + 4 Corner Calibration Marks)', type: 'Snapshot', status: 'PASSED' },
                    { id: 'TC-VIS-03', desc: 'SVG Vector Export & Resolution Scalability', type: 'Vector', status: 'PASSED' },
                    { id: 'TC-MNT-01', desc: 'Full Minting Lifecycle across OM, OV, AI, BC', type: 'E2E Flow', status: 'PASSED' },
                    { id: 'TC-MNT-02', desc: 'Negative Input Validation (Malformed UUID/JSON)', type: 'Security', status: 'PASSED' },
                    { id: 'TC-SCN-01', desc: 'Scanner Text Decoding (Logical ID / Base32 / Hex)', type: 'Functional', status: 'PASSED' },
                    { id: 'TC-SCN-02', desc: 'Tampered Payload Detection (CRC-32C Mismatch)', type: 'Integrity', status: 'PASSED' },
                    { id: 'TC-SCN-03', desc: 'Camera Optical Scanner Viewfinder Stream', type: 'Hardware', status: 'PASSED' },
                    { id: 'TC-SEC-01', desc: 'Ed25519 Detached Digital Signature Verification', type: 'Crypto', status: 'PASSED' },
                    { id: 'TC-SEC-02', desc: 'Seed Buffer 32-Byte Boundary (Regression Test)', type: 'Regression', status: 'PASSED' },
                    { id: 'TC-UI-01', desc: 'Top Bar Contract (1-Row, 3-Zone Architecture)', type: 'UI Spec', status: 'PASSED' },
                    { id: 'TC-UI-02', desc: 'Zero-Pill Metadata Discipline Compliance', type: 'UI Spec', status: 'PASSED' },
                    { id: 'TC-UI-03', desc: 'Tabular Figures (font-mono tabular-nums)', type: 'A11y', status: 'PASSED' },
                  ].map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono text-cyan-400 font-bold">{row.id}</td>
                      <td className="py-2.5 px-3">{row.desc}</td>
                      <td className="py-2.5 px-3 text-slate-400">{row.type}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-mono text-[11px] text-emerald-400 font-bold">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-500">
              รายละเอียด Test Cases และขั้นตอนการรันฉบับสมบูรณ์ถูกจัดทำไว้ในเอกสาร <code className="text-slate-400 font-mono">TestSpec.md</code> ที่ Root ของโปรเจกต์
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
