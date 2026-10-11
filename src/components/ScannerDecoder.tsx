import React, { useState, useRef, useEffect } from 'react';
import { resolveRuneCode } from '../lib/runecode/codec';
import { extractUUIDv7Timestamp } from '../lib/runecode/uuidv7';
import { NAMESPACE_REGISTRY, CanonicalRuneRecord, RuneBinaryPayload } from '../lib/runecode/types';
import { RuneFrameView } from './RuneFrameView';
import {
  Scan,
  Camera,
  Upload,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  CameraOff
} from 'lucide-react';

interface ScannerDecoderProps {
  registry: CanonicalRuneRecord[];
  onSelectRecord?: (record: CanonicalRuneRecord) => void;
}

export const ScannerDecoder: React.FC<ScannerDecoderProps> = ({ registry, onSelectRecord }) => {
  const [inputMode, setInputMode] = useState<'text' | 'camera' | 'file'>('text');
  const [inputText, setInputText] = useState<string>('RC1:AI:AGT:0199a5b2-7c80-7000-8000-000000000003');
  const [resolvedData, setResolvedData] = useState<{
    logicalId: string;
    base32Id: string;
    payload: RuneBinaryPayload;
    namespace: string;
    resourceType: string;
    uuid: string;
    crcValid: boolean;
    hexString: string;
  } | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const performDecode = (input: string) => {
    setDecodeError(null);
    try {
      const res = resolveRuneCode(input);
      setResolvedData(res);
    } catch (err: unknown) {
      setDecodeError((err as Error).message);
      setResolvedData(null);
    }
  };

  useEffect(() => {
    if (inputText) {
      performDecode(inputText);
    }
  }, [inputText]);

  // Clean up camera on unmount or mode switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      setCameraError('Camera access denied or unavailable: ' + (err as Error).message);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleCaptureSampleFromCamera = () => {
    // Pick an existing record to simulate optical reading
    const sample = registry[Math.floor(Math.random() * registry.length)];
    if (sample) {
      setInputText(sample.runeId);
      stopCamera();
      setInputMode('text');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      // Extract RC1 ID if found in text or SVG
      const matchLogical = content.match(/RC1:[A-Z]{2}:[A-Z]{3}:[0-9a-f-]{36}/i);
      if (matchLogical) {
        setInputText(matchLogical[0]);
        setInputMode('text');
        return;
      }

      const matchBase32 = content.match(/RC1-[A-Z2-7]{40}/i);
      if (matchBase32) {
        setInputText(matchBase32[0]);
        setInputMode('text');
        return;
      }

      // If json
      try {
        const json = JSON.parse(content);
        if (json.runeId) {
          setInputText(json.runeId);
          setInputMode('text');
          return;
        }
      } catch {
        // Not JSON
      }

      setDecodeError('Could not find RuneCode pattern in uploaded file.');
    };
    reader.readAsText(file);
  };

  // Find record in local registry
  const matchedRecord = resolvedData
    ? registry.find((r) => r.runeId.toLowerCase() === resolvedData.logicalId.toLowerCase())
    : null;

  const uuidTimestampMs = resolvedData ? extractUUIDv7Timestamp(resolvedData.payload.uuidBytes) : null;
  const uuidDate = uuidTimestampMs ? new Date(uuidTimestampMs).toUTCString() : null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">RuneCode Decoder & Scanner</h2>
        <p className="mt-1 text-sm text-slate-400">
          Deconstruct 25-byte binary payloads, verify Castagnoli CRC-32C checksums, decode RFC 4648 Base32 strings,
          and resolve canonical identities across OneManOS, OneVault, MyAI, and BookChain.
        </p>
      </div>

      {/* Input Mode Selector */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => {
            stopCamera();
            setInputMode('text');
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            inputMode === 'text' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scan className="w-3.5 h-3.5" />
          Text & Identifier
        </button>

        <button
          onClick={() => {
            setInputMode('camera');
            startCamera();
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            inputMode === 'camera' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          Camera Scanner
        </button>

        <button
          onClick={() => {
            stopCamera();
            setInputMode('file');
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            inputMode === 'file' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Import File / SVG
        </button>
      </div>

      {/* Input Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {inputMode === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Paste Logical ID (`RC1:...`), Base32 (`RC1-...`), or 25-Byte Hex
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="RC1:OM:DEV:0199a5b2-7c80-7000-8000-000000000001"
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => performDecode(inputText)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
                >
                  Decode
                </button>
              </div>
            </div>

            {/* Quick Sample Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-slate-500">Quick Test Samples:</span>
              <button
                onClick={() => setInputText('RC1:OM:DEV:0199a5b2-7c80-7000-8000-000000000001')}
                className="text-xs px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 hover:border-cyan-500 transition-colors font-mono"
              >
                OneManOS Setbox
              </button>
              <button
                onClick={() => setInputText('RC1:OV:DOC:0199a5b2-7c80-7000-8000-000000000002')}
                className="text-xs px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 hover:border-cyan-500 transition-colors font-mono"
              >
                OneVault Document
              </button>
              <button
                onClick={() => setInputText('RC1:AI:AGT:0199a5b2-7c80-7000-8000-000000000003')}
                className="text-xs px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 hover:border-cyan-500 transition-colors font-mono"
              >
                MyAI Agent
              </button>
              <button
                onClick={() => setInputText('RC1:BC:TXN:0199a5b2-7c80-7000-8000-000000000004')}
                className="text-xs px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 hover:border-cyan-500 transition-colors font-mono"
              >
                BookChain TXN
              </button>
            </div>
          </div>
        )}

        {inputMode === 'camera' && (
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="relative w-full max-w-md aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {cameraActive ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  {/* Viewfinder Target */}
                  <div className="absolute inset-8 border-2 border-dashed border-cyan-400/70 rounded-lg pointer-events-none flex items-center justify-center">
                    <span className="text-[11px] font-mono text-cyan-300 bg-slate-950/70 px-2 py-0.5 rounded">
                      Align RuneFrame v1 inside boundary
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <CameraOff className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    {cameraError || 'Camera stream is stopped or permissions were not granted.'}
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-cyan-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-cyan-400"
                  >
                    Start Camera
                  </button>
                </div>
              )}
            </div>

            {cameraActive && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCaptureSampleFromCamera}
                  className="px-4 py-2 bg-cyan-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-cyan-400 transition-colors"
                >
                  Capture & Optical Scan
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-700"
                >
                  Close Camera
                </button>
              </div>
            )}
          </div>
        )}

        {inputMode === 'file' && (
          <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center space-y-3">
            <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Select or drop a RuneCode SVG or JSON record file
              </span>
              <span className="text-[11px] text-slate-400">
                Parses embedded metadata and extracts the 25-byte payload
              </span>
            </div>
            <label className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg cursor-pointer transition-colors">
              Browse File
              <input type="file" accept=".svg,.json,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        )}
      </div>

      {decodeError && (
        <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-xl flex items-center gap-3 text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{decodeError}</span>
        </div>
      )}

      {/* Decoded Results Display */}
      {resolvedData && (
        <div className="space-y-6">
          {/* Integrity Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              resolvedData.crcValid
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {resolvedData.crcValid ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold block">
                  {resolvedData.crcValid
                    ? 'CRC-32C Checksum Verified (Integrity Intact)'
                    : 'CRC-32C Integrity Mismatch (Payload May Be Corrupted)'}
                </span>
                <span className="text-[11px] opacity-80">
                  Calculated using Castagnoli polynomial 0x82F63B78 across bytes 0–20.
                </span>
              </div>
            </div>
            <div className="font-mono text-xs font-bold tabular-nums">
              0x{resolvedData.payload.crc32c.toString(16).padStart(8, '0').toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 cols: Binary Payload Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Binary Payload Deconstruction (25 Bytes)
                </h3>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Offset 0 (1 Byte)</span>
                      <span className="font-semibold text-slate-200">Specification Version</span>
                    </div>
                    <span className="font-mono text-cyan-400 font-bold">
                      0x{resolvedData.payload.version.toString(16).padStart(2, '0').toUpperCase()} (v1.0)
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Offset 1 (1 Byte)</span>
                      <span className="font-semibold text-slate-200">
                        Namespace: {NAMESPACE_REGISTRY[resolvedData.namespace as keyof typeof NAMESPACE_REGISTRY]?.name}
                      </span>
                    </div>
                    <span className="font-mono text-cyan-400 font-bold">
                      {resolvedData.namespace} (0x{resolvedData.payload.namespaceHex.toString(16).padStart(2, '0').toUpperCase()})
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Offset 2 (1 Byte)</span>
                      <span className="font-semibold text-slate-200">
                        Resource Type ({resolvedData.resourceType})
                      </span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">
                      0x{resolvedData.payload.typeHex.toString(16).padStart(2, '0').toUpperCase()}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Offset 3–18 (16 Bytes)</span>
                      <span className="font-mono text-sky-400 font-bold">RFC 9562 UUIDv7</span>
                    </div>
                    <div className="font-mono text-xs text-slate-200 select-all break-all">
                      {resolvedData.uuid}
                    </div>
                    {uuidDate && (
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 flex justify-between">
                        <span>Embedded Timestamp:</span>
                        <span className="font-mono text-slate-300">{uuidDate}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Offset 19–20 (2 Bytes)</span>
                      <span className="font-semibold text-slate-200">Flags (Reserved)</span>
                    </div>
                    <span className="font-mono text-amber-400 font-bold">
                      0x{resolvedData.payload.flags.toString(16).padStart(4, '0').toUpperCase()}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Offset 21–24 (4 Bytes)</span>
                      <span className="font-semibold text-slate-200">CRC-32C Castagnoli Checksum</span>
                    </div>
                    <span className="font-mono text-purple-400 font-bold">
                      0x{resolvedData.payload.crc32c.toString(16).padStart(8, '0').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Raw Hex Inspector */}
                <div className="pt-2">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">
                    Raw 25-Byte Hex Stream
                  </span>
                  <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-slate-300 tracking-wider break-all select-all border border-slate-800">
                    {resolvedData.hexString}
                  </div>
                </div>
              </div>

              {/* Matched Registry Record Card */}
              {matchedRecord && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Search className="w-4 h-4 text-emerald-400" />
                      Canonical Record Found in Federation Registry
                    </h3>
                    <span className="text-xs text-emerald-400 font-medium">Active</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Display Name:</span>
                      <span className="text-slate-200 font-medium">{matchedRecord.displayName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Tenant ID:</span>
                      <span className="font-mono text-slate-200">{matchedRecord.tenantId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Issuer DID:</span>
                      <span className="font-mono text-slate-200">{matchedRecord.issuer}</span>
                    </div>
                    {matchedRecord.ownerRef && (
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Owner Link:</span>
                        <span className="font-mono text-cyan-300">{matchedRecord.ownerRef}</span>
                      </div>
                    )}
                    {matchedRecord.contentHash && (
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Content Hash (SHA-256):</span>
                        <span className="font-mono text-slate-300 truncate max-w-[200px]">
                          {matchedRecord.contentHash}
                        </span>
                      </div>
                    )}
                  </div>

                  {onSelectRecord && (
                    <button
                      onClick={() => onSelectRecord(matchedRecord)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Open in Federation Registry Explorer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right 5 cols: RuneFrame v1 Visual Reconstitution */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center justify-between">
                  <span>RuneFrame v1 Visual Reconstitution</span>
                  <span className="text-xs font-mono text-cyan-400">Optical Matrix</span>
                </h3>

                <RuneFrameView
                  rawBytes={resolvedData.payload.rawBytes}
                  logicalId={resolvedData.logicalId}
                  base32Id={resolvedData.base32Id}
                  size="standard"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
