import { CanonicalRuneRecord } from './types';
import { logicalIdToBinary } from './codec';
import { ROOT_AUTHORITY_KEYPAIR, signRuneRecord } from './crypto';

export async function createInitialRegistry(): Promise<CanonicalRuneRecord[]> {
  const recordsSeed = [
    {
      runeId: 'RC1:OM:DEV:0199a5b2-7c80-7000-8000-000000000001',
      namespace: 'OM' as const,
      resourceType: 'DEV',
      displayName: 'OneManOS Edge Node Setbox-Alpha',
      tenantId: 'nextwaver-edge',
      issuer: 'did:web:nextwaver.net',
      ownerRef: 'did:key:admin-root-01',
      status: 'active' as const,
      createdAt: '2026-10-10T08:30:00Z',
      updatedAt: '2026-10-10T08:30:00Z',
      revision: 1,
      metadata: {
        architecture: 'ARM64-RK3588',
        macAddress: 'd8:3a:dd:5e:21:40',
        firmware: 'OneManOS-v2.4.1-lts',
        role: 'Local Cluster Master & Hardware Enclave',
        location: 'Zone 4 Data Closet',
      },
    },
    {
      runeId: 'RC1:OV:DOC:0199a5b2-7c80-7000-8000-000000000002',
      namespace: 'OV' as const,
      resourceType: 'DOC',
      displayName: 'OneVault Sovereign Charter & Governance Specification',
      tenantId: 'nextwaver-vault',
      issuer: 'did:web:nextwaver.net',
      ownerRef: 'RC1:OM:DEV:0199a5b2-7c80-7000-8000-000000000001',
      contentHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      status: 'active' as const,
      createdAt: '2026-10-10T09:15:00Z',
      updatedAt: '2026-10-10T09:15:00Z',
      revision: 2,
      metadata: {
        mimeType: 'application/pdf',
        classification: 'Confidential Sovereign Record',
        storageBackend: 'ZFS-Encrypted-Pool',
        checksumAlgorithm: 'SHA-256',
        pages: 34,
      },
    },
    {
      runeId: 'RC1:AI:AGT:0199a5b2-7c80-7000-8000-000000000003',
      namespace: 'AI' as const,
      resourceType: 'AGT',
      displayName: 'MyAI Sovereign Executive Agent - Nova',
      tenantId: 'nextwaver-ai',
      issuer: 'did:web:nextwaver.net',
      ownerRef: 'RC1:OM:DEV:0199a5b2-7c80-7000-8000-000000000001',
      status: 'active' as const,
      createdAt: '2026-10-10T12:00:00Z',
      updatedAt: '2026-10-10T12:00:00Z',
      revision: 1,
      metadata: {
        runtime: 'ollama-distributed',
        modelTarget: 'qwen2.5-coder-32b-q8',
        capabilities: [
          'document.search',
          'task.assist',
          'vault.attest',
          'mcp.federation',
        ],
        sandboxLevel: 'level-3-isolated',
      },
    },
    {
      runeId: 'RC1:BC:TXN:0199a5b2-7c80-7000-8000-000000000004',
      namespace: 'BC' as const,
      resourceType: 'TXN',
      displayName: 'BookChain Genesis Attestation Block #14088',
      tenantId: 'nextwaver-chain',
      issuer: 'did:web:nextwaver.net',
      ownerRef: 'RC1:AI:AGT:0199a5b2-7c80-7000-8000-000000000003',
      contentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'active' as const,
      createdAt: '2026-10-10T14:45:00Z',
      updatedAt: '2026-10-10T14:45:00Z',
      revision: 1,
      metadata: {
        blockHeight: 14088,
        witnessNodes: 7,
        attestedRune: 'RC1:OV:DOC:0199a5b2-7c80-7000-8000-000000000002',
        consensusEngine: 'BookChain Proof-of-Authority v1',
      },
    },
    {
      runeId: 'RC1:OM:NET:0199a5b2-7c80-7000-8000-000000000005',
      namespace: 'OM' as const,
      resourceType: 'NET',
      displayName: 'OneManOS Zero-Trust Fabric Mesh-01',
      tenantId: 'nextwaver-edge',
      issuer: 'did:web:nextwaver.net',
      ownerRef: 'RC1:OM:DEV:0199a5b2-7c80-7000-8000-000000000001',
      status: 'active' as const,
      createdAt: '2026-10-10T16:20:00Z',
      updatedAt: '2026-10-10T16:20:00Z',
      revision: 1,
      metadata: {
        topology: 'wireguard-full-mesh',
        cidr: '10.88.0.0/16',
        peersCount: 12,
        mtu: 1420,
      },
    },
    {
      runeId: 'RC1:AI:SKL:0199a5b2-7c80-7000-8000-000000000006',
      namespace: 'AI' as const,
      resourceType: 'SKL',
      displayName: 'MyAI Vault Semantic Search Skill',
      tenantId: 'nextwaver-ai',
      issuer: 'did:web:nextwaver.net',
      ownerRef: 'RC1:AI:AGT:0199a5b2-7c80-7000-8000-000000000003',
      status: 'active' as const,
      createdAt: '2026-10-10T17:00:00Z',
      updatedAt: '2026-10-10T17:00:00Z',
      revision: 1,
      metadata: {
        embeddingEngine: 'bge-m3-dense',
        vectorDimensions: 1024,
        protocol: 'model-context-protocol/v1',
      },
    },
  ];

  const fullRecords: CanonicalRuneRecord[] = [];

  for (const item of recordsSeed) {
    // Verify it passes binary serialization
    logicalIdToBinary(item.runeId);

    // Sign record with Root Authority Ed25519 key
    const trust = await signRuneRecord(
      {
        runeId: item.runeId,
        namespace: item.namespace,
        resourceType: item.resourceType,
        displayName: item.displayName,
        tenantId: item.tenantId,
        issuer: item.issuer,
        createdAt: item.createdAt,
        contentHash: item.contentHash,
        revision: item.revision,
      },
      ROOT_AUTHORITY_KEYPAIR.secretKey,
      'did:web:nextwaver.net#key-1'
    );

    fullRecords.push({
      schema: 'https://schemas.nextwaver.net/runecode/v1/record',
      ...item,
      trust,
    });
  }

  return fullRecords;
}
