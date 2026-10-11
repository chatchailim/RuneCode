import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  BookOpen,
  GitBranch,
  Layers,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Compass,
  Cpu,
  Sparkles,
  Award,
  Zap,
  FileText,
  Globe
} from 'lucide-react';
import { RuneGlyphView } from './RuneGlyphView';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: 'minter' | 'lab' | 'scanner' | 'federation' | 'trust') => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onNavigateToTab }) => {
  const [activeTab, setActiveTab] = useState<'beginner' | 'diagrams' | 'steps' | 'glossary' | 'usecases'>('beginner');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const mermaidArch = `graph TD
    subgraph Layer4 ["4. Trust Layer (ชั้นความปลอดภัย)"]
        DID["W3C DID Identity (did:web:nextwaver.net)"]
        ED25519["Ed25519 Detached Digital Signature"]
        SHA256["SHA-256 Canonical & Content Hashing"]
    end
    subgraph Layer3 ["3. Visual Layer (ชั้นสัญลักษณ์เรขาคณิต)"]
        RuneGlyph["RuneGlyph (8-bit Geometric Branching)"]
        RuneFrame["RuneFrame v1 (5x5 Matrix + Corner Marks)"]
    end
    subgraph Layer2 ["2. Encoding Layer (ชั้นการเข้ารหัสข้อมูล)"]
        Binary["25-Byte Binary Core Payload"]
        CRC["CRC-32C Castagnoli Checksum (0x82F63B78)"]
        Base32["RFC 4648 Unpadded Base32 String (RC1-...)"]
    end
    subgraph Layer1 ["1. Identity Layer (ชั้นตัวตนสากล)"]
        UUIDv7["RFC 9562 UUIDv7 (128-bit Time-Ordered)"]
        LogicalID["Logical Identifier (RC1:Namespace:Type:UUID)"]
    end
    Layer1 --> Layer2 --> Layer3 --> Layer4`;

  const mermaidLifecycle = `sequenceDiagram
    autonumber
    actor User as ผู้ใช้งาน / AI Agent
    participant Studio as Minter Studio
    participant Codec as Core Codec Engine
    participant Crypto as Ed25519 Trust Engine
    participant Registry as Federation Registry

    User->>Studio: 1. เลือก Namespace, Type, และระบุชื่อ
    Studio->>Codec: 2. สร้าง UUIDv7 สดใหม่ (ฝังเวลา Milliseconds)
    Codec->>Codec: 3. จัดเรียงข้อมูลลงบัฟเฟอร์ไบนารี 25 ไบต์
    Codec->>Codec: 4. คำนวณ Castagnoli CRC-32C จาก 21 ไบต์แรก
    Codec->>Codec: 5. แปลงเป็น Base32 String (RC1-...)
    Codec->>Studio: 6. ส่งกลับ Logical ID, Binary, และ Base32
    Studio->>Crypto: 7. ส่ง Canonical Payload ให้เซ็นลายเซ็นดิจิทัล
    Crypto->>Crypto: 8. สร้าง Ed25519 Detached Signature
    Crypto->>Studio: 9. ส่งคืน Trust Record
    Studio->>Registry: 10. บันทึกลง Federation Registry
    Registry-->>User: 11. แสดงผล RuneFrame v1 และพร้อม Export SVG / JSON`;

  const mermaidFederation = `graph LR
    subgraph OM ["OneManOS (OM)"]
        DEV["DEV: Setbox Edge Device<br/>RC1:OM:DEV:0199...0001"]
        NET["NET: Mesh Fabric WireGuard"]
    end
    subgraph OV ["OneVault (OV)"]
        DOC["DOC: Sovereign Charter<br/>RC1:OV:DOC:0199...0002"]
        AST["AST: AI Weights Checkpoint"]
    end
    subgraph AI ["MyAI (AI)"]
        AGT["AGT: Executive Agent Nova<br/>RC1:AI:AGT:0199...0003"]
        SKL["SKL: Semantic Search Skill"]
    end
    subgraph BC ["BookChain (BC)"]
        TXN["TXN: Consensus Block Attestation<br/>RC1:BC:TXN:0199...0004"]
        WAL["WAL: Sovereign Multi-Sig Wallet"]
    end
    AGT -.->|"ควบคุมและติดตั้งบน"| DEV
    AGT -.->|"ตรวจสอบและรับรอง"| DOC
    TXN -.->|"บันทึกลงบล็อกเชน (Attest)"| DOC`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-400 font-bold text-xs">USER MANUAL & GUIDE</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">RuneCode Specification v1.0</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-cyan-400" />
              คู่มือการใช้งานระบบและการเรียนรู้สถาปัตยกรรม RuneCode
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              คำแนะนำอย่างละเอียดสำหรับผู้เริ่มต้น แผนภาพกระบวนการทำงานรูปแบบ Mermaid และคำอธิบายเชิงลึก
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
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('beginner')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'beginner'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            1. เริ่มต้นเข้าใจระบบ (Beginner Concept)
          </button>
          <button
            onClick={() => setActiveTab('diagrams')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'diagrams'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            2. แผนภาพการทำงาน (Mermaid Diagrams)
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'steps'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            3. ขั้นตอนการใช้งานทีละหน้าจอ
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'glossary'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            4. พจนานุกรมคำศัพท์เทคนิค (Glossary)
          </button>
          <button
            onClick={() => setActiveTab('usecases')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'usecases'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            5. ประโยชน์ & กรณีศึกษา (Benefits & Use Cases)
          </button>
        </div>

        {/* Tab 1: Beginner Concept */}
        {activeTab === 'beginner' && (
          <div className="space-y-6 text-slate-300 text-xs leading-relaxed">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                RuneCode คืออะไร ทำไมระบบถึงต้องใช้ภาษารูนเรขาคณิต?
              </h3>
              <p>
                ในระบบคอมพิวเตอร์ทั่วไป เมื่อเราต้องการระบุตัวตนของสิ่งของ เรามักจะใช้ **Barcode** หรือ **QR Code**
                แต่มีข้อจำกัดสำคัญคือ:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li><strong className="text-slate-200">มนุษย์อ่านไม่ออก:</strong> ลายจุดหรือแถบเส้นขาวดำไม่มีความหมายต่อสายตามนุษย์ เราไม่สามารถรู้ได้เลยว่าเป็นอุปกรณ์ เอกสาร หรือ AI Agent</li>
                <li><strong className="text-slate-200">ขาดการพิสูจน์สิทธิ์ในตัว:</strong> QR Code บรรจุเพียงแค่ลิงก์ URL หรือข้อความธรรมดา แต่ไม่มีลายเซ็นดิจิทัลที่ยืนยันความถูกต้องในระดับโครงสร้าง</li>
              </ul>
              <p>
                **RuneCode** นำแนวคิดมาจากภาษาเรขาคณิตโบราณ **Trunic** มาผสมกับ **คณิตศาสตร์บิตดิจิทัล 8 บิต**:
                โดยกำหนดให้แต่ละกิ่งก้านรอบแกนกลางแทนค่าบิต 0 ถึง 7 เมื่อประกอบกัน 25 ตัวอักษรจะกลายเป็น **RuneFrame (เมทริกซ์ 5×5)**
                ที่ทั้งมนุษย์จดจำได้ กล้องอ่านง่าย และคอมพิวเตอร์ประมวลผลได้แม่นยำ 100%
              </p>
            </div>

            {/* Visual Example: Spec 0xA5 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 bg-slate-950/40 border border-slate-800 rounded-xl items-center">
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-lg">
                <RuneGlyphView byte={0xa5} size={90} strokeWidth={3.8} />
                <span className="font-mono text-cyan-300 font-bold text-xs mt-2">ตัวอย่างไบต์: 0xA5</span>
                <span className="text-[11px] text-slate-500 font-mono">Bits: 0, 2, 5, 7 Active</span>
              </div>
              <div className="md:col-span-8 space-y-2">
                <h4 className="font-semibold text-slate-200 text-sm">หลักการเรขาคณิตของ 1 RuneGlyph (1 ไบต์)</h4>
                <p className="text-slate-400">
                  - <strong className="text-cyan-400">เส้นแกนกลางแนวตั้งสีจาง:</strong> เป็นเพียงเส้นอ้างอิงตำแหน่ง (ไม่มีค่าข้อมูล) เพื่อให้สายตามนุษย์และกล้องหาศูนย์กลางได้ง่าย<br />
                  - <strong className="text-cyan-400">เส้นกิ่งก้าน 8 เส้น:</strong> แต่ละเส้นแทนค่าบิตข้อมูล 0 ถึง 7 พอดี<br />
                  - ถ้าบิตเป็น 1 = วาดเส้นนั้น | ถ้าบิตเป็น 0 = เว้นว่างไว้<br />
                  - สำหรับค่า <code className="font-mono text-slate-200">0xA5</code> (ฐานสอง <code className="font-mono text-slate-200">10100101</code>) จะเปิดใช้งานเฉพาะ Bit 0 (เฉียงบนซ้าย), Bit 2 (เฉียงบนขวา), Bit 5 (ปีกข้างล่างซ้าย), และ Bit 7 (เข็มขัดกึ่งกลาง)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { title: 'OneManOS (OM)', desc: 'อุปกรณ์ Edge, กล่อง Setbox, และโครงข่ายฮาร์ดแวร์', code: 'DEV, NET, SVC' },
                { title: 'OneVault (OV)', desc: 'เอกสารความลับ, โมเดล AI, และบันทึกประวัติการตรวจสอบ', code: 'DOC, AST, REC' },
                { title: 'MyAI (AI)', desc: 'หุ่นยนต์เอเจนต์, ทักษะเครื่องมือ, และเซสชันการคิด', code: 'AGT, SKL, SES' },
                { title: 'BookChain (BC)', desc: 'บล็อกฉันทามติ, ธุรกรรม, และกระเป๋าเงินดิจิทัล', code: 'TXN, WAL' },
              ].map((sys, idx) => (
                <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <div className="font-bold text-cyan-400 font-mono text-xs mb-1">{sys.title}</div>
                  <div className="text-[11px] text-slate-400 mb-1.5">{sys.desc}</div>
                  <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded w-fit">{sys.code}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Mermaid Diagrams */}
        {activeTab === 'diagrams' && (
          <div className="space-y-6 text-xs text-slate-300">
            {/* Diagram 1 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">1. แผนภาพสถาปัตยกรรมระบบ 4 ชั้น (4-Layer System Architecture)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">แสดงความสัมพันธ์จากระดับ Identity ลงไปยัง Encoding, Visual, และ Trust Layer</p>
                </div>
                <button
                  onClick={() => handleCopy(mermaidArch, 'arch')}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  {copiedId === 'arch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Mermaid
                </button>
              </div>
              <pre className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800">
                {mermaidArch}
              </pre>
            </div>

            {/* Diagram 2 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">2. แผนภาพวงจรการออกและตรวจสอบรหัส (Minting & Verification Flow)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">ขั้นตอนตั้งแต่ผู้ใช้กรอกข้อมูล จนกระทั่งคำนวณ CRC-32C, ลงลายเซ็น Ed25519 และบันทึกลงทะเบียน</p>
                </div>
                <button
                  onClick={() => handleCopy(mermaidLifecycle, 'lifecycle')}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  {copiedId === 'lifecycle' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Mermaid
                </button>
              </div>
              <pre className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800">
                {mermaidLifecycle}
              </pre>
            </div>

            {/* Diagram 3 */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">3. แผนภาพการเชื่อมโยงข้าม 4 ระบบ (Cross-System Federation Links)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">การอ้างอิงระหว่าง OneManOS, OneVault, MyAI, และ BookChain ผ่าน Owner Reference</p>
                </div>
                <button
                  onClick={() => handleCopy(mermaidFederation, 'fed')}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  {copiedId === 'fed' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Mermaid
                </button>
              </div>
              <pre className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800">
                {mermaidFederation}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Step-by-Step Feature Guide */}
        {activeTab === 'steps' && (
          <div className="space-y-4 text-xs text-slate-300">
            {[
              {
                step: '1. การออกรหัสใหม่ (Minter Studio)',
                tabKey: 'minter' as const,
                desc: 'เลือก Namespace และ Type > กด "Generate Fresh" เพื่อสุ่ม UUIDv7 > กรอกชื่อและ Metadata > กด "Mint & Attest RuneCode v1.0" เพื่อเซ็นลายเซ็นดิจิทัลและบันทึกลงทะเบียน',
              },
              {
                step: '2. ห้องทดลองเรขาคณิต (Glyph Lab)',
                tabKey: 'lab' as const,
                desc: 'คลิกบนตัวรูนหรือกดสวิตช์ Bit 0–7 เพื่อดูการเปลี่ยนค่า Hex, Binary, และ Decimal แบบเรียลไทม์ หรือพิมพ์ข้อความในช่อง Inscription เพื่อดูรูนเรียงต่อกัน',
              },
              {
                step: '3. การสแกนและถอดรหัส (Scanner & Decoder)',
                tabKey: 'scanner' as const,
                desc: 'วางรหัสตัวหนังสือ หรือเปิดกล้องเล็งไปที่ RuneFrame 5×5 หรือลากไฟล์ SVG เข้ามา ระบบจะตรวจสอบค่า CRC-32C Castagnoli และดึงข้อมูล Canonical Record มาแสดง',
              },
              {
                step: '4. การสืบค้นทะเบียนกลาง (Federation Explorer)',
                tabKey: 'federation' as const,
                desc: 'ค้นหาและกรองรายการตามระบบ (OM, OV, AI, BC) > คลิกที่แถวเพื่อเปิดดูข้อมูลอย่างละเอียด พร้อมนำทางตามลิงก์ Owner Link ข้ามระบบได้ทันที',
              },
              {
                step: '5. ศูนย์กลางความปลอดภัยและกุญแจ (Trust & DID)',
                tabKey: 'trust' as const,
                desc: 'ตรวจสอบกุญแจสาธารณะของผู้ออกใบรับรอง did:web:nextwaver.net สร้างคู่กุญแจใหม่สำหรับเครื่องลูกข่าย และทดสอบยืนยันความถูกต้องของลายเซ็นดิจิทัล',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-slate-100 text-sm block">{item.step}</span>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
                {onNavigateToTab && (
                  <button
                    onClick={() => {
                      onNavigateToTab(item.tabKey);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium rounded-lg shrink-0 flex items-center gap-1 transition-colors"
                  >
                    <span>ไปที่หน้านี้</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Technical Glossary */}
        {activeTab === 'glossary' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  term: 'RuneGlyph',
                  desc: 'สัญลักษณ์เรขาคณิต 1 ตัว แทนข้อมูลขนาด 1 ไบต์ (8 บิต) วาดขึ้นจาก 8 เส้นกิ่งก้านรอบแกนกลางอ้างอิง',
                },
                {
                  term: 'RuneFrame',
                  desc: 'เมทริกซ์ 5×5 ช่อง (25 ไบต์) ล้อมด้วยกรอบจัดตำแหน่ง 4 มุม และรอยบากบอกทิศทางด้านบน สำหรับการสแกนด้วยกล้อง',
                },
                {
                  term: 'UUIDv7 (RFC 9562)',
                  desc: 'รหัสเอกลักษณ์สากลขนาด 128 บิต โดย 48 บิตแรกถูกฝังด้วยเวลาในหน่วยมิลลิวินาที ทำให้เรียงลำดับตามเวลาได้อัตโนมัติ',
                },
                {
                  term: 'CRC-32C Castagnoli',
                  desc: 'อัลกอริทึมเช็กซัมความเร็วสูง โพลีโนเมียล 0x82F63B78 เพื่อตรวจจับข้อผิดพลาดหรือการเปลี่ยนแปลงของข้อมูลใน 21 ไบต์แรก',
                },
                {
                  term: 'RFC 4648 Base32',
                  desc: 'การแปลงข้อมูลไบนารี 25 ไบต์เป็นตัวอักษร A-Z และเลข 2-7 ขนาดพอดี 40 ตัวอักษร โดยไม่มี Padding (=) เช่น RC1-ABC...',
                },
                {
                  term: 'Ed25519 Signature',
                  desc: 'ลายเซ็นดิจิทัลเข้ารหัสความเร็วสูงระดับสากล สำหรับการยืนยันตัวตนว่าข้อมูลออกโดยผู้ถือครองกุญแจลับอย่างแท้จริง',
                },
                {
                  term: 'W3C DID (did:web)',
                  desc: 'Decentralized Identifier เช่น did:web:nextwaver.net ชี้ไปยังโดเมนผู้ออกใบรับรองโดยไม่ต้องผ่านเซิร์ฟเวอร์รวมศูนย์',
                },
                {
                  term: 'Canonical Record',
                  desc: 'โครงสร้างข้อมูล JSON มาตรฐาน แยก 3 ส่วนอิสระ: Identity Record, Metadata Record, และ Trust Record',
                },
              ].map((g, idx) => (
                <div key={idx} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
                  <div className="font-mono font-bold text-cyan-400">{g.term}</div>
                  <div className="text-slate-400 leading-relaxed">{g.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Benefits & Concrete Use Cases */}
        {activeTab === 'usecases' && (
          <div className="space-y-6 text-slate-300 text-xs leading-relaxed">
            {/* Header intro */}
            <div className="p-4 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  ประโยชน์เชิงกลยุทธ์และกรณีศึกษาการใช้งานจริง (Strategic Benefits & Use Cases)
                </h3>
              </div>
              <p className="text-slate-300 leading-relaxed">
                RuneCode v1.0 เชื่อมต่อช่องว่างระหว่าง <strong className="text-cyan-300">สายตามนุษย์</strong>, <strong className="text-cyan-300">รหัสเครื่องจักร 25 ไบต์</strong> และ <strong className="text-cyan-300">ความน่าเชื่อถือทางคริปโตกราฟี</strong> เพื่อสร้างมาตรฐานระบุตัวตนสากลที่พร้อมใช้งานทั้งบนฮาร์ดแวร์จริงและโลก AI อัตโนมัติ
              </p>
            </div>

            {/* 7 Core Benefits Grid */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                7 ประโยชน์หลักของระบบ RuneCode
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-xs">
                    <CheckCircle2 className="w-4 h-4" /> 1. Dual-Readability
                  </div>
                  <p className="text-slate-400">มนุษย์มองออกทันทีว่าคืออุปกรณ์ เอกสาร หรือ AI ส่วนกล้องถอดรหัสบิตไบนารีได้ 100%</p>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-xs">
                    <Zap className="w-4 h-4" /> 2. 25-Byte Ultra Compact
                  </div>
                  <p className="text-slate-400">ขนาดคงที่ 25 ไบต์ ส่งผ่าน LoRaWAN, BLE Advertising, หรือ RFID ได้ในแพ็กเก็ตเดียว</p>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-xs">
                    <Compass className="w-4 h-4" /> 3. Time-Ordered Entropy
                  </div>
                  <p className="text-slate-400">ฝังเวลาใน UUIDv7 ฐานข้อมูลเรียงตามเวลาได้ทันที ลด Fragmentation ใน B-Tree/LSM Tree</p>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-xs">
                    <ShieldCheck className="w-4 h-4" /> 4. Cryptographic Trust
                  </div>
                  <p className="text-slate-400">มี Ed25519 Detached Digital Signature + W3C DID ป้องกันการปลอมแปลงและปฏิเสธความรับผิดชอบ</p>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-xs">
                    <Layers className="w-4 h-4" /> 5. Hardware Laser Stencil
                  </div>
                  <p className="text-slate-400">รูปทรงเรขาคณิตต่อเนื่องไม่มีชิ้นลอย สลักลงแผ่นป้ายโลหะสแตนเลสหรือ PCB ทนแดดทนสารเคมีนับสิบปี</p>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-xs">
                    <Cpu className="w-4 h-4" /> 6. Native Agentic MCP
                  </div>
                  <p className="text-slate-400">AI Agents เรียกใช้ Model Context Protocol (MCP) สั่ง Mint และตรวจยืนยันสิทธิ์ได้ในตัว</p>
                </div>
              </div>
            </div>

            {/* 6 Real-World Concrete Use Cases */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                กรณีศึกษาการใช้งานจริง (Concrete Practical Use Cases)
              </h4>

              {/* Use Case 1 */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-slate-200 text-sm">
                    กรณีที่ 1: ติดตั้งและระบุตัวตน Edge Gateway ในโรงงานอุตสาหกรรม
                  </span>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] bg-sky-950/60 text-sky-400 border border-sky-800 rounded font-mono">OneManOS (OM:DEV)</span>
                    <span className="px-2 py-0.5 text-[10px] bg-purple-950/60 text-purple-400 border border-purple-800 rounded font-mono">OneVault (OV:DOC)</span>
                  </div>
                </div>
                <p className="text-slate-400">
                  <strong>สถานการณ์:</strong> กล่องคอนโทรลเลอร์ติดตั้งบนเสากลางแจ้ง สติกเกอร์กระดาษ QR Code เดิมเปื่อยและหลุดร่อน ช่างไม่ทราบว่าเป็นเครื่องใด
                  <br />
                  <strong>ผลลัพธ์ด้วย RuneCode:</strong> แผ่นสแตนเลสสลักเลเซอร์ RuneFrame 5x5 ทนแดดทนฝน ช่างมองด้วยตารู้ว่าเป็นเครื่อง OM:DEV ใช้แท็บเล็ตสแกนถอดรหัส 25 ไบต์ เช็ก CRC-32C และลายเซ็น Ed25519 ดึงไฟล์ Firmware Config ประจำเครื่องมาติดตั้งได้ใน 1 วินาที ป้องกันอุปกรณ์สวมรอย (Rogue Device) ได้สมบูรณ์
                </p>
              </div>

              {/* Use Case 2 */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-slate-200 text-sm">
                    กรณีที่ 2: การมอบอำนาจและการตรวจสอบย้อนหลังการทำงานของ AI Agent
                  </span>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800 rounded font-mono">MyAI (AI:AGT)</span>
                    <span className="px-2 py-0.5 text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800 rounded font-mono">BookChain (BC:TXN)</span>
                  </div>
                </div>
                <p className="text-slate-400">
                  <strong>สถานการณ์:</strong> ปัญญาประดิษฐ์สั่งปรับเปลี่ยนภาระโหลดของเครื่องจักร หรืออนุมัติวงเงินงบประมาณ องค์กรต้องการหลักฐานทางกฎหมายว่าใครเป็นผู้สั่ง
                  <br />
                  <strong>ผลลัพธ์ด้วย RuneCode:</strong> AI Agent แต่ละตัวมีรหัสสากล (เช่น RC1:AI:AGT:0199... Nova) พร้อมกุญแจลับ Ed25519 เมื่อตัดสินใจ จะสร้างเอกสาร Audit Record ใน OneVault และเซ็นกำกับด้วยลายเซ็นดิจิทัล พร้อม Anchor ลงบน BookChain ฝ่ายตรวจสอบสามารถยืนยันเวลาจาก UUIDv7 และพิสูจน์ได้ว่าเอกสารไม่เคยถูกแก้ไข
                </p>
              </div>

              {/* Use Case 3 */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-slate-200 text-sm">
                    กรณีที่ 3: คุ้มครองลิขสิทธิ์และสิทธิ์อนุญาตชุดน้ำหนักโมเดล AI (Weights Checkpoints)
                  </span>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] bg-purple-950/60 text-purple-400 border border-purple-800 rounded font-mono">OneVault (OV:AST)</span>
                    <span className="px-2 py-0.5 text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800 rounded font-mono">BookChain (BC:WAL)</span>
                  </div>
                </div>
                <p className="text-slate-400">
                  <strong>สถานการณ์:</strong> โมเดล AI ขนาด 50GB มีมูลค่าสูง มักเสี่ยงต่อการถูกขโมยหรือนำไปใช้งานเชิงพาณิชย์โดยไม่ได้รับอนุญาต
                  <br />
                  <strong>ผลลัพธ์ด้วย RuneCode:</strong> แฮช SHA-256 ของไฟล์ Weights ถูกบรรจุเป็น RuneCode (OV:AST) ผูกสัญญาบนบล็อกเชน BookChain เชื่อมกระเป๋าเงินผู้สร้าง เมื่อระบบ MyAI โหลดโมเดล จะตรวจเช็กลายเซ็นดิจิทัลและสิทธิ์ Token หากถูกแอบแก้ไฟล์หรือไม่มีสิทธิ์ ระบบจะปฏิเสธการประมวลผลทันที
                </p>
              </div>

              {/* Use Case 4 */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-slate-200 text-sm">
                    กรณีที่ 4: การสื่อสาร P2P ไร้เน็ตระหว่างหุ่นยนต์ AGV ในคลังสินค้าใต้ดิน
                  </span>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] bg-sky-950/60 text-sky-400 border border-sky-800 rounded font-mono">OneManOS (OM:DEV)</span>
                    <span className="px-2 py-0.5 text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800 rounded font-mono">MyAI (AI:AGT)</span>
                  </div>
                </div>
                <p className="text-slate-400">
                  <strong>สถานการณ์:</strong> ในโกดังสินค้าใต้ดินไม่มีสัญญาณอินเทอร์เน็ต หุ่นยนต์ส่งของต้องเปิดประตูนิรภัยและเข้าแท่นชาร์จ
                  <br />
                  <strong>ผลลัพธ์ด้วย RuneCode:</strong> กล้องหุ่นยนต์สแกน RuneFrame บนเสาประตู ถอดรหัส 25 ไบต์ แล้วส่งแพ็กเก็ตบลูทูธ (BLE) ประตูตัวรับ OneManOS ตรวจสอบ Ed25519 Signature ผ่านแคชในเครื่อง (Local Zero-Trust Handshake) และเปิดประตูให้อัตโนมัติใน 0.05 วินาที โดยไม่ต้องมีสัญญาณอินเทอร์เน็ตแม้แต่วินาทีเดียว
                </p>
              </div>

              {/* Use Case 5 */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-slate-200 text-sm">
                    กรณีที่ 5: สัญญา ตราสารสิทธิ์ และเอกสารสำคัญป้องกันการปลอมแปลง
                  </span>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] bg-purple-950/60 text-purple-400 border border-purple-800 rounded font-mono">OneVault (OV:DOC)</span>
                    <span className="px-2 py-0.5 text-[10px] bg-cyan-950/60 text-cyan-400 border border-cyan-800 rounded font-mono">Trust (did:web)</span>
                  </div>
                </div>
                <p className="text-slate-400">
                  <strong>สถานการณ์:</strong> เอกสารสัญญา โฉนดดิจิทัล หรือใบรับรองคุณวุฒิที่ส่งเป็น PDF หรือพิมพ์ลงกระดาษ มักถูกแอบแก้ไขเนื้อหา
                  <br />
                  <strong>ผลลัพธ์ด้วย RuneCode:</strong> ประทับสัญลักษณ์ RuneFrame ลงบนเอกสาร ผู้ตรวจเพียงยกมือถือสแกน ระบบจะยืนยันเวลาที่อนุมัติ ความถูกต้องของลายเซ็น และเปรียบเทียบแฮชเนื้อหาไฟล์ หากมีการแก้ไขแม้แต่ตัวอักษรเดียว รหัสจะไม่ผ่านการตรวจสอบทันที
                </p>
              </div>
            </div>

            {/* Quick action jump */}
            <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-slate-300">
                ต้องการเริ่มสร้างหรือทดลองสแกนรหัส RuneCode ในระบบจริงหรือไม่?
              </span>
              <div className="flex gap-2">
                {onNavigateToTab && (
                  <>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToTab('minter');
                      }}
                      className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> ไปที่ Minter
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToTab('scanner');
                      }}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors flex items-center gap-1"
                    >
                      <Compass className="w-3.5 h-3.5" /> ไปที่ Scanner
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>อ่านคู่มือฉบับเต็มอย่างละเอียดได้ในไฟล์ <code className="text-slate-400 font-mono">README.md</code> ในระบบ</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
