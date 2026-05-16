# SaleSync Development Phases

เอกสารนี้ใช้เป็นแผนพัฒนาแบบ phase เพื่อกันปัญหา frontend/backend ทำงานซ้อนกันแล้วพบว่า API หรือ state ที่ต้องใช้ยังไม่มี โดยทุก phase ต้องมี mock contract, seed data และ UI state ก่อนเริ่ม implementation จริง

## Phase 0: Product Alignment และ Contract First

ระยะเวลาแนะนำ: 1-2 สัปดาห์

เป้าหมาย:

- ยืนยัน pain, user journey, role และ MVP boundary
- กำหนด scorecard/rubric v1 สำหรับการตรวจมาตรฐานการขาย
- กำหนด Playbook/Playbook Section taxonomy, tags, lifecycle และ promotion validity
- สรุป API contract, mock response และ error state ก่อน frontend/backend เริ่มงาน
- ตั้ง frontend/backend repository structure, scripts และ local dev workflow

Deliverables:

- PRD v1
- user stories และ user journeys
- ER diagram
- API sequence diagrams
- mock API contracts ราย module
- frontend component structure
- backend architecture standard ตาม Rust + Actix Web + DDD/Clean Architecture
- local scripts สำหรับ start/stop

Exit criteria:

- frontend ทำ mock UI ตาม contract ได้โดยไม่รอ backend
- backend รู้ aggregate/usecase/API boundary ชัดเจน
- product, design, frontend และ backend ใช้คำศัพท์เดียวกัน เช่น Playbook, Playbook Section, Scorecard Template, Audio Submission

## Phase 1: Mock Frontend และ Design Validation

ระยะเวลาแนะนำ: 1-2 สัปดาห์

เป้าหมาย:

- ทำ frontend mock ของ module Batch Quality Review ให้เห็น workflow จริง
- ทดสอบ UX กับ sales/manager โดยยังไม่ต้องมี backend จริง
- ตรวจว่าข้อมูลที่ UI ต้องใช้มีอยู่ใน mock API contract ครบหรือไม่

Scope:

- หน้า Quality Review แบบ batch-first
- สร้าง review batch จาก audio/document/article หลาย item โดย document MVP รองรับ `.md`, `.txt`, `.doc`, `.docx`
- เลือก scorecard/guidance template ตาม topic, segment, product, region และ language
- run batch แบบ async sequential ทีละ item
- batch list แสดง summary เท่านั้น และต้องกดเข้า batch detail เพื่อดู progress/result รายไฟล์
- แสดงสถานะ batch: draft, queued, processing, completed, failed, partial_failed
- แสดงสถานะ item: queued, processing, transcribed, scored, failed
- แสดง transcript/document evidence, scorecard, risk และ manager override ใน batch detail
- ใช้ theme จาก `ui_color_theme.json`

Deliverables:

- React mock frontend
- mock API layer ใน frontend
- Zustand store หรือ mock state สำหรับ batch review flow
- demo data สำหรับ batch queued, processing, completed, partial_failed, low score, high score, failed ASR และ needs review

Exit criteria:

- sales/manager เห็น flow ตั้งแต่ create batch, run batch, open batch detail ถึง feedback รายไฟล์ได้
- manager เห็น evidence และ override flow ได้
- frontend list ช่องว่างของ contract ที่ backend ต้องรองรับได้ครบ

## Phase 2: Backend Foundation และ Quality Review Batch API

ระยะเวลาแนะนำ: 2-3 สัปดาห์

เป้าหมาย:

- สร้าง backend Rust + Actix Web ตาม architecture standard
- ทำ API จริงให้แทน mock ของ Batch Quality Review ได้
- วาง Turso schema และ migration ชุดแรก

Scope:

- Auth/RBAC skeleton: sales, manager, admin
- QualityReviewBatch และ QualityReviewBatchItem aggregate
- AudioSubmission aggregate สำหรับ audio item ที่ต้อง ASR
- ScorecardTemplate aggregate
- batch create/list/detail/run API
- item upload/document attach API พร้อม validation สำหรับ `.md`, `.txt`, `.doc`, `.docx`
- file storage adapter
- processing job state
- audit log สำหรับ manager override
- API response shape และ error shape ให้ตรง mock contract

Deliverables:

- Actix Web app structure
- Turso migration
- REST API สำหรับ scorecard templates, quality review batches, batch items และ audio submissions ที่เกี่ยวข้อง
- seed scorecard templates
- integration tests สำหรับ API สำคัญ

Exit criteria:

- frontend เปลี่ยนจาก mock batch API เป็น real API ได้โดยไม่เปลี่ยน component หลัก
- backend validate template match ตาม topic/segment/product/language ได้
- override score มี audit trail

## Phase 3: Botnoi ASR และ Scoring MVP

ระยะเวลาแนะนำ: 2-4 สัปดาห์

เป้าหมาย:

- เชื่อม Botnoi ASR สำหรับไฟล์เสียง upload
- สร้าง transcript และ scorecard result จาก scoring rule v1
- ทำ evidence mapping ให้ manager ตรวจได้

Scope:

- Botnoi ASR adapter
- transcript normalization
- speaker label ถ้า provider รองรับ หรือ fallback เป็น unknown/customer/sales
- rule engine v1: required phrase, negative phrase, conditional rule, semantic check แบบจำกัด scope
- evidence extraction จาก transcript
- retry และ failed state

Deliverables:

- ASR processing pipeline
- transcript table/model
- scorecard result table/model
- scoring job worker หรือ async orchestration แบบง่าย
- manager review flow เชื่อม real data

Exit criteria:

- upload ไฟล์จริงแล้วได้ transcript และ score
- score แต่ละข้อมี evidence หรือ reason
- failed ASR retry ได้
- manager override แล้ว score/history เปลี่ยนอย่างตรวจสอบย้อนหลังได้

## Phase 4: Playbook MVP และ Guided Q&A

ระยะเวลาแนะนำ: 2-3 สัปดาห์

เป้าหมาย:

- สร้าง Playbook เป็น source ที่ควบคุมได้ โดยเริ่มจาก Turso FTS/BM25 และเตรียม provider boundary สำหรับ local RAG
- ใช้ Turso FTS/BM25 สำหรับค้น Playbook Section ที่ published และยังไม่หมดอายุใน phase แรก
- รองรับ optional local RAG provider ด้วย Kotaemon + LEANN หลัง Ask contract และ evaluation set พร้อม
- ให้ sales ถามตอบแบบ source-first พร้อม citation

Scope:

- Playbook และ Playbook Section CRUD
- section types: FAQ, Product, Pricing, Promotion, Competitor, Objection, Compliance, Talk Track
- tags และ lifecycle
- effective_date/expiry_date สำหรับ promotion/pricing
- search API
- guided answer API
- PlaybookSearchPort interface ที่สลับ BM25, Kotaemon/LEANN หรือ hybrid ได้
- optional RAG index sync contract สำหรับ approved Playbook Sections
- Ask chat session API: create/list/detail/message/feedback
- abstain เมื่อไม่มี approved source

Deliverables:

- Playbook admin UI mock หรือ basic real UI
- Turso FTS/BM25 index
- provider adapter stub สำหรับ Kotaemon/LEANN local RAG
- API สำหรับ search/answer
- session-based Ask UI พร้อม session list, chat thread, citations และลิงก์เข้า Knowledge Management
- evaluation set ชุดแรก

Exit criteria:

- คำถามจาก sales มี citation ทุกครั้งที่เป็น factual answer
- promotion หมดอายุไม่ถูกใช้ใน production answer
- ถ้า source ไม่พอ ระบบไม่เดาคำตอบ

## Phase 5: Training และ Voice Senario

ระยะเวลาแนะนำ: 3-5 สัปดาห์

เป้าหมาย:

- ทำ training mode ทั้ง recording review และ voice Senario
- ใช้ persona/scenario ที่ preload ไว้เพื่อลด latency ระหว่างคุยเสียง

Scope:

- Recording Review แบบ batch รองรับทั้ง `browser_recording` และ `audio_upload`
- Recording Review attempts สำหรับเปรียบเทียบครั้งที่ 1, 2, 3 ใน batch เดียวกัน
- Training rubric management โดย reuse scorecard/template structure แต่แยก `type=training_rubric`
- Persona และ Scenario library
- WSS protocol ผ่าน Actix Web
- audio chunk streaming จาก browser ไป backend
- Botnoi ASR สำหรับเสียงสด
- Botnoi TTS สำหรับเสียงตอบกลับ
- session transcript และ post-session score

Deliverables เพิ่มเติมสำหรับ Recording Review:

- `POST /recording-review-batches`
- `PATCH /recording-review-batches/:id`
- `POST /recording-review-batches/:id/attempts`
- `POST /recording-review-batches/:id/run`
- `GET /recording-review-attempts/:id/transcript`
- batch detail UI ที่แสดง attempt table, score trend, coaching focus, rename batch และ add attempt actions
- attempt review modal ที่แสดง audio playback และ ASR transcript แบบ SRT/timeline
- training rubric list + validation tests

Deliverables:

- WSS session protocol
- VoiceSession aggregate
- Senario UI
- persona/scenario management
- latency/error observability

Exit criteria:

- sales คุยกับ AI ด้วยเสียงได้อย่างน้อย 1 scenario end-to-end
- persona แสดงพฤติกรรมที่กำหนด เช่น non-tech, off-topic, fake budget
- session summary สร้าง coaching recommendation ได้

## Phase 6: Onboarding Tracker และ Manager Dashboard

ระยะเวลาแนะนำ: 2-4 สัปดาห์

เป้าหมาย:

- รวม signal จาก quality review, training และ playbook learning เข้าสู่ readiness tracking
- ให้ manager เห็นว่าคนไหนพร้อมขาย คนไหนต้อง coach ต่อ

Scope:

- Onboarding path
- modules และ checklist
- quiz/task placeholder หรือ integration ในอนาคต
- progress per sales
- manager sign-off
- coaching task
- dashboard ทีม

Deliverables:

- Onboarding UI
- Progress API
- Manager dashboard
- readiness state machine

Exit criteria:

- sales เห็น task และ progress ของตัวเอง
- manager เห็น progress รายทีม
- quality review/training result อัปเดต onboarding progress ได้

## Phase 7: Pilot, Calibration และ Rollout

ระยะเวลาแนะนำ: 2-4 สัปดาห์

เป้าหมาย:

- ทดลองกับทีมขายจริงขนาดเล็ก
- ปรับ scoring, Playbook, persona และ UX จากข้อมูลจริง
- ตัดสิน rollout scope ต่อไป

Scope:

- pilot กับ 1-2 ทีมขาย
- human label สำหรับ call quality calibration
- review false positive/false negative
- monitor ASR/TTS latency และ failure
- เก็บ feedback จาก sales/manager/admin
- privacy และ retention review

Exit criteria:

- manager เชื่อ scorecard มากพอใช้ coach จริง
- sales ใช้ training ซ้ำ ไม่ใช่ลองครั้งเดียว
- เห็น trend ลดเวลา onboarding หรือเพิ่ม readiness ก่อนรับ lead จริง

## Dependency Map

| Dependency | ต้องพร้อมก่อน phase |
|---|---|
| Scorecard Template v1 | Phase 1 |
| Mock API Contract | Phase 1 |
| Turso schema | Phase 2 |
| Botnoi credentials/quota | Phase 3 และ Phase 5 |
| Playbook Section seed data | Phase 4 |
| Persona/Scenario seed data | Phase 5 |
| Pilot users และ consent/notice | Phase 7 |

## Parallel Work Strategy

| Track | ทำคู่ขนานได้ | ห้ามรอกันด้วยเรื่องอะไร |
|---|---|---|
| Frontend | mock UI, state, UX validation | ไม่ต้องรอ backend ถ้ามี mock contract |
| Backend | API, domain model, storage, jobs | ไม่ต้องรอ UI final ถ้า contract stable |
| Product/Training | scorecard, playbook, persona, evaluation set | ไม่ต้องรอระบบเสร็จเพื่อเตรียม content |
| QA | test case, fixtures, golden data | ไม่ต้องรอ backend จริงถ้ามี mock payload |

## Change Control

- ทุกครั้งที่ API response เปลี่ยน ต้องแก้ `mock-api-contracts.md` ก่อน
- ทุก field ที่เพิ่มใน frontend ต้องบอกว่า backend source มาจาก entity ไหน
- scorecard/rubric เปลี่ยนได้ แต่ต้องมี `version` และไม่แก้ผลเก่าย้อนหลัง
- promotion/pricing ใน Playbook ต้องมี effective/expiry date เสมอ
- feature ที่แตะ audio, transcript, score หรือ role ต้องมี audit/log plan
