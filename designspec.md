# RuneCode v1.0 — Architecture, Requirements & Reusable Design Specification Framework
**เอกสารข้อกำหนดความต้องการ สถาปัตยกรรมระบบ บทบาทผู้มีส่วนเกี่ยวข้อง และ UX/UI Design Spec ฉบับสมบูรณ์**  
*เวอร์ชันเอกสาร: 1.1.0 (Current Production Edition) · วันที่ปรับปรุงล่าสุด: 11 ตุลาคม 2026 · สถานะ: Active Production Standard*  
*สำหรับระบบนิเวศ Nextwaver: OneManOS · OneVault · MyAI · BookChain*

---

## 1. บทนำและวิสัยทัศน์โครงการ (Project Vision & Executive Summary)

### 1.1 ที่มาและเป้าหมาย (Rationale & Objectives)
ในระบบนิเวศแบบกระจายศูนย์ (Distributed Sovereign Ecosystem) ของ Nextwaver การแลกเปลี่ยนข้อมูลและการอ้างอิงระหว่าง 4 แพลตฟอร์มหลัก:
1. **OneManOS (OM)** — ระบบปฏิบัติการสำหรับ Edge Device, อุปกรณ์ Setbox, เกตเวย์อุตสาหกรรม และโครงข่าย P2P Mesh
2. **OneVault (OV)** — คลังจัดเก็บเอกสาร อัตลักษณ์ ทรัพย์สินดิจิทัล Model Weights Checkpoints และบันทึกตรวจสอบ (Audit Records)
3. **MyAI (AI)** — ระบบปัญญาประดิษฐ์อัตโนมัติ (Autonomous AI Agents), ทักษะการทำงาน (Skills) และ Session การอนุมาน
4. **BookChain (BC)** — เลเยอร์บล็อกเชนและ Consensus สำหรับการทำธุรกรรม (Transactions) และกระเป๋าเงินดิจิทัล (Wallets)

ประสบปัญหาความไม่สอดคล้องกันของตัวระบุตัวตน (Identifier Fragmentation):
- รหัส Barcode หรือ QR Code แบบดั้งเดิมไม่สามารถแยกแยะหมวดหมู่ได้ด้วยสายตา ไม่มีความสวยงาม และไม่มีการรับรองความถูกต้องของลายเซ็นดิจิทัลในตัว
- UUID หรือ Hash ธรรมดาไม่สามารถสแกนด้วยกล้องหรือแกะสลักลงบนแผ่นป้ายฮาร์ดแวร์จริงได้อย่างมีมาตรฐาน

**RuneCode v1.0** จึงถูกออกแบบขึ้นเพื่อเป็น **Universal Visual Identifier (มาตรฐานรหัสภาพสากลแบบเปิด)** โดยนำแนวคิดการประกอบเส้นเรขาคณิตจาก **Trunic** มาพัฒนาเป็นภาษาสัญลักษณ์ดิจิทัลที่มีโครงสร้างทางคณิตศาสตร์ 8 บิต ประกอบด้วยรหัสไบนารีสำหรับคอมพิวเตอร์ และสัญลักษณ์รูนเรขาคณิต (RuneGlyph) สำหรับมนุษย์และกล้องตรวจจับ

### 1.2 วัตถุประสงค์หลักเชิงกลยุทธ์ (Core Pillars)
- **Identity (รู้ว่าเป็นอะไร)**: ใช้มาตรฐาน RFC 9562 UUIDv7 ร่วมกับ Namespace และ Resource Type แบ่งแยกวัตถุอย่างชัดเจน
- **Recognition (อ่านและตรวจสอบได้)**: แปลงรหัสไบนารี 25 ไบต์เป็น RuneGlyph 8-bit และ RuneFrame 5×5 Matrix พร้อมอัลกอริทึม CRC-32C Castagnoli
- **Federation (เชื่อมข้ามระบบ)**: เชื่อมโยงข้ามระบบระหว่าง OneManOS, OneVault, MyAI, และ BookChain ผ่าน Canonical Record และ Topology Mesh Map
- **Trust (ตรวจสอบได้ทางคริปโตกราฟี)**: ยืนยันความถูกต้องด้วย Ed25519 Detached Digital Signature และ W3C DID (`did:web:nextwaver.net`)

---

## 2. ผู้มีส่วนเกี่ยวข้อง บทบาท และหน้าที่ (Stakeholders & RACI Matrix)

การพัฒนา การนำไปใช้งาน และการดูแลรักษา RuneCode เป็น Framework ที่ต้องอาศัยการประสานงานของหลายฝ่าย:

### 2.1 บทบาทของผู้มีส่วนเกี่ยวข้อง (Stakeholder Roles)
| บทบาท (Role) | ผู้รับผิดชอบหลัก / สังกัด | หน้าที่ความรับผิดชอบหลัก |
| :--- | :--- | :--- |
| **System Architect** | Nextwaver Core Architecture Team | กำหนดมาตรฐาน Binary Payload, RFC 4648 Base32, โพลีโนเมียล CRC-32C, และ JSON Schema v1 |
| **Cryptographic & Trust Lead** | Security & Identity Operations | บริหารจัดการ Root Keypair (`did:web:nextwaver.net`), นโยบายการเพิกถอนกุญแจ และการกำกับดูแล Ed25519 Signature |
| **OneManOS Lead** | Hardware & Edge OS Team | บูรณาการ RuneCode เข้ากับ Setbox Firmware, การสร้างแผ่นป้ายโลหะแกะสลักเลเซอร์ (Laser Stencil Plates), และ Driver การสแกน |
| **OneVault Lead** | Sovereign Storage Team | เชื่อมโยง `contentHash` (SHA-256) เข้ากับ Rune Record และบริหารจัดการ Revision ประวัติเอกสาร |
| **MyAI Integration Lead** | Autonomous Agent Team | สร้าง MCP (Model Context Protocol) Server และ Tool Adapter ให้ Agent สามารถ Mint และ Resolve รหัสได้อัตโนมัติ |
| **BookChain Lead** | Consensus & Smart Contract Team | ทำ Anchor บันทึก Rune Record ลงในบล็อกเชน และตรวจสอบสิทธิ์กระเป๋าเงิน (WAL) |
| **UX/UI & Frontend Engineer** | Product Experience Team | พัฒนา Studio, Glyph Lab, Scanner, Topology Mesh และ Explorer ตามคู่มือ Universal Frontend Design Constitution |
| **QA & Compliance Auditor** | Independent Verification Team | ตรวจสอบความถูกต้องของการถอดรหัสบิต, การคำนวณ CRC-32C, ความทนทานต่อมุมกล้อง และการทดสอบเจาะระบบตาม `TestSpec.md` |

### 2.2 ตารางความรับผิดชอบ RACI Matrix
*(R = Responsible ผู้ลงมือทำ, A = Accountable ผู้ตัดสินใจสูงสุด, C = Consulted ผู้ให้คำปรึกษา, I = Informed ผู้รับทราบ)*

| ขั้นตอนและกิจกรรม | Architect | Crypto Lead | Platform Leads (OM/OV/AI/BC) | Frontend / UX | QA Auditor |
| :--- | :---: | :---: | :---: | :---: | :---: |
| การกำหนดมาตรฐาน Binary & Visual Spec | **A / R** | C | C | C | I |
| การออกและดูแล Root Authority Keypair | C | **A / R** | I | I | C |
| การพัฒนา Core Codec Engine (TypeScript/C) | R | C | C | R | C |
| การเชื่อมต่อระบบทั้ง 4 แพลตฟอร์ม (Federation) | C | C | **A / R** | C | I |
| การพัฒนา Web Studio & Visual Workbench | I | I | C | **A / R** | C |
| การพัฒนา Scanner & Camera Viewfinder | C | I | C | **A / R** | C |
| การพัฒนา MCP Agent Console & Tools | R | C | C | **A / R** | C |
| การสร้าง Hardware Stencil & Plate Generator | C | I | **A / R** | R | C |
| การทดสอบความถูกต้องและการเข้ารหัส (Audit) | C | C | C | C | **A / R** |

---

## 3. สถาปัตยกรรมระบบ 4 ชั้น (Four-Layer System Architecture)

```
┌────────────────────────────────────────────────────────────────────────┐
│ 4. TRUST LAYER                                                         │
│    • Ed25519 Detached Digital Signature  • W3C DID (did:web)           │
│    • SHA-256 Content & Canonical Hashing • Policy Enforcement          │
├────────────────────────────────────────────────────────────────────────┤
│ 3. VISUAL LAYER                                                        │
│    • RuneGlyph v1 (8-bit Geometric Branching)                          │
│    • RuneFrame v1 (5x5 Matrix + 4 Corner Fiducials + Orientation Mark) │
│    • 1:1 Hardware Laser Stencil Plates (M3 Mountings, Layered SVG)     │
├────────────────────────────────────────────────────────────────────────┤
│ 2. ENCODING LAYER                                                      │
│    • 25-Byte Binary Core Payload (Big-Endian)                          │
│    • Castagnoli CRC-32C (0x82F63B78 Reflected)                         │
│    • RFC 4648 Unpadded Base32 String (RC1-<BASE32_PAYLOAD>)            │
├────────────────────────────────────────────────────────────────────────┤
│ 1. IDENTITY LAYER                                                      │
│    • RFC 9562 UUIDv7 (128-bit Time-Ordered Entropy)                    │
│    • Logical Identifier: RC1:<namespace>:<type>:<uuid>                 │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 ชั้นที่ 1: Identity Layer
- **รูปแบบรหัสข้อความ (Logical Identifier)**: บังคับรูปแบบ `RC1:<namespace>:<type>:<id>`
  - `RC1`: เวอร์ชันของข้อกำหนด (RuneCode Version 1)
  - `<namespace>`: ตัวย่อของระบบ 2 ตัวอักษรพิมพ์ใหญ่ (`OM`, `OV`, `AI`, `BC`)
  - `<type>`: ตัวย่อของประเภททรัพยากร 3 ตัวอักษรพิมพ์ใหญ่ (`DEV`, `DOC`, `AGT`, `TXN` ฯลฯ)
  - `<id>`: รหัส UUIDv7 ตัวพิมพ์เล็ก คั่นด้วยเครื่องหมายขีด (36 ตัวอักษร)
- **คุณสมบัติ UUIDv7 (RFC 9562)**:
  - บิต 0–47 (48 bits): Unix Epoch Timestamp หน่วยเป็นมิลลิวินาที (Big-Endian)
  - บิต 48–51 (4 bits): เวอร์ชัน 7 (`0b0111`)
  - บิต 52–63 (12 bits): ตัวเลขสุ่มส่วนที่ 1
  - บิต 64–65 (2 bits): Variant 2 (`0b10`)
  - บิต 66–127 (62 bits): ตัวเลขสุ่มส่วนที่ 2

### 3.2 ชั้นที่ 2: Encoding Layer
#### ตารางผังโครงสร้างไบนารี 25 ไบต์ (Binary Core Layout)
| Offset (Byte) | ขนาด (Bytes) | ชนิดข้อมูล | ชื่อฟิลด์ | รายละเอียดและความหมาย |
| :---: | :---: | :---: | :--- | :--- |
| **0** | 1 | `uint8` | `Version` | กำหนดค่าเป็น `0x01` (RuneCode Spec 1.0) |
| **1** | 1 | `uint8` | `Namespace` | รหัสระบบ: OM=`0x01`, OV=`0x02`, AI=`0x03`, BC=`0x04` |
| **2** | 1 | `uint8` | `ResourceType` | รหัสประเภททรัพยากรภายในเนมสเปซนั้นๆ |
| **3–18** | 16 | `byte[16]` | `UUIDv7Bytes` | ไบนารีแท้ 128 บิตของ UUIDv7 (ถอดจาก String 32 ตัวอักษร) |
| **19–20** | 2 | `uint16` | `Flags` | บิตแฟล็กนโยบายและความปลอดภัย (Big-Endian, สำรอง = `0x0000`) |
| **21–24** | 4 | `uint32` | `CRC32C` | เช็กซัม Castagnoli คำนวณจากไบต์ 0 ถึง 20 (Big-Endian) |

#### การคำนวณ CRC-32C (Castagnoli Polynomial)
- **Reflected Polynomial**: `0x82F63B78`
- **Initial Vector**: `0xFFFFFFFF`
- **Final XOR**: `0xFFFFFFFF`
- คำนวณครอบคลุมไบต์ออฟเซ็ต 0 ถึง 20 (รวม 21 ไบต์แรก) ผลลัพธ์บรรจุลงในออฟเซ็ต 21–24

#### การเข้ารหัสข้อความแบบ Base32 (RFC 4648)
- อักขระที่ใช้: `ABCDEFGHIJKLMNOPQRSTUVWXYZ234567` (32 ตัวอักษร)
- ข้อมูลไบนารี 25 ไบต์ (200 บิต) หารด้วย 5 บิตต่ออักขระ ได้เป็นอักขระ Base32 พอดี **40 ตัวอักษร** โดยไม่ต้องมี Padding (`=`)
- รูปแบบสตริง: `RC1-<BASE32_PAYLOAD_40_CHARS>`

---

## 4. ข้อกำหนดสัญลักษณ์เรขาคณิต (Visual Layer Spec)

### 4.1 กฎเรขาคณิต 8 บิตของ RuneGlyph (Trunic-Inspired Geometry)
หนึ่ง Glyph แสดงผลข้อมูล 1 ไบต์ (8 บิต) ในกรอบพิกัดเวกเตอร์ `100 × 140`:
- **แกนกลางอ้างอิง (Faint Reference Stem)**: เส้นตรงกึ่งกลางจากพิกัด `(50, 16)` ถึง `(50, 124)` พร้อมขีดบอกระดับกึ่งกลางที่ `(44, 70) – (56, 70)` มีสถานะเป็นเส้นอ้างอิงเท่านั้น ไม่นับเป็นบิตข้อมูล
- **เส้นแสดงบิตข้อมูล (Data Bit Segments 0–7)**:
  - **Bit 0 (LSB - 0x01)**: แขนเฉียงบนซ้าย เส้นทาง `M 50,46 L 18,22`
  - **Bit 1 (0x02)**: ปีกข้างแนวตั้งบนซ้าย เส้นทาง `M 18,22 L 18,52`
  - **Bit 2 (0x04)**: แขนเฉียงบนขวา เส้นทาง `M 50,46 L 82,22`
  - **Bit 3 (0x08)**: ปีกข้างแนวตั้งบนขวา เส้นทาง `M 82,22 L 82,52`
  - **Bit 4 (0x10)**: ขาเฉียงล่างซ้าย เส้นทาง `M 50,94 L 18,118`
  - **Bit 5 (0x20)**: ปีกข้างแนวตั้งล่างซ้าย เส้นทาง `M 18,118 L 18,88`
  - **Bit 6 (0x40)**: ขาเฉียงล่างขวา เส้นทาง `M 50,94 L 82,118`
  - **Bit 7 (MSB - 0x80)**: แถบเข็มขัดกึ่งกลางและเพชรแกนหลัก เส้นทาง `M 26,70 L 74,70 M 50,60 L 60,70 L 50,80 L 40,70 Z`

*ตัวอย่างการทดสอบตามโจทย์*: ไบต์ `0xA5` (`10100101` ในฐานสอง) จะเปิดใช้งานเฉพาะเส้นของ **Bit 0, Bit 2, Bit 5 และ Bit 7** เท่านั้น

### 4.2 ตารางเมทริกซ์ RuneFrame v1 (5×5 Matrix)
สำหรับชุดข้อมูล RuneCode ขนาด 25 ไบต์ จะเรนเดอร์ในรูปแบบเมทริกซ์ขนาด 5 แถว 5 คอลัมน์ (รวม 25 ช่องพอดี):
- **แถวที่ 0**: Offset 0 (`Version`), Offset 1 (`Namespace`), Offset 2 (`Type`), Offset 3 (`UUID[0]`), Offset 4 (`UUID[1]`)
- **แถวที่ 1**: Offset 5–9 (`UUID[2..6]`)
- **แถวที่ 2**: Offset 10–14 (`UUID[7..11]`)
- **แถวที่ 3**: Offset 15–18 (`UUID[12..15]`), Offset 19 (`Flags[0]`)
- **แถวที่ 4**: Offset 20 (`Flags[1]`), Offset 21–24 (`CRC-32C[0..3]`)
- **มาร์กเกอร์สอบเทียบ (Optical Calibration Markers)**:
  - วงเล็บเหลี่ยมรูปตัว L 4 มุม สำหรับหาพิกัดและแก้องศาภาพบิดเบี้ยว (Perspective Transform)
  - รอยบากบอกทิศทางคู่ (Double Notch) ด้านบนสุด สำหรับระบุด้านบนของภาพ

### 4.3 แผ่นเพลตโลหะและสเตนซิลเลเซอร์ (Hardware Stencil Plates)
- รองรับสเกลจริง 1:1 มิลลิเมตร พร้อมรูเจาะสกรู M3 (3.2 mm) 4 มุม สำหรับติดตั้งบนหน้าเคส Setbox ของ OneManOS หรือตู้ Rack:
  - ขนาดมาตรฐาน: 85×54 mm (Credit Card Size), 60×40 mm (Compact Tag), และ 100×35 mm (1U Rack)
  - แยกเลเยอร์การตัดเลเซอร์ (Red Cut Hairline `0.1mm`) และการแกะสลักผิว (Surface Engrave) ชัดเจนในไฟล์ SVG

---

## 5. รูปแบบข้อมูลมาตรฐาน (Canonical Data Model Specification)

ข้อมูลทุกรายการในระบบจะต้องจัดเก็บและแลกเปลี่ยนในโครงสร้าง Canonical JSON ที่มี 3 ส่วนแยกจากกัน:

```json
{
  "$schema": "https://schemas.nextwaver.net/runecode/v1/record",
  "runeId": "RC1:AI:AGT:0199a5b2-7c80-7000-8000-000000000003",
  "namespace": "AI",
  "resourceType": "AGT",
  "displayName": "Office Assistant",
  "tenantId": "nextwaver",
  "issuer": "did:web:nextwaver.net",
  "ownerRef": "RC1:OM:DEV:0199a5b2-7c80-7000-8000-000000000001",
  "contentHash": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
  "status": "active",
  "createdAt": "2026-10-10T12:00:00Z",
  "updatedAt": "2026-10-10T12:00:00Z",
  "revision": 1,
  "metadata": {
    "runtime": "ollama",
    "capabilities": [
      "document.search",
      "task.assist"
    ]
  },
  "trust": {
    "keyId": "did:web:nextwaver.net#key-1",
    "signature": "3b4f...d8e1",
    "publicKeyHex": "4a7c...9f20",
    "verified": true,
    "policyRef": "urn:nextwaver:policy:strict-ed25519:v1",
    "verifiedAt": "2026-10-10T12:00:05Z"
  }
}
```

### การจัดกลุ่มข้อมูล 3 กลุ่ม:
1. **Identity Record**: `runeId`, `namespace`, `resourceType`, `issuer`, `createdAt` — ห้ามแก้ไขตลอดอายุของวัตถุ
2. **Metadata Record**: `displayName`, `tenantId`, `ownerRef`, `status`, `revision`, `metadata`, `contentHash` — ปรับปรุงได้ตามเวอร์ชัน
3. **Trust Record**: `keyId`, `signature`, `publicKeyHex`, `policyRef` — จัดเก็บเฉพาะลายเซ็นดิจิทัลและ Public Key ห้ามเปิดเผย Private Key

---

## 6. ข้อกำหนด UX/UI Design Spec (Universal Frontend Design Constitution)

ระบบได้รับการออกแบบโดยยึดตามหลักการ **Universal Frontend Design Constitution** เพื่อป้องกันงานออกแบบแบบ AI Slop ทั่วไป และสร้างความน่าเชื่อถือระดับซอฟต์แวร์โครงสร้างพื้นฐานระดับชาติ:

### 6.1 กฎ Top Bar Contract (3-Zone Strict Layout)
แถบเมนูด้านบนต้องมีโครงสร้าง 3 โซนบนแถวเดียว คั่นด้วยระยะว่าง (`gap-8`):
- **Zone 1 (Brand Zone)**: คำแสดงแบรนด์คำเดียว บรรทัดเดียว `RC1 RuneCode v1.0` โดยไม่มีคำบรรยายย่อยหรือสถานะแปะติด
- **Zone 2 (Navigation Links)**: ลิงก์ข้อความสั้น 4–5 เมนู บรรทัดเดียว (`Studio`, `Glyph Lab`, `Scanner`, `Federation`, `Trust & DID`)
- **Zone 3 (Primary Action)**: กลุ่มปุ่มคำสั่งหลัก (`Help`, `Specification`)

### 6.2 กฎ Zero-Pill & Metadata Discipline
- **ห้ามใส่กรอบแคปซูลหรือ Pill Badge บนข้อความข้อมูลนิ่ง (Static Metadata)**: วันที่, สถานะ, เวอร์ชัน, แท็ก ต้องแสดงผลเป็นข้อความที่สะอาดตา คั่นด้วยเครื่องหมายตัวพิมพ์แบบคลาสสิก (`·`, `/`)
- **การใช้ Pill/Segmented Controls**: อนุญาตเฉพาะกับปุ่มที่คลิกแล้วเกิดฟังก์ชันตอบสนองทันที (Interactive Buttons / Filter Tabs) เช่น ปุ่มสลับเนมสเปซ ปุ่มสลับโหมดกล้อง

### 6.3 จานสี 60-30-10 และ Typography Math
- **60% Dominant Neutral**: พื้นหลังสีมืดลึก Slate Dark (`#020617` / `#0f172a`)
- **30% Structural Surfaces**: การ์ด แผงควบคุม เส้นขอบ Hairline Divider (`border-slate-800` / `#1e293b`)
- **10% Intentional Accent**: สีฟ้าครามและเขียวมรกต (`#06b6d4` Cyan สำหรับ RuneCode, `#10b981` Emerald สำหรับลายเซ็นผ่านการตรวจสอบ)
- **Typographic Pairings**:
  - หัวข้อและแบรนด์: `Plus Jakarta Sans`
  - ค่าตัวเลข, แอดเดรส, เช็กซัม, และโค้ดไบนารี: `JetBrains Mono` พร้อมเปิดใช้คุณสมบัติ `font-variant-numeric: tabular-nums` ป้องกันตัวเลขสั่นไหวระหว่างอัปเดต

---

## 7. กระบวนการดำเนินงานของวงจรชีวิตระบบ (End-to-End Workflow)

```
[ผู้ใช้ / AI Agent]
       │
       ▼
1. ระบุ Namespace & Type (OM, OV, AI, BC)
       │
       ▼
2. สุ่มเวลาและ Entropy สร้าง RFC 9562 UUIDv7
       │
       ▼
3. รวบรวมข้อมูลลงใน 25-Byte Binary Buffer (Offset 0–20)
       │
       ▼
4. คำนวณเช็กซัม Castagnoli CRC-32C บรรจุลง Offset 21–24
       │
       ▼
5. แปลง Binary Buffer เป็น Base32 String (RC1-<BASE32>)
       │
       ▼
6. วาดเวกเตอร์ RuneGlyph 8 บิต และจัดเรียง RuneFrame 5x5 Matrix
       │
       ▼
7. สร้าง Canonical JSON และทำการเซ็น Ed25519 Detached Signature
       │
       ▼
8. ลงทะเบียนเข้าสู่ Federation Registry พร้อมเผยแพร่ผ่าน MCP / REST API
       │
       ▼
9. ทางเลือกในการส่งออก: เวกเตอร์ SVG, ป้ายโลหะเลเซอร์ 1:1, หรือ Batch Export
```

---

## 8. อินเทอร์เฟซโปรโตคอล MCP และ REST API สำหรับ AI Agents

RuneCode ถูกออกแบบให้เป็นเครื่องมือกลางสำหรับ AI Agent (เช่น Gemini, Claude, Antigravity) ผ่านมาตรฐาน **Model Context Protocol (MCP)**:

### 8.1 ข้อมูลจำเพาะเครื่องมือ MCP (MCP Server Tool Schema)
```json
{
  "name": "runecode-service",
  "version": "1.0.0",
  "tools": [
    {
      "name": "runecode_resolve",
      "description": "ถอดรหัสและตรวจสอบความถูกต้องของ RuneCode Logical ID หรือ Base32 String",
      "inputSchema": {
        "type": "object",
        "properties": {
          "runeCode": { "type": "string", "description": "เช่น RC1:OM:DEV:... หรือ RC1-..." }
        },
        "required": ["runeCode"]
      }
    },
    {
      "name": "runecode_mint",
      "description": "สร้าง RuneCode ใหม่พร้อมคำนวณ CRC-32C และลงลายเซ็น Ed25519",
      "inputSchema": {
        "type": "object",
        "properties": {
          "namespace": { "type": "string", "enum": ["OM", "OV", "AI", "BC"] },
          "resourceType": { "type": "string" },
          "displayName": { "type": "string" },
          "tenantId": { "type": "string" },
          "ownerRef": { "type": "string" },
          "contentHash": { "type": "string" },
          "metadata": { "type": "object" }
        },
        "required": ["namespace", "resourceType", "displayName", "tenantId"]
      }
    },
    {
      "name": "runecode_verify_signature",
      "description": "ตรวจสอบลายเซ็นดิจิทัล Ed25519 ของ Canonical Rune Record",
      "inputSchema": {
        "type": "object",
        "properties": {
          "canonicalRecord": { "type": "object" },
          "publicKeyHex": { "type": "string" }
        },
        "required": ["canonicalRecord"]
      }
    }
  ]
}
```

---

## 9. แนวทางการนำไปพัฒนาซ้ำในโครงการถัดไป (Reusable Framework Blueprint)

สำหรับการนำสถาปัตยกรรมนี้ไปพัฒนาต่อในระบบย่อยหรือบริการใหม่:

### 9.1 โครงสร้างโค้ดส่วนกลาง (Core Architecture Packages)
คัดลอกโฟลเดอร์ `src/lib/runecode/` ประกอบด้วย 6 โมดูลหลักที่ไม่มีการผูกติดกับ UI:
1. `types.ts`: ประกาศ Type Definitions, Namespace Registry, และ Canonical Record
2. `crc32c.ts`: อัลกอริทึม Castagnoli CRC-32C Reflected Polynomial `0x82F63B78`
3. `base32.ts`: RFC 4648 Unpadded Base32 Encoder/Decoder (40 Chars)
4. `uuidv7.ts`: RFC 9562 128-bit UUIDv7 Generator & Parser (48-bit Unix ms Timestamp)
5. `codec.ts`: 25-Byte Binary Layout Codec และ Universal Identifier Resolver
6. `glyph.ts`: พิกัดเวกเตอร์เรขาคณิต 8 บิต Trunic Geometry และ RuneFrame 5×5 Matrix
7. `crypto.ts`: Ed25519 Keypair Generator, Detached Signing, และ Verification

### 9.2 การเชื่อมต่อฐานข้อมูลภายนอก (Database Adapters)
- **PostgreSQL / Cloud SQL**: สร้างตาราง `runecode_records` โดยเก็บ `rune_id` (Primary Key), `namespace`, `resource_type`, `canonical_json` (JSONB)
- **Object Storage / S3 / GCS**: บันทึกแต่ละ Record ในพาธ `runecode/{namespace}/{resourceType}/{uuid}.json` พร้อมจัดเก็บไฟล์ SVG เมทริกซ์ควบคู่กัน

---

## 10. สรุปผลและเช็กลิสต์การตรวจรับงาน (Verification & Sign-Off Checklist)

- [x] รองรับมาตรฐาน Logical ID ตามสูตร `RC1:<namespace>:<type>:<uuid>`
- [x] โครงสร้างไบนารี 25 ไบต์และคำนวณ Castagnoli CRC-32C ถูกต้อง 100%
- [x] การเข้ารหัส Base32 RFC 4648 ไม่ใส่ Padding ขนาด 40 ตัวอักษร
- [x] เรนเดอร์สัญลักษณ์เวกเตอร์ RuneGlyph 8 บิต ตามแนวคิด Trunic ถูกต้องทุกตำแหน่ง
- [x] แสดงผล RuneFrame v1 ขนาด 5×5 ช่องพร้อม Calibration Marks 4 มุม
- [x] แผนผังโครงข่ายอินเทอร์แอคทีฟ (Visual Federation Topology Mesh Map)
- [x] เครื่องมือสร้างป้ายโลหะแกะสลักเลเซอร์ สเกลจริง 1:1 มม. (Laser Stencil Plates)
- [x] คอนโซลจำลองการทำงานของ AI Agent (Model Context Protocol - MCP Agent Console)
- [x] ระบบออกรหัสพร้อมกันจำนวนมากสำหรับโรงงานและคลัง (Batch Minting Pipeline)
- [x] ระบบสแกนเนอร์รองรับการป้อนข้อความ, การเปิดกล้องอ่านภาพ, และการอัปโหลดไฟล์ SVG
- [x] ระบบลายเซ็นดิจิทัล Ed25519 Detached Signature และ W3C DID พร้อมทำงานสมบูรณ์
- [x] UX/UI สอดคล้องตาม Universal Frontend Design Constitution (Zero-pill, 60-30-10, Top Bar Contract)
