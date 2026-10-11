export type Namespace = 'OM' | 'OV' | 'AI' | 'BC';

export interface NamespaceConfig {
  code: Namespace;
  hex: number;
  name: string;
  system: string;
  description: string;
  types: Record<string, { code: number; label: string; description: string }>;
}

export const NAMESPACE_REGISTRY: Record<Namespace, NamespaceConfig> = {
  OM: {
    code: 'OM',
    hex: 0x01,
    name: 'OneManOS',
    system: 'Edge Operating System',
    description: 'Hardware appliances, setboxes, edge nodes, and local system services',
    types: {
      DEV: { code: 0x01, label: 'Device / Setbox', description: 'Physical edge hardware, IoT controller, or compute setbox' },
      NET: { code: 0x02, label: 'Mesh Network', description: 'Zero-trust network mesh or P2P communication channel' },
      SVC: { code: 0x03, label: 'System Service', description: 'Daemon, background worker, or local edge microservice' },
    },
  },
  OV: {
    code: 'OV',
    hex: 0x02,
    name: 'OneVault',
    system: 'Sovereign Knowledge Vault',
    description: 'Encrypted documents, digital assets, and audit logs',
    types: {
      DOC: { code: 0x01, label: 'Document', description: 'Structured text, sovereign whitepaper, or legal contract' },
      AST: { code: 0x02, label: 'Digital Asset', description: 'AI weights checkpoint, encrypted media, or archive container' },
      REC: { code: 0x03, label: 'Audit Record', description: 'Append-only ledger entry, compliance proof, or audit trace' },
    },
  },
  AI: {
    code: 'AI',
    hex: 0x03,
    name: 'MyAI',
    system: 'Autonomous Intelligence Engine',
    description: 'Autonomous AI agents, tool skills, and execution sessions',
    types: {
      AGT: { code: 0x01, label: 'AI Agent', description: 'Autonomous agent persona, executive assistant, or ops agent' },
      SKL: { code: 0x02, label: 'Agent Skill', description: 'Deterministic tool capability, API adapter, or search skill' },
      SES: { code: 0x03, label: 'Inference Session', description: 'Bounded execution context, reasoning thread, or session state' },
    },
  },
  BC: {
    code: 'BC',
    hex: 0x04,
    name: 'BookChain',
    system: 'Consensus & Ledger Layer',
    description: 'Consensus transactions and multi-sig sovereign wallets',
    types: {
      TXN: { code: 0x01, label: 'Transaction Block', description: 'Consensus verification anchor and state transition proof' },
      WAL: { code: 0x02, label: 'Sovereign Wallet', description: 'Multi-signature custody account and trust root' },
    },
  },
};

export interface RuneBinaryPayload {
  version: number;       // 1 byte (0x01)
  namespaceHex: number;  // 1 byte (0x01 .. 0x04)
  typeHex: number;       // 1 byte
  uuidBytes: Uint8Array; // 16 bytes (UUIDv7)
  flags: number;         // 2 bytes (big endian)
  crc32c: number;        // 4 bytes (big endian)
  rawBytes: Uint8Array;  // 25 bytes total
}

export interface RuneIdentityRecord {
  runeId: string;       // e.g. RC1:OM:DEV:0199a5b2-7c80-7000-8000-000000000001
  base32Id: string;     // e.g. RC1-AEARKYK77QYAAAAA...
  namespace: Namespace;
  resourceType: string;
  uuid: string;
  createdAt: string;
  issuer: string;       // e.g. did:web:nextwaver.net
}

export interface RuneMetadataRecord {
  displayName: string;
  tenantId: string;
  ownerRef?: string;
  contentHash?: string; // SHA-256
  status: 'active' | 'suspended' | 'revoked' | 'deprecated';
  revision: number;
  updatedAt: string;
  attributes: Record<string, unknown>;
}

export interface RuneTrustRecord {
  keyId: string;
  signature: string;        // Ed25519 signature in hex
  publicKeyHex: string;     // Ed25519 public key in hex
  verified: boolean;
  policyRef: string;
  verifiedAt?: string;
}

export interface CanonicalRuneRecord {
  schema: string;
  runeId: string;
  namespace: Namespace;
  resourceType: string;
  displayName: string;
  tenantId: string;
  issuer: string;
  ownerRef?: string;
  contentHash?: string;
  status: 'active' | 'suspended' | 'revoked' | 'deprecated';
  createdAt: string;
  updatedAt: string;
  revision: number;
  metadata: Record<string, unknown>;
  trust: RuneTrustRecord;
}
