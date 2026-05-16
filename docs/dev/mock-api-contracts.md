# Mock API Contracts

เอกสารนี้ใช้เป็น contract-first source สำหรับให้ frontend ทำ mock UI ได้ก่อน backend เสร็จ และลดปัญหาแก้ไปแก้มาเพราะ API ขาด field

## 1. Mock-First Rule

- ทุก module ต้องมี mock contract ก่อนเริ่มทำ frontend
- frontend ใช้ mock response shape เดียวกับ backend response จริง
- backend ต้อง implement ให้ตรง contract หรือเปิด change request ก่อนเปลี่ยน shape
- mock ต้องครอบคลุม loading, empty, success, validation error, permission error และ processing error
- frontend ห้าม hardcode field ที่ไม่มีใน contract

## 2. Mock Folder Standard

```text
src/
  features/
    audio-submissions/
      api.ts
      mock-api.ts
      mock-data.ts
      types.ts
      pages/
```

Suggested switch:

```ts
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const audioSubmissionApi = USE_MOCK_API
  ? mockAudioSubmissionApi
  : realAudioSubmissionApi;
```

## 3. Shared Response Shape

```ts
type ApiResponse<T> = {
  data: T;
  meta?: {
    requestId: string;
    generatedAt: string;
  };
};

type ApiError = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
    retryable?: boolean;
  };
};
```

## 4. Module 1: Quality Review Engine

Module 1 ไม่จำกัดแค่เสียง แต่เป็น review engine สำหรับตรวจ input หลายแบบด้วย rubric/scorecard เฉพาะ use case:

- `audio`: call recording, pitch recording, mock call
- `document`: sales script, FAQ answer, article draft, landing page copy จากไฟล์ `.md`, `.txt`, `.doc`, `.docx`
- `article`: SEO content, product article, promotion article

ตัวอย่าง rubric:

- sales call standard
- SEO Organizer
- prohibited answer
- legal claim / advertising compliance
- promotion condition completeness

เป้าหมายของ module นี้คือให้ sales/manager สร้าง review batch แล้วเพิ่มไฟล์เสียงหรือเอกสารหลายรายการ จากนั้นเลือก guidance/scorecard template และให้ backend process แบบ async ทีละ item ใน batch โดยมาตรฐานการให้คะแนนเปลี่ยนได้ตาม:

- sales topic เช่น product pitch, promotion pitch, competitor handling, compliance call
- customer segment เช่น SME, enterprise, healthcare, retail
- product line
- region/language

### 4.1 UI Screens ที่ frontend mock ได้ทันที

| Screen | Route | Mock Data ที่ต้องมี |
|---|---|---|
| Batch List / Create Batch | `/app/audio/new` | review batches, scorecard templates, products, customer segments, topics, input type |
| Batch Detail | `/app/audio/batches/:batchId` หรือ drawer/detail state | batch items, per-item processing status, transcript/document evidence, scorecard result |
| Evidence Review | drawer/modal | score item, transcript timestamps, audio segment |
| Manager Override | dialog | score item, override reason, audit preview |
| Team Review List | `/dashboard` หรือ `/audio` | batch list, risk filters, score summary |

### 4.2 API Contract Summary

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/quality-scorecards/templates` | list scorecard templates by filters |
| `POST` | `/quality-review-batches` | create review batch metadata and selected guidance |
| `POST` | `/quality-review-batches/:id/items` | add one or more audio/document/article items to batch |
| `POST` | `/quality-review-batches/:id/run` | enqueue async sequential processing for items in batch |
| `GET` | `/quality-review-batches` | list batches with summary status |
| `GET` | `/quality-review-batches/:id` | get batch detail and item statuses |
| `POST` | `/audio-submissions` | create audio submission metadata |
| `POST` | `/audio-submissions/:id/file` | upload audio file |
| `POST` | `/audio-submissions/:id/process` | start processing |
| `GET` | `/audio-submissions/:id` | get submission detail |
| `GET` | `/audio-submissions/:id/transcript` | get transcript |
| `GET` | `/audio-submissions/:id/scorecard` | get scorecard result |
| `PATCH` | `/scorecard-results/:id/override` | manager override |

### 4.2.1 Scorecard Template Ordering Contract

Template management ต้องแยก section และ rule เป็นรายการที่จัดลำดับได้ เพื่อให้ UI แสดงผลและ backend scoring ใช้ลำดับเดียวกันเสมอ:

| Field | Scope | Required | Purpose |
|---|---|---:|---|
| `sortOrder` | section, rule | yes | ลำดับการแสดงผลและลำดับ scoring ภายใน template version |
| `example` | rule | recommended | ตัวอย่างคำพูด/ข้อความที่ผ่านหรือควรถูกจับตาม rule นั้น ใช้ช่วย reviewer และ validation test |
| `expectedEvidence` | rule | yes | evidence ที่ระบบควรหาใน transcript/document |

UI mock เปิด rule/section เป็น read-only เป็น default และไม่แสดง edit/delete icon ใน list view การแก้ไขเชิงโครงสร้างควรทำผ่าน action เฉพาะ เช่น add section/rule หรือ dedicated edit mode ภายหลัง

## 4.3 Batch Processing Rule

- Batch เป็น parent ของ quality review work
- Batch ต้องมี `scorecardTemplateId` หรือ guidance ก่อน run
- Batch item รองรับ `audio`, `document`, `article`
- Document item ต้องรองรับไฟล์ `.md`, `.txt`, `.doc`, `.docx` ใน MVP
- Document processing ต้อง extract/normalize text ก่อน scoring และเก็บ `normalizedTextUri` หรือ `extractedText` สำหรับ evidence/debug
- Backend process item แบบ FIFO ภายใน batch เพื่อคุม ASR/TTS/LLM/provider quota และทำ retry ง่าย
- Frontend list page แสดง batch summary เท่านั้น
- ผู้ใช้ต้องกดเข้า batch detail ก่อนจึงเห็น process/result ของแต่ละ item
- Batch status: `draft`, `queued`, `processing`, `completed`, `failed`, `partial_failed`
- Batch item status: `queued`, `processing`, `transcribed`, `scored`, `failed`

## 4.4 Batch Contract

### `POST /quality-review-batches`

Request:

```json
{
  "title": "Pitch โปร Q2 Batch",
  "sourceType": "audio",
  "scorecardTemplateId": "sct-promotion-sme-th-v1",
  "topic": "promotion_pitch",
  "customerSegment": "sme",
  "product": "product-a",
  "region": "th",
  "language": "th",
  "notes": "batch สำหรับตรวจไฟล์เสียง training"
}
```

Response:

```json
{
  "data": {
    "id": "qrb_001",
    "status": "draft",
    "title": "Pitch โปร Q2 Batch",
    "sourceType": "audio",
    "scorecardTemplateId": "sct-promotion-sme-th-v1",
    "totalItems": 0,
    "completedItems": 0,
    "failedItems": 0,
    "createdAt": "2026-05-16T10:00:00Z"
  }
}
```

### `POST /quality-review-batches/:id/items`

Request:

```json
{
  "items": [
    { "sourceType": "audio", "fileName": "mock-call-01.webm", "mimeType": "audio/webm", "storageUri": "s3://bucket/mock-call-01.webm" },
    { "sourceType": "audio", "fileName": "mock-call-02.m4a", "mimeType": "audio/mp4", "storageUri": "s3://bucket/mock-call-02.m4a" }
  ]
}
```

Document batch example:

```json
{
  "items": [
    { "sourceType": "document", "fileName": "product-a-seo-article.md", "mimeType": "text/markdown", "storageUri": "s3://bucket/product-a-seo-article.md" },
    { "sourceType": "document", "fileName": "q2-promotion-faq.docx", "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "storageUri": "s3://bucket/q2-promotion-faq.docx" },
    { "sourceType": "document", "fileName": "sales-script-objection.doc", "mimeType": "application/msword", "storageUri": "s3://bucket/sales-script-objection.doc" },
    { "sourceType": "document", "fileName": "landing-page-copy.txt", "mimeType": "text/plain", "storageUri": "s3://bucket/landing-page-copy.txt" }
  ]
}
```

Response:

```json
{
  "data": {
    "batchId": "qrb_001",
    "items": [
      { "id": "qrbi_001", "sourceType": "audio", "status": "queued", "fileName": "mock-call-01.webm", "mimeType": "audio/webm" },
      { "id": "qrbi_002", "sourceType": "audio", "status": "queued", "fileName": "mock-call-02.m4a", "mimeType": "audio/mp4" }
    ]
  }
}
```

Document response หลัง extraction สำเร็จใน worker ต้องเติม `normalizedTextUri` ใน item detail:

```json
{
  "id": "qrbi_003",
  "sourceType": "document",
  "status": "scored",
  "fileName": "product-a-seo-article.md",
  "mimeType": "text/markdown",
  "storageUri": "s3://bucket/product-a-seo-article.md",
  "normalizedTextUri": "s3://bucket/normalized/product-a-seo-article.txt",
  "score": 82
}
```

### 4.4.1 Supported Batch Item Formats

| Source type | Extensions | MIME examples | Processing |
|---|---|---|---|
| `audio` | `.mp3`, `.wav`, `.m4a`, `.webm` | `audio/mpeg`, `audio/wav`, `audio/mp4`, `audio/webm` | ส่งเข้า Botnoi ASR แล้ว scoring จาก transcript |
| `document` | `.md`, `.txt`, `.doc`, `.docx` | `text/markdown`, `text/plain`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | extract/normalize text แล้ว scoring จาก document evidence spans |
| `article` | `.md`, `.txt`, `.doc`, `.docx` หรือ direct text payload | เหมือน document | ใช้ flow เดียวกับ document แต่ template/rubric อาจเป็น SEO/legal claim |

Validation:

- reject unsupported extension/MIME ด้วย `422 VALIDATION_ERROR`
- reject empty extracted text ด้วย `422 EMPTY_DOCUMENT_TEXT`
- เก็บ `fileName`, `mimeType`, `fileSizeBytes`, `storageUri`, `normalizedTextUri`, `sourceType`
- batch detail ต้องแสดง progress/result ราย item เหมือน audio batch

### `POST /quality-review-batches/:id/run`

Response:

```json
{
  "data": {
    "batchId": "qrb_001",
    "status": "processing",
    "queueMode": "sequential",
    "nextItemId": "qrbi_001"
  }
}
```

## 5. Scorecard Template Contract

### 5.1 `GET /quality-scorecards/templates`

Query:

```text
topic=promotion_pitch&customerSegment=sme&product=product-a&region=th&language=th
```

Response:

```json
{
  "data": [
    {
      "id": "sct-promotion-sme-th-v1",
      "name": "Promotion Pitch - SME Thailand",
      "version": 1,
      "status": "published",
      "topic": "promotion_pitch",
      "customerSegment": "sme",
      "product": "product-a",
      "region": "th",
      "language": "th",
      "effectiveDate": "2026-05-01",
      "expiryDate": "2026-06-30",
      "totalWeight": 100,
      "sections": [
        {
          "id": "opening",
          "label": "Opening",
          "weight": 10,
          "items": [
            {
              "id": "intro-name-company",
              "label": "แนะนำตัวและบริษัทครบ",
              "type": "required_semantic",
              "weight": 5,
              "severity": "medium",
              "expectedEvidence": "sales กล่าวชื่อและบริษัทช่วงต้นสาย"
            }
          ]
        },
        {
          "id": "promotion-compliance",
          "label": "Promotion Compliance",
          "weight": 25,
          "items": [
            {
              "id": "promo-terms",
              "label": "แจ้งเงื่อนไขโปรโมชันครบ",
              "type": "conditional_required",
              "weight": 15,
              "severity": "critical",
              "expectedEvidence": "เมื่อพูดถึงโปรโมชัน ต้องแจ้งระยะเวลาและเงื่อนไข"
            }
          ]
        }
      ]
    }
  ],
  "meta": {
    "requestId": "req_mock_001",
    "generatedAt": "2026-05-16T10:00:00Z"
  }
}
```

### 5.2 Template Selection Rule

Backend เป็น source of truth ในการเลือก template แต่ frontend mock ต้องจำลองได้:

1. exact match: topic + customerSegment + product + region + language
2. fallback: topic + customerSegment + product
3. fallback: topic + product
4. fallback: default topic template

ถ้าไม่มี template ให้ UI แสดง empty state และบอกให้ admin สร้าง scorecard template

## 6. Ask Playbook Chat Contract

Ask เป็น session-based chat สำหรับถาม Playbook แบบ source-first ไม่ใช่ search box ธรรมดา Backend ต้องเก็บ session, messages, citations และ feedback เพื่อให้ sales กลับมาอ่านต่อได้ และให้ admin เห็น knowledge gap จากคำถามที่ตอบไม่ได้

### 6.1 Playbook Search Provider Contract

Ask/Playbook ต้องคุยกับ SaleSync backend ผ่าน contract เดียว ไม่ว่า backend จะใช้ Turso FTS/BM25, Kotaemon/LEANN หรือ hybrid retrieval

| Provider | Use case | Notes |
|---|---|---|
| `turso_bm25` | default MVP, low latency, predictable citation | ใช้ `playbook_sections.search_text` เป็นหลัก |
| `kotaemon_leann` | local/private semantic retrieval เมื่อ Playbook/เอกสารเยอะขึ้น | Kotaemon จัดการ RAG pipeline, LEANN เป็น local vector/index backend |
| `hybrid` | combine BM25 + semantic candidates | backend ต้อง rerank และ filter source อีกครั้ง |

Provider response ต้อง map กลับมายัง SaleSync source id เสมอ เช่น `playbook_section_id` หรือ `document_artifact_id` เพื่อให้ citation, expiry และ role filter ยังอยู่ใน SaleSync

### 6.2 API Summary

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/playbook-chat-sessions` | create Ask chat session |
| `GET` | `/playbook-chat-sessions` | list user/team Ask sessions |
| `GET` | `/playbook-chat-sessions/:id` | get session detail with messages and citations |
| `POST` | `/playbook-chat-sessions/:id/messages` | ask question in a session |
| `PATCH` | `/playbook-chat-sessions/:id` | rename/archive session |
| `POST` | `/playbook-messages/:id/feedback` | mark answer useful/not useful and add note |
| `POST` | `/playbook-indexes/sync` | sync approved source to local RAG provider |
| `GET` | `/playbook-indexes/status` | inspect BM25/Kotaemon/LEANN index state |

### 6.3 `POST /playbook-indexes/sync`

ใช้สำหรับ admin/internal worker sync approved Playbook Section ไปยัง local RAG provider หลัง publish หรือ update source

Request:

```json
{
  "provider": "kotaemon_leann",
  "sourceType": "playbook_section",
  "sourceIds": ["pbs_q2_promo_sme"],
  "forceReindex": false
}
```

Response:

```json
{
  "data": {
    "provider": "kotaemon_leann",
    "synced": 1,
    "failed": 0,
    "items": [
      {
        "sourceId": "pbs_q2_promo_sme",
        "externalDocumentId": "kotaemon_doc_001",
        "status": "indexed",
        "indexedAt": "2026-05-16T20:30:00+07:00"
      }
    ]
  }
}
```

### 6.4 `POST /playbook-chat-sessions/:id/messages` Provider Policy

Ask message request รองรับ provider policy แต่ frontend ไม่ควรเลือก provider โดยตรงใน production ยกเว้น admin/debug mode

Request:

```json
{
  "question": "โปร Q2 ใช้กับร้านค้ารายย่อยได้ไหม",
  "product": "product-a",
  "customerSegment": "sme",
  "retrievalPolicy": "default"
}
```

Response:

```json
{
  "data": {
    "messageId": "pbm_001",
    "answer": "ใช้ได้กับร้านค้ารายย่อยที่เข้าเงื่อนไข SME และต้องแจ้งวันหมดอายุ...",
    "abstained": false,
    "retrievalProvider": "hybrid",
    "citations": [
      {
        "sourceType": "playbook_section",
        "sourceId": "pbs_q2_promo_sme",
        "title": "Q2 Promotion Playbook",
        "snippet": "ใช้ได้กับร้านค้ารายย่อยที่เปิดบัญชีใหม่และมียอดขั้นต่ำตามเงื่อนไขแคมเปญ",
        "score": 0.87
      }
    ]
  }
}
```

### 6.5 `POST /playbook-chat-sessions`

Request:

```json
{
  "title": "โปร Q2 สำหรับ SME",
  "product": "product-a",
  "customerSegment": "sme",
  "language": "th"
}
```

Response:

```json
{
  "data": {
    "id": "pbcs_001",
    "title": "โปร Q2 สำหรับ SME",
    "status": "active",
    "createdAt": "2026-05-16T10:00:00Z"
  }
}
```

### 6.6 `POST /playbook-chat-sessions/:id/messages`

Request:

```json
{
  "question": "โปร Q2 ใช้กับร้านค้ารายย่อยได้ไหม",
  "filters": {
    "product": "product-a",
    "sectionTypes": ["Promotion", "Compliance"],
    "language": "th"
  }
}
```

Response:

```json
{
  "data": {
    "id": "pbm_001",
    "sessionId": "pbcs_001",
    "question": "โปร Q2 ใช้กับร้านค้ารายย่อยได้ไหม",
    "answer": "ใช้ได้กับร้านค้ารายย่อยที่เข้าเกณฑ์ SME และต้องแจ้งวันหมดอายุ เงื่อนไขยอดขั้นต่ำ และข้อจำกัดสิทธิ์ให้ครบ",
    "abstained": false,
    "citations": [
      {
        "sectionId": "pbs_q2_promo_terms",
        "playbookTitle": "Q2 Promotion Playbook",
        "sectionTitle": "SME eligibility",
        "snippet": "ใช้ได้กับร้านค้ารายย่อยที่เปิดบัญชีใหม่และมียอดขั้นต่ำตามเงื่อนไขแคมเปญ",
        "rank": 1
      }
    ],
    "createdAt": "2026-05-16T10:01:00Z"
  }
}
```

Rules:

- ต้องค้นเฉพาะ `published` Playbook Section ที่ยังไม่หมดอายุ
- factual answer ต้องมี citation อย่างน้อย 1 รายการ
- ถ้า source ไม่พอให้ `abstained: true` และไม่เดาคำตอบ
- เก็บ unanswered/abstained question เพื่อให้ Knowledge Management นำไปปรับ Playbook

## 7. Recording Review Training Batch Contract

Recording Review ใช้ batch pattern เหมือน Quality Review แต่ objective คือการฝึก sales และเปรียบเทียบ attempt หลายครั้งใน batch เดียวกัน ไม่ใช่ compliance review ของลูกค้าจริง

### API Summary

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/recording-review-batches` | create training batch with selected rubric |
| `GET` | `/recording-review-batches` | list recording review batches |
| `GET` | `/recording-review-batches/:id` | get batch detail, attempts, score trend |
| `PATCH` | `/recording-review-batches/:id` | rename batch or update metadata |
| `POST` | `/recording-review-batches/:id/attempts` | add browser recording or uploaded audio as attempt |
| `POST` | `/recording-review-batches/:id/run` | process queued attempts sequentially |
| `GET` | `/recording-review-attempts/:id/transcript` | get audio playback URL and ASR utterances |
| `PATCH` | `/recording-review-attempts/:attemptId/transcript-utterances/:utteranceId` | correct ASR utterance text |
| `GET` | `/training-rubrics` | list training rubrics for recording review |
| `GET` | `/training-rubrics/:id` | get training rubric detail for editor |
| `PATCH` | `/training-rubrics/:id` | update training rubric draft |

### `POST /recording-review-batches`

Request:

```json
{
  "name": "Pitch โปร Q2 สำหรับ SME",
  "rubricId": "rrb-pitch-sme-v1",
  "inputMode": "browser_recording",
  "ownerUserId": "usr_sales_001"
}
```

Rules:

- `inputMode` must be `browser_recording` or `audio_upload`
- batch can contain multiple attempts so UI can compare attempt 1, 2, 3
- selected rubric must be a published training rubric unless user has manager/admin permission to test draft rubric
- training rubric uses the same structure as scorecard/template management: template metadata, sections, rules, weight, severity, sort order, expected evidence and example

Response:

```json
{
  "data": {
    "id": "rrb_001",
    "name": "Pitch โปร Q2 สำหรับ SME",
    "rubricId": "rrb-pitch-sme-v1",
    "inputMode": "browser_recording",
    "status": "draft",
    "createdBy": {
      "id": "usr_sales_001",
      "name": "Pim K."
    },
    "totalAttempts": 0,
    "completedAttempts": 0,
    "latestScore": null
  }
}
```

### `PATCH /recording-review-batches/:id`

ใช้สำหรับ rename batch หรือแก้ metadata เบื้องต้นโดยไม่กระทบ attempts เดิม

Request:

```json
{
  "name": "Pitch โปร Q2 สำหรับ SME - รอบฝึกกับร้านค้ารายย่อย"
}
```

Response:

```json
{
  "data": {
    "id": "rrb_001",
    "name": "Pitch โปร Q2 สำหรับ SME - รอบฝึกกับร้านค้ารายย่อย",
    "updatedAt": "2026-05-16T12:00:00Z"
  }
}
```

Rules:

- `name` must be trimmed and not empty
- update must be audit logged as `recording_review_batch.renamed`
- changing batch name must not change historical attempt score or transcript

### `GET /recording-review-batches/:id`

Response:

```json
{
  "data": {
    "id": "rrb_001",
    "name": "Pitch โปร Q2 สำหรับ SME",
    "rubric": {
      "id": "rrb-pitch-sme-v1",
      "name": "Pitch Practice - SME",
      "version": "v1"
    },
    "status": "completed",
    "inputMode": "browser_recording",
    "createdBy": {
      "id": "usr_sales_001",
      "name": "Pim K."
    },
    "attempts": [
      {
        "id": "rra_001",
        "sortOrder": 1,
        "fileName": "recorded-attempt-01.webm",
        "recordedBy": {
          "id": "usr_sales_001",
          "name": "Pim K."
        },
        "audioSubmissionId": "aud_001",
        "durationSec": 82,
        "status": "scored",
        "score": 62,
        "feedbackSummary": "ถาม pain point น้อยและปิด next step ไม่ชัด"
      },
      {
        "id": "rra_002",
        "sortOrder": 2,
        "fileName": "recorded-attempt-02.webm",
        "recordedBy": {
          "id": "usr_sales_001",
          "name": "Pim K."
        },
        "status": "scored",
        "score": 74,
        "feedbackSummary": "จับ objection ได้ดีขึ้นแต่ยังใช้ศัพท์เทคนิคเยอะ"
      }
    ],
    "trend": {
      "firstScore": 62,
      "latestScore": 74,
      "improvement": 12
    }
  }
}
```

### `GET /recording-review-attempts/:id/transcript`

ใช้สำหรับ attempt review modal ที่กดจาก row ใน batch detail เพื่อดู playback และ ASR result แบบ SRT/timeline

Response:

```json
{
  "data": {
    "attemptId": "rra_001",
    "audioSubmissionId": "aud_001",
    "fileName": "recorded-attempt-01.webm",
    "audioUrl": "https://storage.example/signed/recorded-attempt-01.webm",
    "durationSec": 82,
    "utterances": [
      {
        "id": "utt_001",
        "sortOrder": 1,
        "speaker": "Sales",
        "startMs": 1000,
        "endMs": 7800,
        "srtStart": "00:00:01,000",
        "srtEnd": "00:00:07,800",
        "text": "สวัสดีครับ ผมพิมจาก SaleSync โทรมาเรื่องโปร Q2 สำหรับร้านค้า SME",
        "editedText": null,
        "isEdited": false,
        "confidence": 0.94
      },
      {
        "id": "utt_002",
        "sortOrder": 2,
        "speaker": "Customer",
        "startMs": 8200,
        "endMs": 14600,
        "srtStart": "00:00:08,200",
        "srtEnd": "00:00:14,600",
        "text": "ได้ครับ แต่ผมอยากรู้ก่อนว่าโปรนี้ใช้กับร้านค้ารายย่อยแบบผมได้ไหม",
        "editedText": "ได้ครับ แต่ผมอยากรู้ก่อนว่าโปรนี้ใช้กับร้านค้ารายย่อยแบบผมได้ไหมครับ",
        "isEdited": true,
        "editedByUserId": "usr_manager_01",
        "editedAt": "2026-05-16T12:40:00+07:00",
        "confidence": 0.91
      }
    ]
  }
}
```

UI expectation:

- modal มี play/pause, playback position, timeline/waveform และ search transcript mock
- utterance แสดง `speaker`, `srtStart --> srtEnd`, `text` และ action `Play segment`
- utterance text แก้ไขได้เพื่อ correct ASR; ถ้าแก้แล้วต้องแสดง edited indicator และส่ง `editedText` กลับ backend โดยไม่ทับ raw ASR `text`
- ถ้า transcript ยังไม่พร้อมให้แสดง queued/processing state แทน empty transcript

### `PATCH /recording-review-attempts/:attemptId/transcript-utterances/:utteranceId`

ใช้สำหรับแก้ transcript segment ที่ ASR ถอดผิด โดยต้องเก็บ raw ASR text เดิมไว้เพื่อ audit และเปรียบเทียบย้อนหลัง

Request:

```json
{
  "editedText": "ได้ครับ แต่ผมอยากรู้ก่อนว่าโปรนี้ใช้กับร้านค้ารายย่อยแบบผมได้ไหมครับ"
}
```

Response:

```json
{
  "data": {
    "id": "utt_002",
    "text": "ได้ครับ แต่ผมอยากรู้ก่อนว่าโปรนี้ใช้กับร้านค้ารายย่อยแบบผมได้ไหม",
    "editedText": "ได้ครับ แต่ผมอยากรู้ก่อนว่าโปรนี้ใช้กับร้านค้ารายย่อยแบบผมได้ไหมครับ",
    "isEdited": true,
    "editedByUserId": "usr_manager_01",
    "editedAt": "2026-05-16T12:40:00+07:00"
  }
}
```

### `POST /recording-review-batches/:id/attempts`

Request:

```json
{
  "sourceType": "browser_recording",
  "fileName": "recorded-attempt-02.webm",
  "mimeType": "audio/webm",
  "recordedByUserId": "usr_sales_001",
  "queueImmediately": false,
  "sortOrder": 2
}
```

Response:

```json
{
  "data": {
    "id": "rra_002",
    "batchId": "rrb_001",
    "status": "draft",
    "sortOrder": 2
  }
}
```

Supported file formats: `.mp3`, `.wav`, `.m4a`, `.webm`

Recorder behavior:

- recorder UI ต้องใช้ Web Audio API หรือ equivalent เพื่อแสดง live microphone input meter ก่อนสร้าง attempt
- ถ้า browser ยังไม่ได้สิทธิ์ microphone หรือไม่มี input signal ต้องแจ้ง user ให้เห็นใน recorder modal
- browser recording `Stop` ต้อง save เป็น attempt draft ก่อน ไม่ส่งเข้า Botnoi ASR อัตโนมัติ
- ถ้า user เลือก `Send to queue` ให้ส่ง `queueImmediately: true` หรือเรียก endpoint queue ภายหลัง
- ถ้า user เลือก `Save draft` ให้เก็บ `status = draft` และยังไม่คิด ASR cost
- ถ้า user เลือก `Discard` ไม่ต้องสร้าง attempt record
- `run` endpoint ประมวลผลเฉพาะ attempts ที่อยู่ใน `queued` เท่านั้น ไม่รวม `draft`

### `POST /recording-review-batches/:id/run`

Response:

```json
{
  "data": {
    "id": "rrb_001",
    "status": "processing",
    "queuedAttempts": 2
  }
}
```

Processing rule:

- attempts are processed sequentially by `sortOrder`
- each attempt stores transcript, scorecard result, score items and feedback summary
- batch updates `latestScore`, `completedAttempts` and `status` after each attempt completes

### `GET /training-rubrics`

Response:

```json
{
  "data": [
    {
      "id": "rrb-pitch-sme-v1",
      "name": "Pitch Practice - SME",
      "type": "training_rubric",
      "version": "v1",
      "status": "published",
      "sections": 5,
      "validationStatus": "ready"
    }
  ]
}
```

### `GET /training-rubrics/:id`

Response:

```json
{
  "data": {
    "id": "rrb-pitch-sme-v1",
    "name": "Pitch Practice - SME",
    "type": "training_rubric",
    "version": "v1",
    "status": "published",
    "scenario": "promotion_pitch",
    "sections": [
      {
        "id": "opening",
        "name": "Opening",
        "sortOrder": 1,
        "weight": 20,
        "rules": [
          {
            "id": "open-1",
            "label": "แนะนำตัวและวัตถุประสงค์",
            "type": "required_semantic",
            "severity": "medium",
            "weight": 10,
            "sortOrder": 1
          }
        ]
      }
    ]
  }
}
```

## 8. Voice Senario Hidden Analytics

Senario live session ต้องเก็บ response latency แบบไม่แสดงใน UI เพื่อใช้วิเคราะห์ hesitation, confidence และ coaching opportunity หลัง session โดยเริ่มจับเวลาจาก AI/persona response ล่าสุดที่ส่งถึง frontend จน user มี action แรกต่อ turn นั้น

WSS event:

```json
{
  "type": "response_latency.recorded",
  "sessionId": "voice_session_001",
  "aiTurnId": "turn_ai_004",
  "clientEventId": "lat_001",
  "messageKey": "คุณธันวา:ข้อเสนอน่าสนใจครับ...",
  "action": "start_typing",
  "latencyMs": 18320,
  "capturedAt": "2026-05-17T14:12:20.000Z"
}
```

Allowed `action` values:

```ts
type ResponseLatencyAction = 'start_typing' | 'push_to_talk' | 'send_text';
```

Backend should persist one event per `{aiTurnId, action}` and ignore duplicate client retries by `clientEventId` when available. This data is analytics-only and should not appear in the live conversation UI.

### 8.1 Voice Senario Knowledge Acquired

Session detail ต้องคืนรายการ knowledge ที่เกี่ยวข้องกับ session นั้น เพื่อให้ frontend แสดง tab `Knowledge Acquired` สำหรับการเรียนรู้หลังซ้อมและ bookmark ไว้อ่านต่อในหน้า Knowledge

```json
{
  "knowledgeAcquired": [
    {
      "id": "ka-q2-promo-terms",
      "title": "Q2 Promotion Terms for SME",
      "summary": "เงื่อนไขโปรโมชัน Q2 สำหรับร้านค้า SME, วันหมดอายุ, ยอดขั้นต่ำ และข้อจำกัดสิทธิ์ที่ต้องแจ้งลูกค้า",
      "source": "Playbook / Promotion / Q2 SME",
      "type": "playbook",
      "focus": "ใช้ตอบคำถาม eligibility และป้องกันการแจ้งเงื่อนไขไม่ครบ",
      "readTime": "4 min read",
      "favorited": true
    }
  ]
}
```

Allowed `type` values:

```ts
type SessionKnowledgeType = 'playbook' | 'guardrail' | 'case-study' | 'faq';
```

Favorite action:

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/voice-sessions/:id/knowledge/:knowledgeItemId/favorite` | bookmark session knowledge source ให้ user |
| `DELETE` | `/voice-sessions/:id/knowledge/:knowledgeItemId/favorite` | remove bookmark |

Favorite เป็น user-level bookmark เพื่ออ่านต่อในหน้า Knowledge และไม่ควรแก้ไข Playbook source โดยตรง

## 9. Audio Submission Contract

### 9.1 `POST /audio-submissions`

Request:

```json
{
  "type": "sales_call_review",
  "topic": "promotion_pitch",
  "customerSegment": "sme",
  "product": "product-a",
  "region": "th",
  "language": "th",
  "scorecardTemplateId": "sct-promotion-sme-th-v1",
  "title": "Pitch โปร Q2 กับร้านค้ารายย่อย",
  "notes": "mock call จาก training session"
}
```

Response:

```json
{
  "data": {
    "id": "asub_001",
    "status": "draft",
    "type": "sales_call_review",
    "topic": "promotion_pitch",
    "customerSegment": "sme",
    "product": "product-a",
    "region": "th",
    "language": "th",
    "scorecardTemplateId": "sct-promotion-sme-th-v1",
    "createdBy": "user_sales_001",
    "createdAt": "2026-05-16T10:00:00Z"
  }
}
```

### 9.2 Status Values

```ts
type AudioSubmissionStatus =
  | 'draft'
  | 'uploaded'
  | 'processing'
  | 'transcribed'
  | 'scored'
  | 'needs_review'
  | 'completed'
  | 'failed';
```

## 10. Transcript Contract

### `GET /audio-submissions/:id/transcript`

```json
{
  "data": {
    "submissionId": "asub_001",
    "language": "th",
    "durationSec": 182,
    "utterances": [
      {
        "id": "utt_001",
        "speaker": "sales",
        "startMs": 1200,
        "endMs": 5200,
        "text": "สวัสดีครับ ผมสมชายจากบริษัท SaleSync โทรมาแนะนำโปรโมชันไตรมาสนี้ครับ",
        "confidence": 0.92
      },
      {
        "id": "utt_002",
        "speaker": "customer",
        "startMs": 5500,
        "endMs": 8200,
        "text": "โปรนี้ลดถึงเมื่อไหร่ครับ",
        "confidence": 0.89
      }
    ]
  }
}
```

## 11. Scorecard Result Contract

### `GET /audio-submissions/:id/scorecard`

```json
{
  "data": {
    "id": "scr_001",
    "submissionId": "asub_001",
    "templateId": "sct-promotion-sme-th-v1",
    "status": "needs_review",
    "totalScore": 78,
    "riskLevel": "medium",
    "summary": "พูดเปิดสายดีและนำเสนอโปรโมชันชัด แต่แจ้งเงื่อนไขไม่ครบและยังซัก pain point ไม่พอ",
    "sections": [
      {
        "id": "opening",
        "label": "Opening",
        "score": 9,
        "maxScore": 10,
        "items": [
          {
            "id": "intro-name-company",
            "label": "แนะนำตัวและบริษัทครบ",
            "status": "passed",
            "score": 5,
            "maxScore": 5,
            "severity": "medium",
            "evidence": [
              {
                "utteranceId": "utt_001",
                "speaker": "sales",
                "startMs": 1200,
                "endMs": 5200,
                "text": "สวัสดีครับ ผมสมชายจากบริษัท SaleSync..."
              }
            ],
            "recommendation": null
          }
        ]
      },
      {
        "id": "promotion-compliance",
        "label": "Promotion Compliance",
        "score": 10,
        "maxScore": 25,
        "items": [
          {
            "id": "promo-terms",
            "label": "แจ้งเงื่อนไขโปรโมชันครบ",
            "status": "failed",
            "score": 0,
            "maxScore": 15,
            "severity": "critical",
            "evidence": [],
            "recommendation": "ถ้าพูดถึงโปรโมชัน ต้องแจ้งวันหมดอายุ เงื่อนไขการรับสิทธิ์ และข้อจำกัดให้ครบ"
          }
        ]
      }
    ],
    "review": {
      "reviewedBy": null,
      "reviewedAt": null,
      "overrideCount": 0
    }
  }
}
```

## 12. Mock States ที่ต้องมี

| State | ใช้ทดสอบ UI |
|---|---|
| empty template | ไม่มี scorecard ที่ match topic/segment |
| draft submission | สร้าง metadata แล้วยังไม่ upload file |
| uploading | upload progress |
| processing | รอ ASR/scoring |
| failed ASR | Botnoi ASR error, retryable |
| low score | critical issue หลายข้อ |
| high score | completed พร้อม feedback ดี |
| needs review | manager ต้องตรวจ |
| override applied | มี manager override |

## 13. Frontend Components ที่ผูกกับ Contract

| Component | Contract |
|---|---|
| `AudioUploader` | `POST /audio-submissions`, `POST /file` |
| `ScorecardTemplateSelector` | `GET /quality-scorecards/templates` |
| `TranscriptViewer` | `GET /transcript` |
| `ScorecardSummary` | `GET /scorecard` |
| `EvidenceDrawer` | `scorecard.sections.items.evidence` |
| `OverrideScoreDialog` | `PATCH /scorecard-results/:id/override` |

## 14. Backend Notes

- backend ต้อง validate `scorecardTemplateId` ว่า match กับ topic/customerSegment/product/region/language จริง
- backend ต้องเก็บ template version ที่ใช้ประเมินไว้กับ result เสมอ
- ถ้า scoring standard เปลี่ยนในอนาคต result เก่าต้องไม่เปลี่ยนย้อนหลัง
- manager override ต้องมี reason และ audit log
