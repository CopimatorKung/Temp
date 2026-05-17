# Product Requirements Document: SaleSync MVP

## 1. Product Vision

SaleSync MVP คือระบบช่วยลดเวลาการปั้น sales ให้พร้อมขายจริง โดยใช้การตรวจคุณภาพจากไฟล์เสียง, AI training, Playbook และ onboarding tracker เพื่อให้ sales ใหม่เรียนรู้เร็วขึ้น พูดตามมาตรฐานองค์กรได้สม่ำเสมอ และให้ manager ใช้เวลา coaching ได้ตรงจุดมากขึ้น

ช่วงแรกระบบจะเริ่มจาก **ไฟล์เสียงที่ผู้ใช้ upload** และ **voice Senario สำหรับฝึกซ้อม** ไม่เชื่อมต่อตู้โทรศัพท์, PBX, CTI หรือ CCaaS โดยตรง

ระบบนี้ **ไม่ใช่ HRM** และไม่ทำงานแทนระบบ HR เช่น payroll, leave, compensation, disciplinary record หรือการประเมินผลบุคลากรอย่างเป็นทางการ แต่ต้องมีข้อมูลผู้ใช้และ sales profile เพียงพอสำหรับ coaching, training, onboarding และการติดตาม readiness ในบริบททีมขาย

## 2. Business Pain

องค์กรที่มีทีมขายมักเสียต้นทุนซ้ำจากการ onboarding และ turnover:

| Pain | ผลกระทบกับองค์กร |
|---|---|
| Turnover ของ sales สูง | ต้องเริ่มสอนคนใหม่ซ้ำบ่อย ความรู้จากคนเก่าหายไป และ manager เสียเวลาประกบซ้ำ |
| Sales ใช้เวลาเรียนรู้นาน | กว่าจะเข้าใจบริษัท ผลิตภัณฑ์ ลูกค้า คู่แข่ง และ objection ต้องใช้เวลาหลายสัปดาห์หรือหลายเดือน |
| มาตรฐานการพูดไม่เท่ากัน | ลูกค้าได้รับข้อมูลไม่ครบ บางคน pitch เกินจริง บางคนลืมถาม pain point หรือข้าม disclaimer |
| Manager ฟังสายย้อนหลังไม่ครบ | คุณภาพการขายถูกตรวจแบบสุ่ม ทำให้ feedback ช้าและพลาด pattern ที่เกิดซ้ำ |
| ลูกค้าเสียเวลา | Sales ที่ยังไม่พร้อมถามผิดจุด อธิบายไม่ตรง pain หรือใช้เวลาคุยนานแต่ไม่ได้ qualification ที่จำเป็น |
| องค์กรเสียเวลาและโอกาส | lead คุณภาพดีถูกใช้ไปกับ conversation ที่ยังไม่พร้อม ส่งผลต่อ conversion และ brand experience |
| Playbook กระจัดกระจาย | promotion, pricing, battle card และ script เปลี่ยนบ่อย แต่ sales ไม่รู้ว่า source ล่าสุดคืออะไร |

## 3. Product Outcomes

เป้าหมายหลัก:

- ลดเวลา onboarding จน sales พร้อมรับ lead จริง
- ลดเวลาที่ manager ต้องใช้ฟังไฟล์เสียงแบบ manual
- เพิ่ม consistency ของ sales talk ตามมาตรฐานองค์กร
- ทำให้ feedback เกิดเร็วหลังการฝึกหรือหลังอัปโหลดเสียง
- ทำให้ Playbook เป็น source ที่อัปเดตและตรวจสอบได้
- ลดความเสี่ยงจากการพูดผิด policy, promotion หมดอายุ หรือ claim เกินจริง

## 4. Target Users และ Jobs To Be Done

### User Roles

| Role | ความต้องการหลัก |
|---|---|
| Sales | upload ไฟล์เสียง, ฝึกกับ AI, ดู feedback, ทำ onboarding task และดู progress ของตัวเอง |
| Manager | ดูข้อมูลทีม, review ไฟล์เสียง, override score เมื่อจำเป็น, assign coaching task และ sign-off readiness |
| Admin | จัดการ user, role, team, sales profile, playbook, rubric, rule และ system setting |

### Jobs To Be Done

| User | Job |
|---|---|
| Sales ใหม่ | ต้องเรียนรู้ pitch, product, customer pain และข้อห้ามให้เร็วพอรับ lead จริง |
| Sales ปัจจุบัน | ต้องรู้ว่าตัวเองพลาดตรงไหนและฝึกซ้ำได้โดยไม่ต้องรอ manager |
| Manager | ต้องเห็นจุดอ่อนของทีมและ coach ด้วย evidence ไม่ใช่ความรู้สึก |
| Admin/Enablement | ต้องอัปเดต playbook, promotion และมาตรฐานการขายให้ทีมใช้ source เดียวกัน |

## 5. Sales Profile Scope

ข้อมูล sales ที่ระบบควรเก็บเป็นข้อมูลเพื่อ enablement และ coaching เท่านั้น

| ข้อมูล | ใช้เพื่อ |
|---|---|
| ชื่อ, อีเมล, role, สถานะผู้ใช้ | login, permission, routing |
| team, manager, business unit | จำกัดสิทธิ์ manager และ dashboard รายทีม |
| sales code หรือ internal reference | mapping กับข้อมูลภายในองค์กรถ้ามี |
| product line, region, language | filter training, rubric และ playbook |
| onboarding status, readiness status | ติดตามความพร้อมในการขาย |
| training history และ score history | coaching และพัฒนาทักษะ |

Out of scope ของ sales profile:

- เงินเดือน ค่าคอมมิชชัน payroll
- leave/attendance
- disciplinary record
- HR performance appraisal แบบทางการ
- employment contract หรือข้อมูล HR ที่ไม่จำเป็นต่อ training/coaching

## 6. MVP Features

### Feature A: Quality Review Engine

ผู้ใช้ส่งสิ่งที่ต้องการตรวจ เช่น ไฟล์เสียง เอกสาร บทความ sales script หรือคำตอบที่เตรียมไว้ แล้วระบบวิเคราะห์กับ scorecard/rubric ที่สร้างเฉพาะ use case และแสดง feedback พร้อม evidence

Requirements:

- รองรับไฟล์ `mp3`, `wav`, `m4a`, `webm`
- รองรับ document/text/article input สำหรับ content review โดย MVP ต้องรับไฟล์ `.md`, `.txt`, `.doc`, `.docx`
- ผู้ใช้ต้องสร้าง review batch ก่อน โดย batch หนึ่งมีได้หลายไฟล์หรือหลาย document
- ผู้ใช้เลือก guidance/scorecard template ให้ batch ก่อนเริ่ม process
- ระบบ process item ใน batch แบบ async เรียงทีละไฟล์หรือทีละ document เพื่อคุม resource, retry และ observability
- หน้า list จะแสดง batch summary เท่านั้น ผู้ใช้ต้องกดเข้า batch detail จึงจะเห็นสถานะและผลของแต่ละไฟล์
- ผู้ใช้กรอก metadata เช่น product, scenario, customer type, language
- ถ้าเป็นเสียง ใช้ Botnoi ASR ถอดเสียง
- ถ้าเป็นเอกสารหรือบทความ ใช้ text extraction/normalization ก่อน scoring โดยเก็บ normalized text และ evidence span แยกจากไฟล์ต้นฉบับ
- แสดง transcript พร้อม timestamp และ speaker label หากแยกได้
- แสดง document evidence เช่น paragraph, heading, sentence หรือ source section
- สร้าง scorecard พร้อม evidence
- scorecard/rubric ต้องสร้างได้ตาม use case เช่น sales call standard, SEO Organizer, prohibited answer, legal claim, advertising compliance
- scorecard/rubric section และ rule ต้องมี `sortOrder` เพื่อควบคุมลำดับการแสดงผลและลำดับ scoring
- rule ต้องมี `expectedEvidence` และควรมี `example` เพื่อช่วย manager/reviewer และใช้เป็น fixture สำหรับ validation test
- ตรวจคำตอบห้ามหรือ claim ที่เสี่ยงฟ้องร้อง เช่น รับประกันผลลัพธ์เกินจริง, โฆษณาเกินจริง, ราคา/โปรโมชันไม่ครบเงื่อนไข, คำแนะนำที่เกินขอบเขต
- manager override score ได้

Acceptance criteria:

- create batch สำเร็จแล้วเห็น batch ใน list พร้อมจำนวน item และ status
- run batch แล้วระบบเริ่ม process item ตามลำดับ และแสดงสถานะ `queued`, `processing`, `scored`, `failed` รายไฟล์ใน batch detail
- ต้องกดเข้า batch ก่อนจึงเห็น progress และผลรายไฟล์
- item processing สำเร็จแล้วเห็น transcript หรือ document evidence, score และ recommendation
- document batch รองรับ `.md`, `.txt`, `.doc`, `.docx` และ process แบบ async sequential เหมือน audio batch
- ถ้า ASR ล้มเหลว ระบบแสดง error ที่ retry ได้
- score แต่ละข้อมี evidence หรือเหตุผลประกอบ
- content review ต้อง flag prohibited answer และ overclaim ได้จาก rubric ที่กำหนด

### Feature B: Playbook Library และ Guided Q&A

MVP เริ่มจาก source-first Playbook ที่ admin หรือ owner เขียนคำถาม คำตอบ รายละเอียด ตัวอย่าง และ talk track ไว้ล่วงหน้า จากนั้นใช้ Turso FTS/BM25 สำหรับค้น playbook section ที่อนุมัติแล้ว เพื่อลด latency และคุม citation ให้แน่นก่อน เมื่อ Ask contract และ evaluation set พร้อม ระบบต้องรองรับ optional local RAG ด้วย Kotaemon + LEANN โดยให้ Kotaemon เป็น RAG management/service layer และ LEANN เป็น local/private vector index backend

Knowledge Management ใน UI ใช้แนวคิดเหมือนหนังสือ: `book -> chapter -> topic -> page` เพื่อให้ทีมเขียนและอ่านง่ายกว่า raw document dump แต่ backend ยังสามารถ map page กลับเป็น approved source/citation สำหรับ Ask, Senario และ RAG ได้

Requirements:

- admin/owner สร้าง playbook ได้
- playbook/knowledge book แบ่งเป็น chapter, topic และ page ได้ โดย page เป็น source ที่ใช้ index/citation
- page รองรับ Markdown editor, preview, title, summary, tags, owner, status, examples, do/dont say, product, persona relevance และ status
- upload resource รองรับ `.pdf`, `.csv`, `.xlsx`, `.md`, `.doc`, `.docx`, `.txt` แล้ว normalize เป็น page หรือ attachment artifact ก่อน sync เข้า index
- playbook/section ต้องมี owner, version, status, effective date และ expiry date เมื่อเป็นข้อมูลที่มีช่วงเวลา เช่น promotion
- ระบบสร้าง full-text index จาก book/chapter/topic/page title, markdown body, extracted text และ tags
- ระบบรองรับ optional local RAG index sync จาก approved page ไปยัง Kotaemon/LEANN โดยยัง map citation กลับมาที่ knowledge page เดิม
- ต้องมี tag taxonomy เพื่อ filter และคุม lifecycle เช่น `product`, `promotion`, `competitor`, `persona`, `segment`, `region`, `effective_status`
- user favorite knowledge ที่ได้จาก Senario หรือ session review ได้ และหน้า Knowledge ต้องแสดง favorite/bookmark เหล่านี้เพื่ออ่านต่อภายหลัง
- sales ค้นหรือถามด้วย natural language ได้
- หน้า Ask ต้องเป็น chat ที่สร้าง session ได้ เห็น session list/history และเปิด session เดิมกลับมาคุยต่อได้
- หน้า Ask ต้องมีทางเข้า Knowledge Management เพื่อบริหาร Playbook/Playbook Section ที่เป็น source
- ระบบแสดง top matching playbook sections/snippets พร้อม source/citation
- guided answer ใช้คำตอบที่เขียนไว้หรือ template จาก section ไม่ generate เกิน source
- ถ้าไม่มีข้อมูลใน source ต้อง abstain
- เก็บ question, answer, citation และ feedback

Acceptance criteria:

- sales ถามคำถามแล้วได้คำตอบแบบ source-first พร้อม snippet และ citation
- sales สร้าง Ask session ใหม่ ส่งข้อความ และกลับมาเปิด session เดิมได้
- คำถามเรื่องราคา, policy, compliance ต้องไม่ตอบถ้าไม่มี source
- manager/admin เห็นคำถามที่ตอบไม่ได้เพื่อปรับ playbook
- promotion ที่หมดอายุแล้วต้องไม่ถูกใช้เป็นคำตอบ production
- ไม่มี embedding/vector search ใน MVP
- admin upload resource แล้วเห็น import job status และ source mapping ก่อน publish/index
- favorite จาก Senario แสดงในหน้า Knowledge และสามารถเปิด source page ที่เกี่ยวข้องได้

### Suggested Playbook Sections

| Section | ใช้เก็บอะไร | ต้องมี validity ไหม |
|---|---|---|
| Company | positioning, target market, brand promise | ไม่จำเป็นเสมอ |
| Product | feature, benefit, limitation, use case | ควรมี version |
| Pricing | ราคา แพ็กเกจ เงื่อนไข | ต้องมี effective/expiry |
| Promotion | โปรโมชัน แคมเปญ ช่วงเวลา เงื่อนไข | ต้องมี effective/expiry |
| Competitor | battle card, differentiation, comparison | ควรมี version |
| Objection | ข้อโต้แย้งและคำตอบแนะนำ | ไม่จำเป็นเสมอ |
| Compliance | claim ที่พูดได้/ห้ามพูด disclaimer | ต้องมี owner/review |
| Talk Track | script, opening, discovery, closing | ควรมี version |
| Persona Notes | สิ่งที่ควรพูดกับ persona บางแบบ | ไม่จำเป็นเสมอ |

### Suggested Tags

| Tag Group | Examples |
|---|---|
| `product` | product-a, product-b, add-on |
| `section_type` | faq, promotion, competitor, objection, compliance |
| `persona` | non-tech, price-sensitive, competitor-user, distracted, fake-budget |
| `segment` | sme, enterprise, healthcare, retail |
| `region` | th, sg, global |
| `lifecycle` | draft, review, published, expired, archived |
| `validity` | always-on, campaign-only, seasonal |
| `risk` | normal, compliance-sensitive, price-sensitive |

### Feature C: AI Customer Persona และ Scenario Library

admin/manager ต้องกำหนด persona ของ AI customer ได้ เพื่อใช้ใน voice Senario โดยไม่ต้องค้น playbook หนักระหว่างบทสนทนา

Requirements:

- สร้าง persona ได้ เช่น ไม่เข้าใจเทคโนโลยี, ชอบพูดนอกเรื่อง, บอกว่างบเยอะแต่จริง ๆ งบน้อย, ใช้คู่แข่งอยู่, กังวลเรื่องราคา
- persona มี profile, behavior rules, budget truth, objections, patience level, tech literacy และ conversation goals
- scenario ผูกกับ product, use case, target skill และ related playbook sections ได้
- voice Senario ต้อง preload persona, scenario และ related playbook sections ก่อนเริ่ม session
- ระหว่างคุยสดให้ใช้ scenario state + scripted behavior + selected articles เพื่อลด latency

Acceptance criteria:

- admin/manager สร้าง persona อย่างน้อย 3 แบบได้
- sales เลือก persona และ scenario ก่อนเริ่ม voice Senario
- ระบบตอบตาม behavior ของ persona อย่างสม่ำเสมอ
- session summary ระบุว่า sales รับมือ persona นั้นได้ดี/พลาดตรงไหน
- voice Senario ไม่เรียก playbook search หนักทุก turn โดยไม่จำเป็น

### Feature D: Recording Review Training

sales ฝึก pitch หรือ mock call แล้วให้ AI coach ประเมิน โดยรองรับทั้งการอัดเสียงใน browser และการอัปโหลดไฟล์เสียงย้อนหลัง

Requirements:

- ใช้ batch/item flow เดียวกับ Quality Review Engine โดย recording review เป็น batch ที่ใช้ training rubric
- รองรับ input 2 รูปแบบ:
  - `browser_recording`: sales กดอัดเสียงในหน้าเว็บ แล้วสร้าง attempt เข้า batch
  - `audio_upload`: sales upload ไฟล์เสียง เช่น mp3, wav, m4a, webm เข้า batch
- batch ต้องเก็บหลาย attempt เพื่อเปรียบเทียบครั้งที่ 1, 2, 3 ว่าคะแนนและ feedback ดีขึ้นอย่างไร
- ใช้ training rubric แยกจาก compliance rubric ได้
- training rubric ใช้โครงสร้างเดียวกับ template management คือมี version, section, rule, weight, severity และ validation test
- แสดง feedback ด้าน opening, discovery, value proposition, objection handling, closing
- บันทึกผลเข้า onboarding progress

Acceptance criteria:

- sales เห็น feedback ที่ actionable
- sales เห็น trend ของ attempt ใน batch เดียวกัน
- score ถูกผูกกับ training session
- manager เห็นประวัติการฝึกของ sales

### Feature E: Voice Senario

sales คุยกับ AI แบบเสียงจริงผ่าน browser

Requirements:

- ใช้ WSS ระหว่าง frontend กับ Rust/Actix Web backend
- ใช้ Botnoi ASR แปลงเสียง sales เป็น text
- ใช้ AI scenario engine ที่ preload persona, scenario และ related playbook sections เพื่อสร้างคำตอบของลูกค้าจำลอง
- ใช้ Botnoi TTS สร้างเสียงตอบกลับ
- มี persona เช่น ไม่เข้าใจเทคโนโลยี, ชอบพูดนอกเรื่อง, บอกว่างบเยอะแต่จริง ๆ งบน้อย, price-sensitive, competitor-user
- รองรับ Meeting Room preset สำหรับ multi-persona session เช่น 2 managers + 1 technical team หรือ procurement committee
- Start session ต้องเลือกได้ว่าจะเริ่มจาก persona เดี่ยว/หลาย persona หรือ Meeting Room preset
- สรุปคะแนนหลังจบ session

Acceptance criteria:

- sales เริ่ม session จาก persona หรือ Meeting Room และพูดกับ AI ได้
- transcript แสดงเป็น turn-by-turn
- AI ตอบกลับด้วยเสียง
- เมื่อจบ session เห็น score และ coaching recommendation

### Feature F: Onboarding Track, Track Management และ Badge

ติดตาม readiness ของ sales ผ่าน track ที่รวมหลาย topic เข้าด้วยกัน เช่น company solution, product standard, sales course, external reference, audio response และ Senario practice

Requirements:

- admin/manager สร้างและแก้ไข `track` ได้ผ่าน Track Management
- track ต้องมี `category`, `solution` และ `level` เพื่อให้ sales/manager filter ได้ เช่น category = Foundation, Solution Specialist, Enterprise; solution = Chatbot, Voicebot, Digital Human, CMS, DocSearch; level = Beginner, Intermediate, Advanced
- track ประกอบด้วยหลาย `topic` โดย topic type รองรับ `knowledge`, `external_view`, `audio_response`, `recording_review`, และ `senario`
- topic แบบ audio response ต้องให้ sales ฟังโจทย์หรือเสียงตัวอย่าง แล้วเขียนคำตอบเพื่อให้ AI/manager ประเมิน
- topic แบบ Senario ต้องผูกกับ Senario session หรือ Meeting Room ได้
- เมื่อ sales complete topic ตาม percent threshold ระบบจะ unlock badge ให้ sales
- progress แสดงสถานะราย track, ราย topic, ราย sales และ badge ที่ได้รับ
- Settings ต้องมีหน้า Track Categories Management และ Solutions Management สำหรับ admin โดยเป็น table CRUD, มี row action `...`, edit/delete, และ delete confirmation
- track list ต้องรองรับข้อมูลจำนวนมากด้วย scrollable container และ filter ตาม category, level และ solution

Acceptance criteria:

- sales เห็น track ที่ได้รับ, topic ที่ต้องทำ, progress และ badge criteria
- sales/manager filter track ด้วย category, level และ solution ได้
- sales เข้า `track/:id` เพื่อดูรายละเอียด topic และเริ่ม activity ได้
- manager/admin เข้า `track-management/:id` เพื่อแก้ track, topic order, source, required score และ badge threshold ได้
- admin เข้า Settings > Track Categories เพื่อจัดหมวด track และเห็น track ที่ assign อยู่ในแต่ละหมวด
- admin เข้า Settings > Solutions เพื่อจัด catalog solution default ได้แก่ Chatbot, Voicebot, Digital Human, CMS และ DocSearch
- result จาก Senario, recording review หรือ audio response อัปเดต onboarding progress ได้
- เมื่อ Senario ที่ผูกไว้ complete และ score ผ่าน threshold ระบบ mark topic เป็น completed และอัปเดต badge percent

### Feature G: User, Role และ Sales Profile Management

admin ต้องจัดการข้อมูลผู้ใช้และ sales profile ได้ เพื่อให้ sales, manager และ admin ใช้งานระบบตามสิทธิ์

Requirements:

- สร้าง/แก้ไข/deactivate user ได้
- กำหนด role เป็น `sales`, `manager`, `admin`
- ผูก sales กับ team และ manager ได้
- เก็บ product line, region, language และ readiness status ได้
- manager เห็นเฉพาะ sales ในทีมของตัวเอง

Acceptance criteria:

- sales เห็นเฉพาะข้อมูลของตัวเอง
- manager เห็นข้อมูลของทีม
- admin จัดการ user, role และ team ได้
- action สำคัญถูกเก็บ audit log

## 7. MVP User Flow Summary

| Flow | Summary |
|---|---|
| Quality Review Engine | Sales/Manager สร้าง batch -> เพิ่มไฟล์เสียงหรือเอกสาร/บทความ -> เลือก guidance -> run batch แบบ async ทีละ item -> กดเข้า batch detail เพื่อดู progress/result รายไฟล์ -> manager review/override |
| Recording Review Training | Sales upload pitch/mock call -> ระบบประเมิน training rubric -> feedback ถูกบันทึกเข้า onboarding |
| Voice Senario | Sales เลือก persona หรือ Meeting Room -> คุยเสียงกับ AI ผ่าน WSS/Botnoi -> ระบบสรุป score และ coaching |
| Playbook Q&A | Sales ถามคำถาม -> ระบบค้น Playbook Section ที่ approved -> ตอบพร้อม citation หรือ abstain |
| Onboarding Tracking | Sales ทำ track/topic/training -> progress update -> badge unlock -> manager sign-off readiness |

## 8. MVP Priority

| Priority | Feature | เหตุผล |
|---|---|---|
| P0 | Quality Review Engine | แก้ pain เรื่อง manager ฟัง/อ่านตรวจไม่ครบ, feedback ช้า, claim เสี่ยง และมาตรฐาน content ไม่สม่ำเสมอ |
| P0 | Scorecard Template และ Evidence | ทำให้มาตรฐานองค์กรวัดได้ ไม่ใช่ความเห็นลอย ๆ |
| P0 | Mock Frontend + Mock API Contract | ลดงานซ้อน frontend/backend และทำ UX validation เร็ว |
| P1 | Playbook Section + Guided Q&A | ลดการเรียนรู้นานและ source กระจัดกระจาย |
| P1 | Recording Review Training | ให้ sales ฝึกเองและเห็น feedback ก่อนเจอลูกค้าจริง |
| P1 | Manager Review/Override | เพิ่ม trust และกัน scoring ผิดจาก AI |
| P2 | Voice Senario | เพิ่ม realism ใน training แต่ต้องควบคุม latency |
| P2 | Onboarding Tracker | รวม signal เป็น readiness view |
| P3 | PBX/CRM integration | หลัง MVP/pilot เมื่อ workflow หลัก validate แล้ว |

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | RBAC, audit log, encrypted secrets, least privilege |
| Privacy | retention policy, PII redaction, consent/notice text |
| Reliability | job retry สำหรับ ASR, graceful WSS reconnect |
| System Performance | upload ไม่ block UI, Senario latency ต้องไม่ทำให้ conversation flow เสีย |
| Observability | log processing job, ASR/TTS errors, WSS session events |
| Maintainability | module structure ชัดเจนทั้ง frontend และ backend |

## 10. MVP Exclusions

- ไม่เชื่อม PBX/CTI/CCaaS
- ไม่ทำ real-time copilot ระหว่างสายจริง
- ไม่เป็น HRM และไม่เก็บข้อมูล HR ที่ไม่จำเป็นต่อ sales coaching
- ไม่ให้ AI ตัดสินผลการทำงานบุคลากรแบบ HRM หรือใช้เป็น final performance appraisal
- ไม่ตอบจาก open web เป็น source หลัก
- ไม่ sync CRM อัตโนมัติใน MVP

## 11. Success Metrics

| Area | Metric |
|---|---|
| Upload Quality | processing success rate, time to score, override rate |
| Training | repeated usage per sales, completed sessions |
| Voice Senario | session completion rate, ASR/TTS latency, drop rate |
| Q&A | citation correctness, abstention quality, answer usefulness |
| Onboarding | track completion rate, topic completion rate, badge unlock rate, time to readiness |
| Manager Adoption | dashboard weekly active usage, coaching task completion |

## 12. Business Success Metrics

| Metric | Direction |
|---|---|
| Time to first qualified sales conversation | ลดลง |
| Time to readiness sign-off | ลดลง |
| Manager manual review hours per week | ลดลง |
| Repeated mistake rate จาก scorecard item เดิม | ลดลง |
| Sales training completion rate | เพิ่มขึ้น |
| Customer calls ที่ผ่านมาตรฐาน minimum score | เพิ่มขึ้น |
| Playbook unanswered question rate | ลดลง |
