# User Journeys

## 1. Sales/Manager: Create Batch Quality Review

```mermaid
journey
    title User creates batch and reviews item results
    section Prepare Batch
      Open Quality Review: 5: Sales, Manager
      Edit setup and select source type: 5: Sales, Manager
      Select guidance or scorecard template: 5: Sales, Manager
      Create review batch: 5: Sales, Manager
    section Batch Queue
      See batch in list: 5: Sales, Manager
      Run batch async: 4: Manager
      Open batch detail: 5: Sales, Manager
    section Item Review
      Watch each item progress: 4: System
      Open scored item: 5: Sales, Manager
      Inspect scorecard and evidence: 5: Sales, Manager
```

### Flow

1. User เปิดหน้า `Quality Review`
2. กด `Edit setup` เพื่อเลือก source type, metadata และ guidance/scorecard template
3. สร้าง review batch จากไฟล์เสียง เอกสาร หรือบทความหลายรายการ โดย document รองรับ `.md`, `.txt`, `.doc`, `.docx`
4. หน้า list แสดง batch summary เท่านั้น
5. User กด run batch เพื่อให้ backend process item ทีละรายการแบบ async
6. User ต้องกดเข้า batch detail ก่อนจึงเห็น progress และ result รายไฟล์หรือราย document
7. เมื่อ item scored แล้ว user เปิด scorecard, transcript/document evidence และ recommendation ได้

## 2. Manager: Review Low Score Submission

```mermaid
journey
    title Manager reviews risky submission
    section Dashboard
      Open team dashboard: 5: Manager
      Filter low score items: 5: Manager
    section Review
      Listen audio snippet: 4: Manager
      Inspect evidence: 5: Manager
      Override score if needed: 4: Manager
    section Coach
      Assign coaching task: 5: Manager
      Track completion: 4: Manager
```

### Flow

1. Manager เปิด dashboard
2. filter batch หรือ item ที่ score ต่ำหรือมี critical flag
3. เปิด batch detail แล้วเลือก item เพื่อดู transcript/evidence
4. override score หาก AI ประเมินผิด
5. assign coaching task
6. track completion ใน onboarding dashboard

## 3. Sales: Ask Playbook Search

```mermaid
journey
    title Sales asks approved playbook question
    section Ask
      Open Ask mode: 5: Sales
      Type product or competitor question: 5: Sales
    section Answer
      Read answer with citation: 5: Sales
      Open source preview: 4: Sales
    section Feedback
      Mark useful or not useful: 4: Sales
```

### Flow

1. Sales เปิด `Training > Ask`
2. ถามคำถามเกี่ยวกับ product, use case, competitor หรือ objection
3. ระบบค้นจาก published playbook sections ที่ยังไม่หมดอายุ
4. AI ตอบพร้อม citation
5. Sales เปิด source preview ได้
6. หากคำตอบไม่ดี sales ให้ feedback เพื่อให้ admin ปรับ playbook

## 4. Sales: Voice Senario

```mermaid
journey
    title Sales practices voice Senario
    section Setup
      Select persona: 5: Sales
      Select scenario: 5: Sales
      Start voice session: 4: Sales
    section Conversation
      Speak to AI customer: 5: Sales
      Hear AI response: 5: Sales
      Handle objection: 4: Sales
    section Result
      End session: 4: Sales
      Review score and feedback: 5: Sales
```

### Flow

1. Sales เลือก persona เช่น price-sensitive customer
2. Frontend เปิด WSS session
3. Sales พูดผ่าน microphone
4. Backend ส่งเสียงไป Botnoi ASR
5. AI scenario engine สร้างคำตอบ
6. Backend ส่งข้อความไป Botnoi TTS
7. Frontend เล่นเสียงตอบกลับ
8. จบ session แล้วระบบสรุป score และ feedback

## 5. Admin: Publish Playbook Section

```mermaid
journey
    title Admin publishes playbook section
    section Create
      Create playbook section: 4: Admin
      Add metadata: 5: Admin
    section Review
      Validate owner and version: 5: Admin
      Run smoke questions: 4: Admin
    section Publish
      Publish section: 5: Admin
      Monitor failed answers: 4: Admin
```

### Flow

1. Admin สร้าง playbook section
2. กำหนด owner, version, section type, effective date, expiry date และ tags
3. section อยู่สถานะ draft/review
4. run smoke eval ด้วยคำถามพื้นฐาน
5. publish section
6. Guided Q&A ใช้ section เป็น approved source เมื่อยังไม่หมดอายุ

## 5.1 Admin/Owner: Manage Knowledge Library

```mermaid
journey
    title Owner manages Knowledge as a book library
    section Organize
      Open Knowledge: 5: Admin, Owner
      Choose category and book: 5: Admin, Owner
      Navigate chapter topic page: 5: Admin, Owner
    section Write
      Edit Markdown page: 5: Admin, Owner
      Preview source page: 5: Admin, Owner
      Upload PDF CSV XLSX MD DOC TXT: 4: Admin, Owner
    section Govern
      Review import mapping: 4: Admin, Owner
      Publish page: 5: Admin, Owner
      Sync BM25 or Kotaemon LEANN: 4: System
    section Reuse
      Open Senario favorites: 5: Sales
      Read saved knowledge page: 5: Sales
```

### Flow

1. Owner เปิดหน้า `Knowledge`
2. เลือก category เช่น product, sales playbook, market intelligence หรือ battlecard
3. เลือก book แล้วเจาะเข้า chapter, topic และ page
4. เขียนหรือแก้เนื้อหาใน Markdown editor พร้อม preview
5. Upload resource ได้ทั้ง `.pdf`, `.csv`, `.xlsx`, `.md`, `.doc`, `.docx`, `.txt`
6. ระบบสร้าง import job, extract text และให้ owner map เข้า page ก่อน publish
7. เมื่อ publish แล้ว backend queue BM25 index และ optional Kotaemon/LEANN sync
8. Sales เห็น favorite จาก Senario/session review ในหน้า Knowledge เพื่ออ่านต่อภายหลัง

## 6. Sales Onboarding Journey

```mermaid
journey
    title Sales completes onboarding
    section Start
      View assigned track: 5: Sales
      Open track detail: 5: Sales
      Complete company solution topic: 4: Sales
    section Practice
      Ask product questions: 5: Sales
      Record or upload pitch attempt: 5: Sales
      Complete linked Senario topic: 5: Sales
      Submit audio response: 4: Sales
    section Reward
      Unlock badge when threshold is met: 5: Sales
    section Approval
      Manager reviews evidence: 4: Manager
      Manager signs off: 5: Manager
```

### Flow

1. Manager/admin สร้าง track ใน Track Management
2. Manager assign track ให้ sales หรือทีม
3. Sales หรือ manager filter track ตาม category, level และ solution เช่น Foundation, Beginner, Chatbot
4. Sales เปิด `track/:id` เพื่อดู topic, progress และ badge criteria
5. Sales ทำ topic แบบ Knowledge หรือ External View เพื่ออ่านเอกสาร/แหล่งอ้างอิง
6. Sales ทำ topic แบบ Audio Response โดยฟังโจทย์แล้วเขียนคำตอบให้ AI/manager ประเมิน
7. Sales สร้าง recording review batch
8. Sales เลือก training rubric
9. Sales อัดเสียงใน browser หรือ upload ไฟล์เสียงเป็น attempt
10. ระบบประเมิน attempt ด้วย rubric และแสดง score/feedback
11. Sales ทำ voice Senario หรือ Meeting Room ที่ผูกกับ track
12. เมื่อ Senario complete และ score ผ่าน threshold ระบบ mark topic เป็น completed
13. ระบบคำนวณ track percent และ unlock badge เมื่อ complete ตาม threshold
14. Manager เปิด progress/evidence เพื่อ sign-off readiness

Admin settings journey:

1. Admin เปิด Settings
2. Admin เข้า Track Categories เพื่อเพิ่ม/แก้/ลบ category และดู track ที่ assign อยู่
3. Admin เข้า Solutions เพื่อเพิ่ม/แก้/ลบ solution catalog เช่น Chatbot, Voicebot, Digital Human, CMS, DocSearch
4. เมื่อกด delete ระบบแสดง confirm modal yes/no ก่อนลบทุกครั้ง
