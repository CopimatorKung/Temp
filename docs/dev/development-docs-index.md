# Development Documentation Index

เอกสารชุดนี้ใช้เป็นฐานก่อนเริ่มพัฒนา Pitchsmith MVP เพื่อให้ product, design, frontend, backend และ testing เห็นภาพเดียวกัน

## เอกสารหลัก

| ไฟล์ | ใช้ทำอะไร | เจ้าของหลัก |
|---|---|---|
| [pitchsmith-project-overview.md](./pitchsmith-project-overview.md) | project positioning, product pillars และ MVP focus ของ Pitchsmith | Product Owner |
| [project-plan.md](./project-plan.md) | แผนโครงการ, feature scope, roadmap และ POC | Product Owner |
| [product-requirements.md](./product-requirements.md) | PRD สำหรับ MVP, roles, functional requirements และ acceptance criteria | Product Owner |
| [development-phases.md](./development-phases.md) | แผนพัฒนาเป็น phase, dependency, exit criteria และ parallel work strategy | Product Owner + Tech Lead |
| [github-workflow.md](./github-workflow.md) | branch strategy, issue/PR workflow, labels, CI และ release process สำหรับทำงานหลายทีม | Tech Lead |
| [technical-architecture.md](./technical-architecture.md) | สถาปัตยกรรม Rust/Actix Web, Turso, Botnoi ASR/TTS, WSS และ data flow | Tech Lead |
| [backend-architecture-standard.md](./backend-architecture-standard.md) | backend architecture standard ตาม pattern ของ quests-tracker ที่ปรับใช้กับ Actix Web | Backend Lead |
| [data-model-er-diagram.md](./data-model-er-diagram.md) | ER diagram และคำอธิบาย entity relationship | Tech Lead |
| [api-sequence-diagrams.md](./api-sequence-diagrams.md) | sequence diagram ของ REST API และ WSS flow | Backend Lead |
| [mock-api-contracts.md](./mock-api-contracts.md) | API contracts และ mock payloads เพื่อให้ frontend ทำงานแยกจาก backend ได้ | Frontend Lead + Backend Lead |
| [frontend-component-structure.md](./frontend-component-structure.md) | frontend folder structure, component standard, shadcn/ui usage และ state management | Frontend Lead |
| [ui_color_theme.json](./ui_color_theme.json) | source of truth สำหรับ Morphous Lily of the Valley visual theme | Design Lead |
| [user-stories.md](./user-stories.md) | user stories แยกตาม epic พร้อม acceptance criteria | Product Owner + Test Lead |
| [user-journeys.md](./user-journeys.md) | user journey ของ sales, manager, admin และ training flow | Product + Design |
| [testing-guidelines.md](./testing-guidelines.md) | test strategy ที่ดัดแปลงจากตัวอย่าง go-testing-guidelines ให้เข้ากับ Rust/Actix/React | Test Lead |
| [uat-plan.md](./uat-plan.md) | UAT scenario checklist สำหรับ login, dashboard, review, RAG, voice Senario และ onboarding prerequisite | Product Owner + Test Lead |

## Development Scope ของ MVP

MVP จะยังไม่เชื่อมตู้โทรศัพท์, PBX, CTI หรือ CCaaS โดยตรง แต่จะเริ่มจาก 2 input หลัก:

1. **Batch Quality Review**: sales หรือ manager สร้าง batch จากไฟล์เสียง เอกสาร หรือบทความ เลือก guidance แล้วให้ระบบ process item แบบ async ทีละรายการ
2. **Voice Senario**: sales คุยโต้ตอบกับ AI ผ่าน browser โดยใช้ WSS, Botnoi ASR และ Botnoi TTS

## Technology Decision

| Layer | Technology |
|---|---|
| Frontend | React |
| Frontend Runtime/Package Manager | Deno |
| Frontend Routing | React Router + path-to-regexp |
| Styling/UI | Tailwind CSS + shadcn/ui + React Portal |
| Client State | Zustand |
| Frontend Validation | zod |
| Frontend Utilities | radash |
| Icons | react-icons |
| Knowledge Editor | Tiptap + Markdown serializer |
| Backend | Rust + Actix Web |
| Realtime | WSS ผ่าน Actix WebSocket handler |
| Database | Turso Database |
| ASR | Botnoi ASR |
| TTS | Botnoi TTS |
| Playbook | Approved-source full-text search + guided answer |

## ลำดับการทำงานที่แนะนำ

1. Finalize PRD, development phases, GitHub workflow และ user journey
2. สรุป data model และ API contract
3. สร้าง mock API contracts ต่อ module ก่อนเริ่ม frontend/backend
4. ตรวจ ER diagram และ API sequence diagrams
5. ตั้ง frontend component structure และ design primitives
6. ตั้ง Rust/Actix Web module structure ตาม [backend-architecture-standard.md](./backend-architecture-standard.md) และ Turso schema
7. ทำ audio upload + Botnoi ASR proof of concept
8. ทำ scorecard/rule engine เบื้องต้น
9. ทำ Playbook management + Playbook Search / Guided Q&A
10. ทำ WSS voice Senario + Botnoi TTS
11. ทำ onboarding track, track management และ badge tracker
12. ทำ pilot, calibration และ regression testing

## Definition of Ready

ก่อนเริ่ม sprint แรก ควรมีอย่างน้อย:

- scorecard v1 ที่องค์กรอนุมัติ
- persona และ scenario สำหรับ voice Senario อย่างน้อย 3 แบบ
- playbook sections ชุดแรกที่มี owner, tags, effective date และ expiry date สำหรับ promotion
- Botnoi ASR/TTS credentials และ quota
- decision เรื่อง storage สำหรับไฟล์เสียง
- Turso database environment
- role และ permission matrix
- UI route map และ frontend folder standard
- Deno 2.x สำหรับ frontend local development
- mock API contract ของ module ที่จะเริ่มทำ
- ยืนยันการใช้ `ui_color_theme.json` เป็น visual theme หลัก

## Definition of Done

feature ถือว่าเสร็จเมื่อ:

- มี API หรือ UI ที่ใช้งานได้ตาม acceptance criteria
- response shape ตรงกับ mock contract หรือมี migration note ถ้าเปลี่ยน contract
- มี loading, empty, error และ success state
- มี audit log หรือ event log สำหรับ action สำคัญ
- มี test case ระดับ unit หรือ integration ตามความเสี่ยงของ feature
- backend production code ผ่าน rule ห้าม `unwrap`, `expect`, `panic!` และ map error เป็น response shape มาตรฐาน
- มี seed/demo data สำหรับ reviewer
- ไม่ละเมิด MVP scope เช่น ไม่ผูก dependency กับ PBX ตั้งแต่แรก
