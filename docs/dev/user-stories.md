# User Stories

## Epic 1: Batch Quality Review

### US-001 Create Quality Review Batch

ในฐานะ sales หรือ manager ฉันต้องการสร้าง batch สำหรับไฟล์เสียงหรือเอกสารหลายรายการ เพื่อให้ระบบประเมินตาม guidance เดียวกันโดยไม่ต้องรันทีละไฟล์เอง

Acceptance criteria:

- รองรับ `mp3`, `wav`, `m4a`, `webm`
- รองรับ document/article/text item จากไฟล์ `.md`, `.txt`, `.doc`, `.docx`
- ต้อง validate file type และ file size
- ต้องเลือก guidance/scorecard template ก่อน run batch
- หลังสร้าง batch ต้องเห็นใน batch list
- หน้า list แสดง summary เท่านั้น ไม่แสดง process รายไฟล์จนกว่าจะกดเข้า batch

### US-002 Run Batch Async Sequentially

ในฐานะ manager ฉันต้องการกด run batch แล้วให้ระบบ process ทีละไฟล์แบบ async เพื่อคุม resource และเห็น progress ชัดเจน

Acceptance criteria:

- กด run แล้ว batch เปลี่ยนเป็น `processing`
- item ใน batch ถูก process ตามลำดับ queue
- แต่ละ item มีสถานะ `queued`, `processing`, `scored`, `failed`
- batch detail แสดง progress รายไฟล์หรือราย document
- item fail แล้วต้องเก็บ error และให้ retry ได้ใน phase ถัดไป

### US-003 View Item Transcript or Evidence

ในฐานะ sales ฉันต้องการดู transcript หลังถอดเสียง เพื่อเช็คว่าระบบเข้าใจคำพูดถูกต้องหรือไม่

Acceptance criteria:

- transcript แสดงเป็น utterance พร้อม timestamp
- ถ้ามี speaker label ต้องแสดง sales/customer
- ถ้า ASR fail ต้องเห็น error และ retry ได้
- ถ้าเป็น document/article ต้องเห็น evidence span เช่น paragraph, heading หรือ sentence

### US-004 View Scorecard

ในฐานะ sales ฉันต้องการเห็นคะแนนพร้อมเหตุผล เพื่อรู้ว่าต้องปรับ pitch ตรงไหน

Acceptance criteria:

- แสดง total score และ score รายข้อ
- แต่ละข้อมี evidence หรือ explanation
- มี recommendation ที่ actionable

### US-005 Manager Review Score

ในฐานะ manager ฉันต้องการ override score เพื่อแก้ผลประเมินที่ AI ให้ผิด

Acceptance criteria:

- manager เห็น original score และ evidence
- manager แก้ score พร้อมเหตุผลได้
- ระบบเก็บ audit log

## Epic 2: Playbook Search และ Guided Q&A

### US-005 Ask Playbook Question

ในฐานะ sales ฉันต้องการค้น/ถาม playbook เรื่องบริษัท ผลิตภัณฑ์ โปรโมชัน หรือคู่แข่งจากแหล่งที่อนุมัติ เพื่อเตรียมตอบลูกค้า

Acceptance criteria:

- ระบบตอบแบบ source-first พร้อม snippet และ citation
- ถ้าไม่มี source ต้องตอบว่าไม่พบข้อมูลในแหล่งที่อนุมัติ
- user ให้ feedback คำตอบได้

### US-006 Manage Playbook Section

ในฐานะ admin ฉันต้องการสร้าง playbook section เพื่อให้ sales ใช้เป็น source

Acceptance criteria:

- section มี owner, version, status, tags, effective date และ expiry date ถ้าเป็น promotion
- draft section ยังไม่ถูกใช้ใน production answer
- published section ถูกนำไปค้นหาได้
- expired promotion section ไม่ถูกใช้ตอบใน production

## Epic 3: Training

### US-007 Recording Review

ในฐานะ sales ฉันต้องการอัดเสียง pitch ใน browser หรือ upload ไฟล์เสียง เพื่อให้ AI coach ประเมินโดยไม่ต้องรอสายจริง

Acceptance criteria:

- เลือก input mode ได้ระหว่าง `browser_recording` และ `audio_upload`
- สร้าง recording review batch และเพิ่ม attempt ได้มากกว่า 1 ครั้ง
- แก้ชื่อ batch ได้โดยไม่กระทบ attempt หรือผลคะแนนเดิม
- ใช้ Botnoi ASR ถอดเสียง
- วิเคราะห์ด้วย training rubric
- แสดง comparison ของ attempt 1, 2, 3 ใน batch เดียวกัน
- คลิก attempt เพื่อดู audio playback และ ASR transcript แบบมี speaker/timestamp ได้
- result ถูกบันทึกเป็น training session

### US-008 Voice Senario

ในฐานะ sales ฉันต้องการคุยกับ AI customer แบบเสียง เพื่อฝึกตอบคำถามและ objection

Acceptance criteria:

- เลือก persona และ scenario ได้
- ระบบรับเสียงผ่าน WSS
- ระบบตอบกลับด้วย Botnoi TTS
- หลังจบ session มี score และ feedback

### US-009 Review Training History

ในฐานะ sales ฉันต้องการดูประวัติ training เพื่อเห็นพัฒนาการของตัวเอง

Acceptance criteria:

- เห็น session ย้อนหลัง
- เห็น score trend
- เปิดรายละเอียด feedback ได้

## Epic 4: Onboarding

### US-010 View Onboarding Tasks

ในฐานะ sales ฉันต้องการเห็น task onboarding ที่ต้องทำ เพื่อรู้ว่าต้องผ่านอะไรบ้างก่อนพร้อมขายจริง

Acceptance criteria:

- เห็น module ทั้งหมดใน path
- เห็นสถานะ not started, in progress, passed, needs review
- กดเข้าไปทำ task ได้

### US-011 Manager Sign-Off

ในฐานะ manager ฉันต้องการ sign-off sales ที่ผ่านเกณฑ์ เพื่ออนุมัติ readiness

Acceptance criteria:

- manager เห็น evidence จาก quiz, recording review, voice Senario และ call quality
- sign-off ต้องใส่ note ได้
- ระบบเก็บ audit log

## Epic 5: Governance

### US-012 Role-Based Access

ในฐานะ admin ฉันต้องการกำหนดสิทธิ์ เพื่อป้องกันการเข้าถึงข้อมูลเสียงและคะแนนผิดคน

Acceptance criteria:

- sales เห็นเฉพาะข้อมูลตัวเอง
- manager เห็นข้อมูลทีม
- admin เห็น settings และ playbook workflow
- action สำคัญถูก audit log
