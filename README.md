# Pitchsmith / SaleSync

AI Sales Training และ Sales Enablement platform สำหรับช่วยให้องค์กรปั้นทีมขายให้พร้อมคุยกับลูกค้าจริงเร็วขึ้น โดยรวมการตรวจคุณภาพ pitch, การฝึกกับ AI customer persona, Playbook ที่อ้างอิง source ได้ และ onboarding tracker ไว้ใน workflow เดียว

โปรเจกต์นี้เริ่มจาก MVP ที่เน้น mock frontend และเอกสารพัฒนาให้ทีม frontend/backend เข้าใจ boundary เดียวกัน ก่อนต่อ backend จริงด้วย Rust + Actix Web

## ปัญหาที่ต้องการแก้

องค์กรที่มีทีมขายมักเจอ pain ซ้ำ ๆ:

- Sales turnover สูง ทำให้ต้องสอนคนใหม่ซ้ำและความรู้กระจัดกระจาย
- Sales ใหม่ใช้เวลานานกว่าจะเข้าใจบริษัท ผลิตภัณฑ์ ลูกค้า คู่แข่ง และ objection
- Manager ไม่มีเวลาฟังทุกสายหรือทุก pitch ทำให้ coaching ช้าและไม่สม่ำเสมอ
- Sales แต่ละคนพูดไม่ตรงมาตรฐาน เช่น ลืมถาม pain point, pitch เกินจริง, ไม่แจ้งเงื่อนไขโปรโมชัน หรือพูด claim ที่เสี่ยง
- Playbook, promotion, pricing, battle card และ compliance policy เปลี่ยนบ่อย แต่ทีมขายไม่รู้ว่า source ล่าสุดคืออะไร

Pitchsmith จึงออกแบบมาให้ sales ได้ฝึกก่อนเจอลูกค้าจริง และให้ manager เห็น evidence เพื่อ coach ได้ตรงจุด

## Product Idea

Pitchsmith คือระบบที่ช่วยให้ทีมขาย:

1. อัปโหลดเสียงหรือเอกสารเพื่อประเมินตาม rubric ขององค์กร
2. ฝึกคุยกับ AI customer persona ผ่าน voice Senario หรือ meeting room
3. ถามตอบจาก Playbook ขององค์กรแบบมี citation
4. ติดตาม onboarding readiness, badge, training progress และ skill gap
5. ให้ manager/admin บริหาร user, role, rubric, Playbook, security และ sync setting ได้

แนวคิดสำคัญคือทำให้การ training ไม่ใช่การอ่านเอกสารเฉย ๆ แต่เป็นการฝึก, วัดผล, feedback และปรับ Playbook จาก evidence จริง

## MVP Modules

### 1. Quality Review Engine

ตรวจไฟล์เสียง เอกสาร บทความ หรือ sales script ด้วย rubric ที่สร้างเฉพาะ use case เช่น:

- Sales call standard
- SEO Organizer
- Promotion/compliance guardrail
- Prohibited answer detection
- Overclaim หรือคำตอบที่เสี่ยงฟ้องร้อง

Flow หลัก:

- สร้าง review batch
- เลือก guidance/rubric
- อัปโหลดหลายไฟล์
- process แบบ async เป็นราย item
- ดู transcript/document evidence, scorecard, risk flag และ recommendation
- export report เป็น PDF, Markdown หรือ CSV สำหรับส่งต่อให้ manager หรือทีม Playbook

### 2. Recording Review Training

ให้ sales ฝึก pitch หรือ mock call แล้วประเมินด้วย training rubric:

- อัดเสียงใน browser
- อัปโหลดไฟล์เสียงย้อนหลัง
- เก็บหลาย attempt ใน batch เดียว เพื่อเทียบครั้งที่ 1, 2, 3
- เปิด ASR review modal เพื่อฟัง segment และแก้ transcript mock
- ส่งผลไปใช้กับ onboarding readiness ได้

### 3. Voice Senario และ AI Customer Persona

จำลองลูกค้าเพื่อให้ sales ฝึกสนทนาแบบ interactive:

- Persona เช่น ไม่เข้าใจเทค, ชอบพูดนอกเรื่อง, บอกว่างบเยอะแต่จริง ๆ งบน้อย, ใช้คู่แข่งอยู่
- Meeting Room รวม persona หลายคน เช่น manager, procurement, technical stakeholder
- ใช้ Botnoi ASR/TTS และ WSS ใน design ของ backend
- preload persona, scenario และ Playbook Section เพื่อลด latency ระหว่างคุยสด

### 4. Playbook Library และ Ask Playbook

Playbook ใช้โครงสร้างเหมือนหนังสือ:

```text
Book -> Chapter -> Topic -> Page
```

เป้าหมายคือให้ทีมเขียน source แบบอ่านง่าย และระบบสามารถอ้างอิงกลับไปยัง page เดิมได้เมื่อใช้ใน Ask, Senario หรือ scoring

MVP ใช้ source-first approach:

- เขียน Q&A, talk track, do/dont say, promotion, competitor, pricing และ compliance ไว้ก่อน
- ใช้ Turso FTS/BM25 สำหรับ search เพื่อลด latency และ cost
- รองรับ optional local RAG ผ่าน Kotaemon + LEANN ในแผน backend
- ถ้าไม่มี source ต้อง abstain แทนการเดาคำตอบ

### 5. Onboarding Tracker

ติดตาม readiness ของ sales โดยใช้ track, topic, prerequisite และ badge:

- Track สามารถขึ้นต่อกันได้ เช่น Chatbot Business ต้องผ่าน Chatbot Basic I และ II ก่อน
- Topic ใน track อาจอ้างอิง Playbook, Scenario, course, external view หรือ audio response
- Manager ใช้ดู progress และ sign-off readiness

### 6. Dashboard และ Admin Settings

Dashboard เน้นภาพสำหรับ manager/investor view:

- Team readiness
- Quality score
- Playbook gaps
- Revenue risk mock
- Simulation hours
- Onboarding progress

Settings mock ครอบคลุม:

- User & role management
- Security
- Knowledge sync
- Notifications
- Theme

## Tech Stack

### Frontend

- React 19
- Vite
- Deno task workflow
- React Router
- Tailwind CSS
- Zustand
- Zod
- Radash
- React Icons
- React Portal สำหรับ modal/drawer/overlay
- Tiptap สำหรับ Playbook Markdown editor

### Backend Plan

- Rust
- Actix Web
- Turso database
- WSS protocol สำหรับ voice Senario
- Botnoi ASR/TTS
- Turso FTS/BM25 สำหรับ Playbook search
- Optional Kotaemon + LEANN สำหรับ local/private RAG

Backend architecture จะยึด DDD + Clean Architecture และห้ามใช้ `unwrap()`, `expect()` หรือ `panic!()` ใน production code

## Current Status

ตอนนี้ repo มี:

- Mock frontend หลาย module พร้อม route ใน `/app`
- Login page mock
- Dashboard mock
- Quality Review batch/detail/report/ASR review mock
- Recording Review training mock
- Scenario persona และ meeting room mock
- Playbook library, book detail และ editor mock
- Onboarding track mock
- Admin settings mock
- Dev docs สำหรับ PRD, API contracts, ER diagram, sequence diagram, UAT และ architecture

Backend ยังเป็นแผนและ scaffold documentation เป็นหลัก

## Run Locally

ใช้ script ที่ root project:

```bash
./scripts/start-local.sh
```

เปิด:

```text
http://127.0.0.1:5173
```

หยุด local server:

```bash
./scripts/stop-local.sh
```

Frontend ใช้ mock API โดย script จะ set:

```text
VITE_USE_MOCK_API=true
```

## Useful Docs

- [Product Requirements](docs/dev/product-requirements.md)
- [Project Overview](docs/dev/pitchsmith-project-overview.md)
- [Technical Architecture](docs/dev/technical-architecture.md)
- [Mock API Contracts](docs/dev/mock-api-contracts.md)
- [Frontend Component Structure](docs/dev/frontend-component-structure.md)
- [ER Diagram](docs/dev/data-model-er-diagram.md)
- [API Sequence Diagrams](docs/dev/api-sequence-diagrams.md)
- [UAT Plan](docs/dev/uat-plan.md)
- [GitHub Workflow](docs/dev/github-workflow.md)

## Development Notes

- Frontend ควรแยก component ตาม module เพื่อลดไฟล์ใหญ่เกินไป
- Backend API contract ต้องชัดก่อนต่อจริง เพื่อลดการแก้กลับไปกลับมาระหว่าง frontend/backend
- Mock UI ใช้เพื่อ validate user journey, layout, route, state และ API boundary ก่อนลงทุน backend เต็ม
- Playbook ต้องเป็น source ที่มี owner, status, version, effective date และ expiry date เมื่อเป็นข้อมูลที่เปลี่ยนตามเวลา เช่น promotion

## Repository Shape

```text
backend/     Rust + Actix Web backend plan/scaffold
frontend/    React mock frontend
docs/dev/    Development docs, PRD, architecture, API, testing, UAT
scripts/     Local start/stop scripts
```

