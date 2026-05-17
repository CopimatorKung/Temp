# UAT Plan: Pitchsmith MVP

เอกสารนี้ใช้เป็น checklist สำหรับส่งมอบให้ product, backend, frontend และ tester ตรวจ flow หลักก่อน pilot

## 1. UAT Scope

| Area | Goal | Primary Roles |
|---|---|---|
| Login and current user | เข้า platform ได้ และระบบโหลด role/profile/badge ถูกต้อง | sales, manager, admin |
| Dashboard | manager เห็นภาพรวม readiness, quality, playbook gap และ onboarding จาก API เดียว | manager, admin |
| Quality Review | review ไฟล์เสียง/เอกสารด้วย guidance และเห็น evidence | sales, manager |
| Recording Review | อัดหรือ upload pitch practice แล้วประเมินด้วย training rubric | sales, manager |
| Ask Playbook + RAG | ถามจาก Knowledge/Playbook พร้อม citation และทดสอบ Kotaemon/LEANN sync | sales, admin |
| Voice Senario | คุยเสียงผ่าน WSS, Botnoi ASR/TTS และใช้ playbook context | sales |
| Onboarding | track, prerequisite, badge และ progress ทำงานครบ | sales, manager, admin |

## 2. UAT Scenarios

### UAT-001 Login and Navbar User

1. เปิด `/login`
2. login ด้วย email/password ที่ถูกต้อง
3. backend คืน `POST /auth/login` และ frontend เรียกหรือ hydrate `GET /auth/me`
4. เข้า `/app/dashboard`
5. sidebar แสดง avatar ring, ชื่อ, role, badge และ profile/logout menu

Expected result:

- current user มี `role`, `teamId`, `permissions`, `salesProfile`, `highestBadge`
- ถ้า token invalid หรือ expired ต้องกลับไป `/login`

### UAT-002 Dashboard Overview API

1. Manager เปิด `/app/dashboard`
2. frontend เรียก `GET /dashboard/overview?teamId&dateFrom&dateTo`
3. ตรวจ KPI cards, momentum, readiness heatmap, knowledge gaps, lost deal reasons และ onboarding progress

Expected result:

- dashboard ไม่คำนวณ aggregate จากหลาย endpoint ใน frontend
- manager เห็นเฉพาะทีมที่มีสิทธิ์, admin filter team ได้

### UAT-003 Quality Review Batch

1. สร้าง batch จากไฟล์เสียงหรือ document
2. เลือก guidance/scorecard template
3. run batch
4. เปิด result เพื่อดู score, evidence และ recommendation

Expected result:

- รองรับ audio และ `.md`, `.txt`, `.doc`, `.docx`
- item process แบบ async sequential
- evidence ชี้กลับ transcript timestamp หรือ document span

### UAT-004 Recording Review and Rubric Editor

1. สร้าง practice batch
2. upload หรือ record attempt
3. run scoring ด้วย training rubric
4. เปิด rubric editor และแก้ section/rule

Expected result:

- attempt มี ASR transcript, score, coaching feedback
- rubric editor เน้น Sections and Rules เป็นพื้นที่หลัก
- metadata เป็น compact context และ save draft ได้

### UAT-005 Knowledge Publish to Kotaemon/LEANN

1. Admin สร้าง Knowledge book/chapter/topic/page
2. publish page
3. backend queue `POST /knowledge/pages/:id/index-sync`
4. ตรวจ `GET /knowledge/pages/:id/index-status` หรือ `GET /playbook-indexes/status`
5. ใช้ `POST /playbook-search` provider `kotaemon_leann` หรือ `hybrid`

Expected result:

- SaleSync/Turso ยังเป็น source of truth
- Kotaemon รับ document metadata และใช้ LEANN เป็น local index backend
- search result มี `sourceType=knowledge_page`, `sourceId`, `externalDocumentId`, `externalChunkId`
- citation map กลับมาเปิดหน้า Knowledge เดิมได้

### UAT-006 Ask Playbook

1. เปิด `/app/training/ask`
2. เริ่ม session และถาม promotion/competitor/objection
3. ตรวจคำตอบและ citation

Expected result:

- session/citation rail collapse ได้เพื่อให้ chat เป็นพื้นที่หลัก
- ถ้าไม่มี source ที่ approved/effective ต้อง abstain
- expired promotion ไม่ถูกนำมาตอบ

### UAT-007 Voice Senario

1. เลือก persona หรือ meeting room
2. เริ่ม voice session
3. พูดกับ AI customer ผ่าน WSS
4. จบ session และดู score/feedback

Expected result:

- Botnoi ASR/TTS ทำงานตาม event flow
- playbook context ถูก preload เพื่อลด latency
- session summary บันทึกเป็น training result ได้

### UAT-008 Onboarding Track Prerequisite

1. Admin สร้าง `Chatbot Business`
2. กำหนด prerequisite เป็น `Chatbot Basic I` และ `Chatbot Basic II`
3. assign ให้ sales ที่ผ่าน Basic I แต่ยังไม่ผ่าน Basic II
4. sales เปิด track library/detail
5. sales complete Basic II แล้ว refresh

Expected result:

- `Chatbot Business` แสดง locked พร้อม prerequisite progress
- หลังผ่าน Basic II ระบบ unlock track และ audit `onboarding.track_unlocked`
- backend reject prerequisite cycle

## 3. UAT Exit Criteria

- ทุก scenario สำคัญผ่านบน role sales, manager และ admin
- API response ตรงกับ [mock-api-contracts.md](./mock-api-contracts.md)
- ER/API sequence diagrams ตรงกับ implementation หรือมี change note
- ไม่มี frontend overflow/blocking modal ใน viewport desktop หลัก
- Deno lint/build ผ่าน
- Backend unit/integration tests ครอบคลุม auth, dashboard, RAG sync, onboarding prerequisite และ core review flows
