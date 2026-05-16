# GitHub Workflow และ Branch Strategy

เอกสารนี้กำหนดวิธีใช้ GitHub ให้ทีม product, frontend, backend, QA และ content/playbook ทำงานร่วมกันได้โดยไม่ชนกันบ่อย และลดปัญหา frontend ทำเสร็จแล้วพบว่า backend ไม่มี API ที่ต้องใช้

## 1. หลักการทำงาน

- ใช้ contract-first development: API/mock contract ต้องชัดก่อนเริ่ม frontend/backend ของ module นั้น
- branch ต้องสั้นและ merge บ่อย ไม่เก็บงานใหญ่หลายสัปดาห์ไว้ใน branch เดียว
- PR ต้องเล็กพอ review ได้ภายใน 1 วันทำงาน
- ทุก PR ต้องผูก issue หรือ milestone
- ห้าม merge change ที่เปลี่ยน API โดยไม่แก้ `docs/dev/mock-api-contracts.md`
- ห้าม merge change ที่เปลี่ยน data model โดยไม่แก้ ER diagram หรือ migration note

## 2. Branch Model ที่แนะนำ

ใช้ GitHub Flow แบบมี release branch เฉพาะตอนเตรียม pilot

| Branch | ใช้เพื่อ | Rule |
|---|---|---|
| `main` | source หลักที่ deploy ได้เสมอ | protected, merge ผ่าน PR เท่านั้น |
| `feature/<module>/<short-name>` | งาน feature ปกติ | แตกจาก `main`, อายุสั้น |
| `mock/<module>/<short-name>` | งาน mock frontend หรือ mock API contract | ใช้ก่อน real backend พร้อม |
| `backend/<module>/<short-name>` | งาน backend/domain/API | ใช้เมื่อ scope เป็น backend ชัด |
| `frontend/<module>/<short-name>` | งาน frontend UI/state | ใช้เมื่อ scope เป็น frontend ชัด |
| `docs/<topic>` | งานเอกสาร | ใช้กับ PR เอกสารหรือ planning |
| `fix/<area>/<short-name>` | bug fix | แตกจาก `main` |
| `release/pilot-<date-or-version>` | freeze ก่อน pilot/production | สร้างเมื่อจะ test release เท่านั้น |
| `hotfix/<short-name>` | แก้ production/pilot issue ด่วน | แตกจาก `main`, merge กลับ `main` และ release branch |

ไม่แนะนำให้มี `develop` ในช่วง MVP เพราะจะทำให้ทีมต้องจำว่า source of truth อยู่ branch ไหน และมักเกิด drift ระหว่าง `develop` กับ `main`

## 3. Branch Naming

รูปแบบ:

```text
<type>/<module>/<issue-id>-<short-name>
```

ตัวอย่าง:

```text
docs/planning/12-github-workflow
mock/audio-review/21-scorecard-flow
frontend/audio-review/34-evidence-drawer
backend/audio-review/35-submission-api
backend/playbook/42-fts-search
frontend/training/50-voice-roleplay-shell
fix/audio-review/61-score-total
release/pilot-2026-06-15
```

Module names ที่ใช้ให้คงที่:

- `audio-review`
- `scorecards`
- `playbook`
- `training`
- `voice-roleplay`
- `onboarding`
- `users-rbac`
- `platform`
- `docs`

## 4. GitHub Issue Structure

ใช้ issue เป็นหน่วยงานย่อย ไม่ใช้ chat เป็น source of truth

Issue template ควรมี:

```markdown
## Goal

## Scope

## Contract / API

## UI States
- loading
- empty
- error
- success
- permission denied

## Acceptance Criteria

## Test Plan

## Out of Scope
```

สำหรับ backend issue ต้องระบุ:

- endpoint หรือ WSS event ที่แตะ
- request/response shape
- entity/usecase ที่เกี่ยวข้อง
- migration ที่ต้องมี
- audit/log requirement

สำหรับ frontend issue ต้องระบุ:

- route/page/component ที่แตะ
- mock API ที่ใช้
- role ที่เห็นหน้า
- responsive state
- loading/empty/error/success state

## 5. Labels

Labels ที่ควรสร้าง:

| Label | ใช้เมื่อ |
|---|---|
| `area:frontend` | งาน frontend |
| `area:backend` | งาน backend |
| `area:docs` | งานเอกสาร |
| `area:qa` | งาน test |
| `area:playbook` | งาน content/playbook |
| `module:audio-review` | module ตรวจไฟล์เสียง |
| `module:training` | module training |
| `module:voice-roleplay` | module voice Senario |
| `module:onboarding` | module onboarding |
| `module:rbac` | user/role/permission |
| `type:contract` | API/mock contract |
| `type:mock` | mock frontend/mock data |
| `type:feature` | feature ใหม่ |
| `type:bug` | bug |
| `type:tech-debt` | refactor/cleanup |
| `risk:high` | แตะ auth, score, privacy, audio, migration |
| `blocked` | ติด dependency |
| `ready-for-review` | พร้อม review |

## 6. Milestones

ตั้ง milestone ตาม development phases:

- `Phase 0 - Contract First`
- `Phase 1 - Mock Frontend`
- `Phase 2 - Backend Foundation`
- `Phase 3 - ASR Scoring MVP`
- `Phase 4 - Playbook MVP`
- `Phase 5 - Voice Senario`
- `Phase 6 - Onboarding Tracker`
- `Phase 7 - Pilot Calibration`

Issue ทุกใบต้องอยู่ใน milestone เดียว เพื่อให้ scope ของ sprint ชัด

## 7. PR Rules

PR title:

```text
[module] action summary
```

ตัวอย่าง:

```text
[audio-review] add mock scorecard review flow
[playbook] add FTS search contract
[backend] add audio submission aggregate
```

PR description template:

```markdown
## Summary

## Changes

## Contract Changes
- [ ] No API/mock contract changes
- [ ] Updated docs/dev/mock-api-contracts.md

## Screenshots / Demo

## Test Plan

## Risk

## Rollback
```

Review rules:

- PR ที่แตะ frontend อย่างเดียว: frontend reviewer 1 คน
- PR ที่แตะ backend อย่างเดียว: backend reviewer 1 คน
- PR ที่เปลี่ยน API contract: frontend + backend reviewer อย่างน้อยฝั่งละ 1 คน
- PR ที่แตะ auth, role, transcript, score, audit, privacy: tech lead ต้อง review
- PR ที่แตะ Playbook/promotion/compliance content: product หรือ enablement owner ต้อง review

## 8. Merge Rules และ Protection

ตั้ง branch protection สำหรับ `main`:

- require PR before merge
- require status checks
- require at least 1 approval
- require conversation resolved
- dismiss stale approvals เมื่อมี commit ใหม่
- block force push
- block direct push

แนะนำ merge strategy:

- ใช้ squash merge เป็นหลัก เพื่อให้ history อ่านง่าย
- commit message ควรอ้าง issue เช่น `Closes #34`
- ห้าม merge PR ที่ CI ไม่ผ่าน ยกเว้น tech lead อนุมัติพร้อมเหตุผลใน PR

## 9. CI ขั้นต่ำ

ทุก PR ควรรัน:

| Track | Command |
|---|---|
| Frontend typecheck | `npm run lint` ใน `frontend` |
| Frontend build | `npm run build` ใน `frontend` |
| Backend check | `cargo check` ใน `backend` เมื่อ backend scaffold พร้อม |
| Backend test | `cargo test` ใน `backend` เมื่อมี test |
| Docs | ตรวจ markdown link สำคัญแบบ manual หรือเพิ่ม checker ภายหลัง |

CI ควรแยก job ตาม path:

- เปลี่ยนเฉพาะ `docs/**` ไม่ต้องรัน backend เต็ม
- เปลี่ยนเฉพาะ `frontend/**` รัน frontend jobs
- เปลี่ยนเฉพาะ `backend/**` รัน backend jobs
- เปลี่ยน `docs/dev/mock-api-contracts.md` ให้รันทั้ง frontend typecheck และ backend contract tests เมื่อมี

## 10. Project Board

ใช้ GitHub Projects มุมมอง Kanban:

| Status | ความหมาย |
|---|---|
| Backlog | ยังไม่เข้า sprint |
| Ready | มี scope, contract, acceptance criteria |
| In Progress | มีคนรับผิดชอบและ branch แล้ว |
| In Review | เปิด PR แล้ว |
| QA / Demo | merge แล้วรอทดสอบหรือ demo |
| Done | ผ่าน acceptance criteria |
| Blocked | ติด dependency |

Custom fields:

- Phase
- Module
- Area
- Owner
- Risk
- Target Sprint

## 11. Contract-First Workflow สำหรับหลายทีม

ลำดับที่ควรทำทุก module:

1. Product สร้าง issue พร้อม user story และ acceptance criteria
2. Frontend + backend ตกลง mock contract
3. เปิด PR `docs/<module>/<issue>-contract`
4. merge contract หลังทั้งสองฝั่ง approve
5. Frontend แตก `frontend/<module>/<issue>-ui` ทำ mock UI จาก contract
6. Backend แตก `backend/<module>/<issue>-api` ทำ API จริงตาม contract
7. เมื่อ backend พร้อม ให้ frontend เปลี่ยนจาก mock API เป็น real API adapter
8. QA ทดสอบตาม acceptance criteria และ state ทั้งหมด

ข้อสำคัญ:

- ถ้า frontend ต้องเพิ่ม field ให้เปิด contract PR ก่อน
- ถ้า backend ตอบ field ไม่ได้ ต้องคุยใน contract PR ไม่ใช่แก้เงียบใน implementation PR
- mock data ต้องสะท้อน edge cases เช่น empty, failed, needs review, permission denied

## 12. Release และ Pilot

เมื่อจะเริ่ม pilot:

1. สร้าง `release/pilot-yyyy-mm-dd` จาก `main`
2. freeze feature ใหม่ใน release branch
3. merge เฉพาะ bug fix ที่จำเป็น
4. tag release เช่น `pilot-0.1.0`
5. เก็บ release notes ว่าเปิด feature ไหน ปิด feature ไหน known issue คืออะไร

Hotfix:

1. แตก `hotfix/<issue>` จาก `main`
2. merge เข้า `main`
3. cherry-pick หรือ PR เข้า release branch ถ้ายังใช้ pilot branch อยู่

## 13. Definition of Ready สำหรับ Issue

Issue พร้อมเริ่มเมื่อมี:

- owner
- phase/milestone
- module/area labels
- acceptance criteria
- mock/API contract หรือบอกชัดว่าไม่แตะ contract
- test plan
- out of scope

## 14. Definition of Done สำหรับ PR

PR พร้อม merge เมื่อ:

- code/docs ตรง acceptance criteria
- mock contract อัปเดตถ้า API เปลี่ยน
- UI มี loading/empty/error/success state ใน scope
- tests หรือ manual test evidence ระบุใน PR
- screenshot/demo แนบสำหรับ frontend
- reviewer ที่เกี่ยวข้อง approve
- ไม่มี unresolved conversation
