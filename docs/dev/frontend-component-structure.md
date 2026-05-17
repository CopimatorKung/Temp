# Frontend Component Structure

## 1. Frontend Goal

Frontend ของ Pitchsmith ต้องรองรับ 4 งานหลัก:

- upload ไฟล์เสียงหรือ document batch และดูผลวิเคราะห์
- ถามตอบ Playbook พร้อม citation
- ฝึก recording review และ voice Senario
- ติดตาม onboarding progress และ manager review

Stack ที่ใช้:

- React
- Deno 2.x สำหรับ frontend task runner และ package workflow
- React Router
- path-to-regexp สำหรับ route path builder และ dynamic path generation
- Tailwind CSS
- shadcn/ui
- Zustand
- radash สำหรับ utility helper ที่ type-friendly
- zod เป็น schema validation หลักใน frontend API/mock contract layer
- react-icons สำหรับ icon ใน mock/frontend product UI
- Tiptap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/markdown`) สำหรับ Knowledge Markdown editor และ markdown serialization
- React Portal สำหรับ modal, drawer, confirmation dialog และ overlay
- WSS client สำหรับ voice Senario

Frontend commands:

```bash
cd frontend
deno install
deno task dev --host 127.0.0.1 --port 5173
deno task lint
deno task build
```

Rules:

- ใช้ `deno.json` เป็น source of truth สำหรับ frontend tasks
- ใช้ `deno.lock` เป็น dependency lockfile
- ไม่ใช้ `npm run` เป็น workflow หลัก
- `package.json` ยังเก็บ dependency metadata สำหรับ npm package ecosystem ที่ Vite/React/Tailwind ใช้ผ่าน Deno npm compatibility

## 2. UI Theme Source

ใช้ [ui_color_theme.json](./ui_color_theme.json) เป็น source of truth สำหรับ visual theme ของโปรเจกต์

Theme ปัจจุบันคือ **Morphous Juniper Berry** โดยมี reference assets:

| Theme Asset | ใช้เพื่อ |
|---|---|
| `transparent-motif` | motif หลักของแบรนด์และ visual reference |
| `light-design-system` | reference สำหรับ light mode components, palette, dashboard และ form |
| `dark-design-system` | reference สำหรับ dark mode components, palette, dashboard และ form |

Implementation rules:

- ใช้โทน lichen mist, alpine ink, berry bloom blue, needle green, blue bloom wash, bark grey และ evergreen night ตาม theme reference
- ห้ามสร้าง palette ใหม่ที่ไม่อิง `ui_color_theme.json`
- Tailwind tokens และ shadcn/ui CSS variables ต้อง derive จาก theme นี้
- primary action ควรใช้ berry bloom blue ใน light mode และ needle green/berry bloom ใน dark mode ตาม contrast
- success/focus state ใช้ needle green หรือ accent focus ring
- surface ใช้ lichen mist/blue bloom wash ใน light mode และ evergreen night/dark juniper surface ใน dark mode
- border, shadow และ radius ต้องคงแนว premium product system, radius หลัก 8px
- current implementation ใช้ `src/styles/globals.css` สำหรับ light/dark CSS variables, `dark` class บน `<html>`, และ `pitchsmith-theme` ใน `localStorage`
- Settings > Theme ต้องเปลี่ยน theme ได้จริงทั้งแอป ไม่ใช่เป็น mock state เฉพาะหน้า

Suggested semantic token names:

```text
--background
--foreground
--card
--card-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--success
--warning
--destructive
--border
--input
--ring
```

## 3. Route Structure

```text
/
  /login
  /dashboard
  /audio
    /new
    /:submissionId
  /training
    /ask
    /ask/:sessionId
    /recording-review
    /recording-review/:batchId
    /rubrics/:rubricId
    /voice-roleplay
    /sessions/:sessionId
  /onboarding
    /me
    /track/:trackId
    /track-management/:trackId
  /playbooks
    /:playbookId
    /sections/:sectionId
  /admin
    /users
    /scorecards
    /rules
    /settings
    /settings/theme
    /settings/track-categories
    /settings/solutions
```

## 4. Folder Structure

```text
src/
  app/
    routes/
    providers/
    routes.ts
    router.tsx
  components/
    ui/                         # shadcn/ui generated components
    layout/
      AppShell.tsx
      SidebarNav.tsx
      TopBar.tsx
      PageHeader.tsx
    data-display/
      StatusBadge.tsx
      ScoreBadge.tsx
      EmptyState.tsx
      ErrorState.tsx
      LoadingBlock.tsx
    audio/
      AudioUploader.tsx
      AudioRecorder.tsx
      AudioPlayer.tsx
      WaveformTimeline.tsx
      TranscriptViewer.tsx
      TranscriptUtterance.tsx
    documents/
      DocumentUploader.tsx
      DocumentPreview.tsx
      DocumentEvidenceBlock.tsx
    scorecard/
      ScorecardSummary.tsx
      ScorecardItem.tsx
      EvidenceDrawer.tsx
      OverrideScoreDialog.tsx
      TemplateEditor.tsx
      TemplateSectionCard.tsx
      TemplateRuleCard.tsx
    training/
      PersonaSelector.tsx
      ScenarioSelector.tsx
      VoiceSessionPanel.tsx
      RoleplayTranscript.tsx
      TtsPlaybackBar.tsx
      TrainingResultPanel.tsx
    playbooks/
      AskSessionList.tsx
      AskChatThread.tsx
      AskComposer.tsx
      CitationList.tsx
      SourcePreview.tsx
      KnowledgeBookTree.tsx
      KnowledgeCategoryGrid.tsx
      KnowledgeMarkdownEditor.tsx
      KnowledgeImportQueue.tsx
      KnowledgeFavoriteList.tsx
      PlaybookTable.tsx
      PlaybookSectionEditor.tsx
      KnowledgeManagementPanel.tsx
    onboarding/
      OnboardingTabs.tsx
      TrackLibrary.tsx
      TrackCard.tsx
      TrackDetail.tsx
      TrackTopicCard.tsx
      TrackManagementTable.tsx
      TrackEditor.tsx
      BadgeLibrary.tsx
      BadgeCard.tsx
      ManagerSignoffDialog.tsx
  features/
    audio-submissions/
      api.ts
      hooks.ts
      store.ts
      types.ts
      pages/
    training/
      api.ts
      voice-session.store.ts
      ws-client.ts
      types.ts
      pages/
    playbooks/
    onboarding/
    scorecards/
    admin/
  lib/
    api-client.ts
    ws.ts
    auth.ts
    schemas.ts
    format.ts
    errors.ts
  styles/
    globals.css
```

Track editor note:
- `TrackEditor` ต้องแสดง `sortIndex`/`Index` ในแต่ละ topic เพื่อให้ manager/admin reorder topic หลังสร้างแล้วได้ โดย backend จะเรียงตาม `onboarding_track_topics.sort_index`.

## 5. Component Standards

### 5.1 Component Types

| Type | Rule |
|---|---|
| Page | อยู่ใน `features/*/pages`, รวม layout ของหน้าและ data hooks |
| Feature Component | อยู่ใน `components/{domain}`, มี business context ได้ |
| Shared UI | อยู่ใน `components/ui` หรือ `components/data-display`, ห้ามรู้ business logic |
| Dialog/Drawer | ใช้ shadcn/ui `Dialog`, `Sheet`, `Drawer` หรือ React Portal ตามความเหมาะสม |
| Form | ใช้ controlled form และ validation schema |

### 5.2 Naming

- Component: `PascalCase.tsx`
- Hook: `useThing.ts`
- Store: `thing.store.ts`
- API client: `api.ts`
- Type: `types.ts`
- Page: `ThingPage.tsx`

### 5.2.1 Icon Standard

- ใช้ `react-icons` เป็น icon library หลักของ frontend mock และ product UI
- import เฉพาะ icon ที่ใช้จริง เช่น `react-icons/fi`, `react-icons/hi2`, `react-icons/tb`
- icon button ต้องมี accessible label หรือ tooltip
- ห้ามใช้ icon เพื่อแทน action ที่เสี่ยงต่อความเข้าใจผิดโดยไม่มี label เช่น override, delete, approve
- ถ้าใช้ icon library อื่นอยู่ในไฟล์เดิม ให้ค่อย ๆ migrate เมื่อแตะ component นั้น ไม่ต้อง refactor ทั้งโปรเจกต์พร้อมกัน

### 5.2.2 Knowledge Page Standard

หน้า `Knowledge` ใช้สำหรับบริหาร approved source ของ Ask, Senario และ RAG จึงต้องแยก component ให้เล็ก ไม่รวม editor/tree/import/favorite ไว้ในไฟล์เดียวเมื่อเริ่มต่อ backend จริง

Required UI pieces:

- `KnowledgeCategoryGrid`: filter category เช่น product documentation, sales playbook, market intelligence, internal process, battlecard
- `KnowledgeBookTree`: แสดง hierarchy `book -> chapter -> topic -> page` และเลือก page เพื่อแก้ไข
- `KnowledgeMarkdownEditor`: Tiptap-based controlled editor ที่ใช้ `@tiptap/markdown` เพื่อ serialize กลับเป็น Markdown source พร้อม preview และ metadata ของ page
- `KnowledgeImportQueue`: upload/import status สำหรับ `.pdf`, `.csv`, `.xlsx`, `.md`, `.doc`, `.docx`, `.txt`
- `KnowledgeFavoriteList`: แสดง bookmark/favorite จาก Senario session เพื่อให้ user กลับมาอ่านต่อใน Knowledge
- `RagSyncStatus`: แสดง Turso BM25, Kotaemon pipeline และ LEANN local index status โดยไม่ให้ frontend เรียก provider โดยตรง

Interaction rules:

- การ upload resource ต้องเป็น import job ก่อน จากนั้น user map เข้า book/chapter/topic/page แล้วค่อย publish/index
- Markdown page เป็น source of truth ฝั่ง UI ส่วน extracted text จากไฟล์เป็น artifact ที่อ้างอิงกลับ page
- editor ต้องเก็บ source เป็น Markdown ผ่าน Tiptap Markdown serializer ไม่ใช่ HTML-only content
- favorite จาก Senario ต้อง persist เป็น user knowledge bookmark และแสดงเป็น read-later list
- Citation link จาก Ask/Senario ต้องเปิดกลับมายัง page เดิม ไม่ใช่ raw vector chunk

### 5.2.2 Modal และ React Portal Standard

- อนุญาตให้ใช้ React Portal ผ่าน `createPortal` จาก `react-dom` สำหรับ modal, drawer, command palette, confirmation dialog, toast และ overlay
- สร้าง shared component เช่น `components/ui/Portal.tsx`, `Modal.tsx`, `Drawer.tsx` เมื่อเริ่มมี modal มากกว่า 1 จุด
- modal root ควรอยู่ที่ `document.body` หรือ `#modal-root` ใน `index.html`
- modal ต้องจัดการ focus, `Escape` close, backdrop click policy, scroll lock และ `aria-modal`
- modal overlay ต้องใช้ backdrop blur เช่น `backdrop-blur-sm` และ overlay opacity ที่ไม่เข้มเกินไป เพื่อให้ผู้ใช้ focus กับ modal โดยไม่ถูก background distract
- modal content ต้องใช้ color token จาก theme เช่น `bg-card`, `bg-background`, `bg-primary`, `bg-secondary`, `text-foreground` ห้าม hardcode สีเฉพาะ feature ยกเว้นมี design token รองรับแล้ว
- action ที่กระทบ score, override, delete, publish หรือ expire ต้องใช้ confirmation modal พร้อม label ชัดเจน
- business logic ห้ามอยู่ใน portal component ให้ส่งผ่าน props/callback จาก feature layer

### 5.2.3 Routing และ Validation Standard

- ใช้ React Router สำหรับ page routing และ nested routes
- ใช้ `path-to-regexp` สำหรับ build path ที่มี params เช่น `/audio/:submissionId` เพื่อเลี่ยง hardcode string หลายจุด
- เก็บ route constants ไว้ที่ `src/app/routes.ts`
- ใช้ `zod` validate request/response payload ใน mock API และ API client layer
- schema ที่ใช้ร่วมกับ backend contract ควรอยู่ใกล้ feature เช่น `features/audio-submissions/schemas.ts` หรือ shared ที่ `lib/schemas.ts`
- ถ้าต้องเปลี่ยนไปใช้ `arktype` ภายหลัง ให้เปลี่ยนผ่าน schema boundary เดียว ไม่กระจาย validation logic ใน component

### 5.2.4 Feature Slice และ File Size Budget

เพื่อป้องกันปัญหาไฟล์ page ใหญ่หลายพันบรรทัด ให้ frontend ใช้ feature slice เป็นค่าเริ่มต้น:

```text
features/{domain}/
  pages/
    ThingPage.tsx              # orchestration เท่านั้น
  {feature-name}/
    components/
      ThingCards.tsx
      ThingTabs.tsx
      ThingModal.tsx
      ThingDetailModal.tsx
      ThingViews.tsx
      Visuals.tsx
    constants.ts
    mock-data.ts
    types.ts
    utils.ts
```

Rules:

- `Page.tsx` ควรทำหน้าที่ route/page orchestration, state wiring และ callback composition เท่านั้น
- component ที่ render UI ซ้ำหรือมี layout หนา ต้องย้ายเข้า `components/`
- mock data แยกไป `mock-data.ts`
- domain type แยกไป `types.ts`
- pure helper แยกไป `utils.ts`
- constants เช่น label, tab config, status meta แยกไป `constants.ts`
- modal หนึ่ง behavior ต่อหนึ่งไฟล์ เช่น `PersonaModal.tsx`, `PersonaSelectModal.tsx`, `SessionDetailModal.tsx`
- ถ้าต้อง backward-compatible import ให้ทำ barrel file เช่น `RoleplayModals.tsx` ที่ export ต่อจากไฟล์ย่อย

Suggested file size budget:

| File type | Target |
|---|---:|
| Page orchestration | ไม่เกิน 400 บรรทัด |
| Feature component | ไม่เกิน 300 บรรทัด |
| Modal/Dialog | ไม่เกิน 180 บรรทัด |
| Mock data | ไม่เกิน 250 บรรทัดต่อ feature |
| Shared UI primitive | ไม่เกิน 150 บรรทัด |

ถ้าไฟล์เกิน target ให้ถือว่าเป็น refactor candidate ก่อนเพิ่ม feature ใหม่ โดยเฉพาะหน้าที่มีหลาย mode เช่น quality batch, recording batch และ voice Senario.

Current reference implementation:

- `features/training/pages/VoiceRoleplayPage.tsx` เป็น page orchestration
- `features/training/voice-roleplay/types.ts` เก็บ domain type
- `features/training/voice-roleplay/mock-data.ts` เก็บ mock session/persona/group
- `features/training/voice-roleplay/components/` แยก cards, tabs, modal, live session view, summary view และ visual chart
- Product-facing label ของ module นี้คือ **Senario** แต่ route/code path ปัจจุบันยังใช้ `voice-roleplay` / `VoiceRoleplayPage.tsx` เพื่อเลี่ยง migration ใหญ่โดยไม่จำเป็น

### 5.2.4 Template Editor Standard

- Template editor แสดง section และ rule เป็น read-only cards เป็นค่าเริ่มต้น เพื่อป้องกันการแก้ rubric โดยไม่ตั้งใจ
- ทุก section และ rule ต้องพับ/ขยายได้ และต้องรองรับ `Expand all` / `Collapse all`
- Header action สำหรับ `Expand all`, `Collapse all`, `Preview`, `Save draft` ต้องมี tooltip ที่อธิบายผลของปุ่ม และใช้ icon ที่สื่อความหมายชัดเจน
- `Preview` ต้องเปิด modal report เพื่อสรุปว่า template นี้จะประเมิน source, section, rule, weight และ high-risk rule อะไรบ้าง ก่อนใช้งานกับ batch จริง
- Section และ rule ต้องมี `sortOrder` หรือ `sortIndex` ที่ผู้ใช้มองเห็นได้ เพื่อจัดลำดับการแสดงผลและลำดับ scoring
- Rule card ต้องแสดง `expectedEvidence` และ `example` เพื่อช่วย reviewer เข้าใจว่า evidence แบบไหนควรผ่าน rule
- List view ไม่ควรแสดง edit/delete icon โดยตรง การแก้โครงสร้างควรแยกเป็น explicit edit mode หรือ action เฉพาะ

### 5.3 Required UI States

ทุกหน้าและ component ที่โหลดข้อมูลต้องมี:

- loading
- empty
- error
- success
- permission denied ถ้า role ไม่พอ

### 5.4 Audio UI Standard

Audio feature ต้องมี component กลาง:

- `AudioUploader`: drag/drop, file validation, upload progress
- `AudioRecorder`: record in browser สำหรับ pitch practice
- `AudioPlayer`: play/pause, seek, playback speed
- `TranscriptViewer`: utterance list พร้อม timestamp
- `WaveformTimeline`: optional หลัง MVP ถ้าต้องการ precise review

### 5.4.1 Recording Review UI Standard

Recording Review ต้องใช้ batch-first UI เหมือน Quality Review เพื่อให้ sales และ manager เปรียบเทียบพัฒนาการได้ง่าย

- หน้า list `/training/recording-review` แสดง `Review Batches` เป็น table ไม่ใช่ card list ยาว
- ปุ่ม `New batch` เปิด modal ผ่าน React Portal ให้กำหนด batch name, training rubric และ input mode
- input mode ต้องมี 2 แบบ:
  - `browser_recording`: กดอัดเสียงใน browser แล้วสร้าง attempt
  - `audio_upload`: upload ไฟล์เสียงที่มีอยู่แล้ว
- หน้า detail `/training/recording-review/:batchId` แสดง attempt table, latest score, improvement และ trend chart/side summary
- หน้า detail ต้องมี action สำหรับ rename batch เพราะ sales/manager อาจต้องแก้ชื่อรอบฝึกให้ตรง scenario จริง
- หน้า detail ต้องมี action สำหรับเพิ่ม attempt ใหม่ใน batch เดิม ได้แก่ `Record attempt` และ `Upload audio`
- `Record attempt` ต้องเปิด recorder modal ก่อนสร้าง attempt โดย modal ควรมี timer, live microphone input meter, pause/resume และ stop; input meter ต้องขยับตามระดับเสียงจริงเพื่อให้ user รู้ว่าเสียงเข้าและลดความเสี่ยงพูดจนจบแต่ไม่ได้ record
- เมื่อกด stop ให้ save recording เป็น draft ก่อนและถามว่าจะส่งเข้า ASR queue เลยหรือไม่ เพื่อป้องกัน cost จาก recording ที่ user ไม่ต้องการใช้
- recorder modal ต้องใช้ theme color เดียวกับเว็บ เช่น primary waveform/cursor, secondary pause button และ primary stop button แทนสีแดง/สี hardcoded
- attempt row ต้องคลิกได้เพื่อเปิด review modal ดู audio playback, ASR transcript, speaker label และ timestamp
- ASR transcript ใน modal ควรแสดงแบบ SRT/timeline style โดยอย่างน้อยมี `start`, `end`, `speaker`, `text` และปุ่ม play segment mock
- ASR transcript segment ต้องแก้ไขข้อความได้ใน modal เพราะ ASR อาจถอดผิด และ segment ที่ถูกแก้ต้องแสดง `edited` indicator ให้เห็นทันที
- batch detail ต้องไม่แสดง result ทั้งหมดในหน้า list เพราะจะใช้พื้นที่เกินจำเป็น
- Training Rubric Management ใช้ table + validation tests pattern เดียวกับ Quality Template Management แต่ label เป็น `Rubric`
- Training Rubric Management ต้องมี 2 tabs คือ `Training Rubrics` และ `Rubric Validation`
- คลิก row ใน Training Rubrics table ต้อง route ไป `/training/rubrics/:rubricId` เพื่อแก้ rubric
- attempt ต้องมี `sortOrder` เพื่อคุมลำดับครั้งที่ 1, 2, 3
- UI ต้องรองรับไฟล์ `.mp3`, `.wav`, `.m4a`, `.webm`

### 5.5 Voice Senario UI Standard

Voice Senario ต้องแยก state ชัดเจน:

- `idle`
- `connecting`
- `ready`
- `listening`
- `thinking`
- `speaking`
- `ended`
- `error`

UI ต้องแสดง:

- overview ของ Voice Senario ต้องแยกเป็น 3 tabs คือ `Session History`, `Persona Management` และ `Meeting Room` ไม่รวม session history, radar, persona editor และ meeting room preset ไว้ใน view เดียวกัน
- `Session History` แสดง past sessions, latest outcome, summary stats และ radar comparison
- past session card ต้องคลิกเพื่อเปิด session detail ได้ โดยแสดง participants, score, radar comparison, strengths และ growth items
- session detail ต้องมี tabs อย่างน้อย `Info`, `Conversation` และ `Knowledge Acquired`
- `Knowledge Acquired` แสดงว่า session นี้ user ได้เรียนรู้เรื่องอะไร, มี Playbook/Guardrail/FAQ/Case Study ใดอ่านต่อเพื่ออ้างอิง และสามารถกด favorite source ไว้ดูภายหลังในหน้า Knowledge ได้
- favorite ใน `Knowledge Acquired` เป็น user-level bookmark ไม่ใช่การแก้ Playbook source และต้อง sync กับ backend เมื่อมี API จริง
- `Persona Management` แสดง persona selector/manager เป็น card grid ที่มี circular avatar, difficulty badge, trait tags และ CTA เลือกหรือแก้ persona
- Meeting Room ต้องรองรับ preset เช่น `2 managers + 1 technical team` เพื่อเริ่ม session แบบหลาย stakeholder
- `Start session` ต้องเปิด modal เพื่อเลือกว่าจะเริ่มจาก persona หรือ Meeting Room ก่อนเริ่ม session ไม่ควรเริ่มจาก persona ที่ซ่อนอยู่โดยไม่ยืนยัน
- Start session modal ต้องรองรับ 3 แบบ: shuffle/random persona, เลือกหลาย persona เอง และ start จาก Meeting Room preset
- หลังเลือก persona ต้องเข้าสู่ live session view ที่แสดง persona context, trust/objection signal, conversation log, hold-to-speak control, text fallback และ end session action
- live session view ต้องรองรับ multi-persona context และแสดง participants ของ session นั้น
- เมื่อจบ session ต้องแสดง summary view พร้อม total score, competency breakdown, strengths, opportunities for growth และบันทึก session เข้า history
- session history ต้องเก็บ competency score เพื่อทำ radar chart เปรียบเทียบ session ล่าสุดกับ session ก่อนหน้า
- persona management สำหรับ create/edit persona โดย manager/admin และใช้ modal หรือ detail page ที่แยก read/edit state ชัดเจน
- past session summary เป็น card/table สั้น ๆ แสดง persona, scenario, duration, score, turn count และ coaching outcome
- persona และ scenario ปัจจุบัน
- microphone status
- partial transcript
- final transcript
- AI response text
- TTS playback status
- reconnect หรือ end session action

## 6. Zustand Store Standard

```ts
type VoiceSessionState = {
  sessionId?: string;
  status: 'idle' | 'connecting' | 'ready' | 'listening' | 'thinking' | 'speaking' | 'ended' | 'error';
  turns: VoiceTurn[];
  error?: string;
  startSession: (input: StartSessionInput) => Promise<void>;
  sendAudioChunk: (chunk: Blob) => void;
  endSession: () => Promise<void>;
};
```

Rules:

- server state ใช้ API hooks หรือ query layer
- realtime local state ใช้ Zustand
- อย่าเก็บ raw audio ใหญ่ใน store
- clear store เมื่อออกจาก session

## 7. shadcn/ui Usage

ใช้ shadcn/ui เป็น component primitive หลัก:

- `Button`, `Input`, `Textarea`, `Select`
- `Table`, `Badge`, `Card`, `Tabs`
- `Dialog`, `Sheet`, `DropdownMenu`
- `Progress`, `Alert`, `Toast`
- `Form`

Card ใช้กับ item หรือ panel เท่านั้น ไม่ควรซ้อน card ใน card โดยไม่จำเป็น

## 8. Frontend Acceptance Criteria

- route สำคัญมี loading/empty/error state
- quality review batch list/detail ต้องแยกกันชัดเจน
- batch list แสดง summary เท่านั้น ส่วน per-file process/result ต้องอยู่ใน batch detail
- audio/document upload validate file type และ size ก่อนส่ง
- scorecard item เปิด evidence ได้
- voice Senario disconnect แล้วแสดง retry/end session
- UI บน mobile ไม่บีบปุ่มหรือข้อความจนอ่านไม่ได้
- component domain ไม่เรียก API ตรงถ้า API wrapper มีอยู่แล้ว
- สีและ CSS variables ต้องอิง [ui_color_theme.json](./ui_color_theme.json)
