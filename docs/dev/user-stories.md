# User Stories

## Epic 0: Auth and Platform Entry

### US-000 Login and Current User

ในฐานะผู้ใช้ ฉันต้องการ login ด้วย email/password และให้ระบบโหลดข้อมูลผู้ใช้ปัจจุบัน เพื่อเข้า platform ด้วย role และ permission ที่ถูกต้อง

Acceptance criteria:

- มี route `/login` สำหรับ email/password
- เมื่อ login สำเร็จ ระบบเรียก `GET /auth/me` หรือใช้ user DTO จาก login เพื่อ set current user
- current user ต้องมี `role`, `teamId`, `salesProfile`, `highestBadge` และ `permissions`
- sidebar/profile menu แสดงชื่อ, role, badge และรองรับ logout
- ถ้า token หมดอายุหรือไม่มี session ต้อง redirect กลับ `/login`

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

### US-006 Manage Knowledge Book and Page

ในฐานะ admin/owner ฉันต้องการสร้าง Knowledge แบบ book, chapter, topic และ page เพื่อให้ sales ใช้เป็น source ที่อ่านง่าย แก้ไขง่าย และอ้างอิงกลับได้

Acceptance criteria:

- page มี owner, version, status, tags, effective date และ expiry date ถ้าเป็น promotion/pricing
- user เขียนและ preview Markdown ได้
- upload resource รองรับ `.pdf`, `.csv`, `.xlsx`, `.md`, `.doc`, `.docx`, `.txt` และสร้าง import job ก่อน publish
- draft page ยังไม่ถูกใช้ใน production answer
- published page ถูกนำไปค้นหาและ sync เข้า BM25/Kotaemon/LEANN ได้
- expired promotion page ไม่ถูกใช้ตอบใน production
- favorite จาก Senario/session review แสดงใน Knowledge เพื่อกลับมาอ่านภายหลัง

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

### US-010 View Onboarding Track

ในฐานะ sales ฉันต้องการเห็น track, topic, progress และ badge criteria เพื่อรู้ว่าต้องผ่านอะไรบ้างก่อนพร้อมขายจริง

Acceptance criteria:

- เห็น track ทั้งหมดที่ถูก assign พร้อม percent complete
- track list ต้อง scroll ได้เมื่อมี track จำนวนมาก
- filter track ตาม category, level และ solution ได้
- track ที่มี prerequisite ยังไม่ผ่านต้องแสดง locked state พร้อมรายชื่อ track ที่ต้อง complete ก่อน
- เห็น topic ใน track เช่น knowledge, external view, audio response, recording review และ Senario
- กดเข้า `track/:id` เพื่อเริ่ม topic หรือดู badge rule ได้
- topic แบบ Senario ต้องแสดง required score และ source session ที่ผูกไว้

### US-011 Manage Track and Badge

ในฐานะ manager/admin ฉันต้องการสร้างและแก้ track เพื่อกำหนดลำดับการเรียนรู้และ badge ที่ sales จะได้รับ

Acceptance criteria:

- เข้า `track-management/:id` เพื่อแก้ชื่อ track, category, solution, level, prerequisite tracks, topic order, source ref, required score และ badge threshold ได้
- level รองรับ `beginner`, `intermediate`, `advanced`
- topic type รองรับ knowledge, external view, audio response, recording review และ Senario
- prerequisite tracks ต้องป้องกัน cycle เช่น A requires B และ B requires A
- badge unlock rule ต้องคำนวณจาก percent ของ topic ที่ complete
- ทุกการแก้ไข track ต้องเก็บ audit log

### US-011A Manage Track Categories and Solutions

ในฐานะ admin ฉันต้องการจัดการ track category และ solution catalog เพื่อให้ track filter, reporting และ assignment ใช้ข้อมูลเดียวกัน

Acceptance criteria:

- Settings มีหน้า Track Categories Management แยกจากหน้าอื่น
- Settings มีหน้า Solutions Management แยกจากหน้าอื่น
- table แต่ละหน้ามี row action `...` ที่เปิด edit/delete action
- delete ต้องแสดง confirm modal yes/no
- category row ต้องแสดง track ที่ assign อยู่
- solution default สำหรับ MVP คือ Chatbot, Voicebot, Digital Human, CMS และ DocSearch

### US-012 Linked Senario Completion

ในฐานะ sales ฉันต้องการให้ Senario ที่ทำผ่านแล้วอัปเดต onboarding track อัตโนมัติ เพื่อไม่ต้องส่งหลักฐานซ้ำ

Acceptance criteria:

- เมื่อ Senario session ที่ผูกกับ topic complete และ score ผ่าน threshold ระบบ mark topic เป็น completed
- progress track และ badge percent อัปเดตทันที
- ถ้า score ไม่ผ่าน ระบบแสดงว่า topic ยัง in progress และเก็บ attempt เป็น evidence

### US-013 Manager Sign-Off

ในฐานะ manager ฉันต้องการ sign-off sales ที่ผ่านเกณฑ์ เพื่ออนุมัติ readiness

Acceptance criteria:

- manager เห็น evidence จาก track topic, recording review, voice Senario, audio response และ call quality
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
