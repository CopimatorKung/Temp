# API Sequence Diagrams

เอกสารนี้แสดง sequence diagram ของ API หลักใน MVP โดยใช้ Rust + Actix Web เป็น backend

## 0. Quality Review Batch Flow

```mermaid
sequenceDiagram
    participant FE as React App
    participant API as Actix API
    participant DB as Turso
    participant Storage as Storage
    participant Worker as Batch Worker
    participant ASR as Botnoi ASR
    participant Scoring as Score Engine
    participant Audit as Audit Log

    FE->>API: POST /quality-review-batches metadata + scorecardTemplateId
    API->>DB: insert quality_review_batches status=draft
    API-->>FE: 201 batch
    FE->>API: POST /quality-review-batches/:id/items
    API->>Storage: store files or document artifacts
    API->>DB: insert quality_review_batch_items status=queued
    API-->>FE: 200 batch items
    FE->>API: POST /quality-review-batches/:id/run
    API->>DB: update batch status=processing
    API->>Worker: enqueue batch sequential processing
    API-->>FE: 202 batch status=processing
    loop each item FIFO
        Worker->>DB: mark item processing
        alt audio item
            Worker->>ASR: submit audio
            ASR-->>Worker: transcript
            Worker->>DB: insert transcript_utterances
        else document/article item
            Worker->>Storage: read .md/.txt/.doc/.docx
            Worker->>Worker: extract and normalize text
            Worker->>Storage: store normalized text artifact
            Worker->>DB: store document evidence spans
        end
        Worker->>Scoring: evaluate item against selected guidance
        Scoring-->>Worker: scorecard result and evidence
        Worker->>DB: insert scorecard_results and score_items
        Worker->>DB: mark item scored
    end
    Worker->>DB: mark batch completed or partial_failed
    Worker->>Audit: log quality_review_batch.processed
```

## 0.1 Recording Review Batch Flow

```mermaid
sequenceDiagram
    participant FE as React App
    participant API as Actix API
    participant DB as Turso
    participant Storage as Storage
    participant Worker as Training Worker
    participant ASR as Botnoi ASR
    participant Scoring as Score Engine
    participant Audit as Audit Log

    FE->>API: POST /recording-review-batches name + rubricId + inputMode
    API->>API: validate inputMode browser_recording or audio_upload
    API->>DB: insert recording_review_batches status=draft
    API-->>FE: 201 recording batch
    opt rename batch
        FE->>API: PATCH /recording-review-batches/:id name
        API->>DB: update recording_review_batches.title
        API->>Audit: log recording_review_batch.renamed
        API-->>FE: 200 updated batch
    end
    alt browser recording
        FE->>FE: record microphone audio and create webm/m4a file
        FE->>API: POST /recording-review-batches/:id/attempts recorded audio
    else upload audio
        FE->>API: POST /recording-review-batches/:id/attempts uploaded mp3/wav/m4a/webm
    end
    API->>Storage: store attempt audio
    API->>DB: insert audio_submissions type=recording_review
    API->>DB: insert recording_review_attempts status=queued sort_order
    API-->>FE: 200 attempt queued
    FE->>API: POST /recording-review-batches/:id/run
    API->>DB: update batch status=processing
    API->>Worker: enqueue attempts sequential processing
    API-->>FE: 202 batch status=processing
    loop each attempt by sort_order
        Worker->>DB: mark attempt processing
        Worker->>Storage: read audio by storage_uri
        Worker->>ASR: submit audio
        ASR-->>Worker: transcript
        Worker->>DB: insert transcript_utterances
        Worker->>Scoring: evaluate transcript against training rubric
        Scoring-->>Worker: scorecard result, score items, coaching feedback
        Worker->>DB: insert scorecard_results and score_items
        Worker->>DB: insert or update training_results
        Worker->>DB: mark attempt scored with score and feedback_json
    end
    Worker->>DB: update batch latest_score, completed_attempts, status
    Worker->>Audit: log recording_review_batch.processed
```

## 0.2 Recording Review Attempt ASR Review Flow

```mermaid
sequenceDiagram
    participant FE as React App
    participant API as Actix API
    participant DB as Turso
    participant Storage as Storage
    participant Audit as Audit Log

    FE->>API: GET /recording-review-attempts/:id/transcript
    API->>DB: verify user can access attempt batch
    API->>DB: select transcript_utterances by audio_submission_id order by start_ms
    API->>Storage: sign audio playback URL
    API->>Audit: log recording_review_attempt.transcript_viewed
    API-->>FE: 200 audioUrl + utterances
    FE->>FE: render playback controls, waveform/timeline and SRT-style utterance list
```

## 1. `POST /audio-submissions`

```mermaid
sequenceDiagram
    participant FE as React App
    participant API as Actix API
    participant DB as Turso
    participant Audit as Audit Log

    FE->>API: POST /audio-submissions metadata
    API->>API: validate role and payload
    API->>DB: insert audio_submissions status=draft
    API->>Audit: log audio_submission.created
    API-->>FE: 201 submission_id, status
```

## 2. `POST /audio-submissions/:id/file`

```mermaid
sequenceDiagram
    participant FE as React App
    participant API as Actix API
    participant Storage as Audio Storage
    participant DB as Turso
    participant Audit as Audit Log

    FE->>API: POST multipart audio file
    API->>API: validate ownership, file type, size
    API->>Storage: store raw audio
    Storage-->>API: storage_uri, duration
    API->>DB: update status=uploaded, storage_uri
    API->>Audit: log audio_submission.file_uploaded
    API-->>FE: 200 status=uploaded
```

## 3. `POST /audio-submissions/:id/process`

```mermaid
sequenceDiagram
    participant FE as React App
    participant API as Actix API
    participant DB as Turso
    participant Storage as Audio Storage
    participant ASR as Botnoi ASR
    participant Scoring as Score Engine
    participant Audit as Audit Log

    FE->>API: POST process
    API->>DB: get submission
    API->>Storage: read audio by storage_uri
    API->>DB: update status=processing
    API->>ASR: submit audio
    ASR-->>API: transcript result
    API->>DB: insert transcript_utterances
    API->>Scoring: evaluate transcript against scorecard
    Scoring-->>API: scorecard result and evidence
    API->>DB: insert scorecard_results and score_items
    API->>DB: update status=completed
    API->>Audit: log audio_submission.processed
    API-->>FE: 202 or 200 processing result
```

## 4. `GET /audio-submissions/:id`

```mermaid
sequenceDiagram
    participant FE as React App
    participant API as Actix API
    participant DB as Turso

    FE->>API: GET submission detail
    API->>API: check user permission
    API->>DB: select audio_submissions by id
    DB-->>API: submission detail
    API-->>FE: 200 submission
```

## 5. `GET /audio-submissions/:id/transcript`

```mermaid
sequenceDiagram
    participant FE as React App
    participant API as Actix API
    participant DB as Turso

    FE->>API: GET transcript
    API->>API: check permission
    API->>DB: select transcript_utterances by submission_id
    DB-->>API: utterances
    API-->>FE: 200 transcript
```

## 6. `GET /audio-submissions/:id/scorecard`

```mermaid
sequenceDiagram
    participant FE as React App
    participant API as Actix API
    participant DB as Turso

    FE->>API: GET scorecard result
    API->>API: check permission
    API->>DB: select scorecard_results and score_items
    DB-->>API: scorecard with evidence
    API-->>FE: 200 scorecard
```

## 7. `PATCH /scorecard-results/:id/override`

```mermaid
sequenceDiagram
    participant FE as Manager UI
    participant API as Actix API
    participant DB as Turso
    participant Audit as Audit Log

    FE->>API: PATCH override score and reason
    API->>API: require manager role
    API->>DB: get scorecard_result
    API->>DB: update score_items/result override fields
    API->>Audit: log scorecard.override
    API-->>FE: 200 updated scorecard
```

## 8. `GET /quality-scorecards/templates`

```mermaid
sequenceDiagram
    participant FE as React App
    participant API as Actix API
    participant DB as Turso

    FE->>API: GET templates?topic&customerSegment&product&region&language
    API->>API: validate query and role
    API->>DB: find exact/fallback published templates
    DB-->>API: templates with sections/items
    API-->>FE: 200 templates
```

## 9. `POST /playbooks`

```mermaid
sequenceDiagram
    participant FE as Admin UI
    participant API as Actix API
    participant DB as Turso
    participant Audit as Audit Log

    FE->>API: POST playbook metadata
    API->>API: require admin role
    API->>DB: insert playbooks status=draft
    API->>Audit: log playbook.created
    API-->>FE: 201 playbook_id
```

## 10. `POST /playbooks/:id/sections`

```mermaid
sequenceDiagram
    participant FE as Admin UI
    participant API as Actix API
    participant DB as Turso
    participant Index as Playbook FTS Index
    participant Audit as Audit Log

    FE->>API: POST playbook section
    API->>API: validate admin role, tags, effective/expiry dates
    API->>DB: insert playbook_sections status=draft
    API->>Index: update FTS index fields
    API->>Audit: log playbook_section.created
    API-->>FE: 201 section_id
```

## 10.1 Knowledge Resource Import and Publish

```mermaid
sequenceDiagram
    participant Owner as Admin/Owner
    participant FE as React Knowledge UI
    participant API as Actix API
    participant Storage as Object Storage
    participant Extract as Extraction Worker
    participant DB as Turso
    participant RAG as Kotaemon RAG Service
    participant LEANN as LEANN Local Index

    Owner->>FE: upload PDF/CSV/XLSX/MD/DOC/DOCX/TXT
    FE->>API: POST /knowledge/import-jobs metadata
    API->>API: validate role, target book/chapter/topic, file type
    API->>Storage: create upload targets
    API->>DB: insert knowledge_import_jobs status=queued
    API-->>FE: 201 import job + upload targets
    FE->>Storage: upload files
    Extract->>Storage: read uploaded files
    Extract->>Extract: extract/normalize text into markdown or artifact spans
    Extract->>DB: create knowledge_import_artifacts and draft pages
    Owner->>FE: review mapping and edit Markdown page
    FE->>API: PUT /knowledge/pages/:id markdown + metadata
    API->>DB: update knowledge_pages status=review
    Owner->>FE: publish page
    FE->>API: POST /knowledge/pages/:id/publish
    API->>DB: update status=published and FTS search_text
    alt local RAG enabled
        API->>RAG: sync published page + metadata
        RAG->>LEANN: update local vector index
        LEANN-->>RAG: chunk ids
        RAG-->>API: external document/chunk mapping
        API->>DB: upsert playbook_rag_indexes source_type=knowledge_page
    end
    API-->>FE: published + index status
```

## 11. Ask Playbook Chat Session

```mermaid
sequenceDiagram
    participant FE as React App
    participant API as Actix API
    participant PSearch as Playbook Search Port
    participant BM25 as Turso FTS/BM25
    participant RAG as Kotaemon RAG Service
    participant LEANN as LEANN Local Index
    participant DB as Turso

    FE->>API: POST /playbook-chat-sessions
    API->>API: validate role and session metadata
    API->>DB: insert playbook_chat_sessions status=active
    API-->>FE: 201 session
    FE->>API: POST /playbook-chat-sessions/:id/messages question
    API->>API: validate role and input
    API->>PSearch: search approved valid source with provider policy
    alt BM25 provider
        PSearch->>BM25: query published sections
        BM25-->>PSearch: ranked sections/snippets
    else local RAG provider
        PSearch->>RAG: retrieve with metadata filters
        RAG->>LEANN: semantic search local index
        LEANN-->>RAG: candidate chunks
        RAG-->>PSearch: ranked chunks with source ids
    end
    PSearch-->>API: ranked source ids/snippets/citation metadata
    API->>DB: re-check role, status, effective/expiry, product filters
    API->>API: compose guided answer with citation policy
    API->>DB: insert playbook_messages session_id + citations + abstained
    API-->>FE: 200 answer, citations, abstained
```

## 11.1 Playbook RAG Index Sync

```mermaid
sequenceDiagram
    participant Admin as Admin
    participant FE as React App
    participant API as Actix API
    participant DB as Turso
    participant RAG as Kotaemon RAG Service
    participant LEANN as LEANN Local Index

    Admin->>FE: publish Playbook Section
    FE->>API: PATCH /playbook-sections/:id/publish
    API->>DB: update section status=published
    API->>DB: upsert FTS searchable text
    API->>RAG: sync approved section text + metadata
    RAG->>LEANN: build/update local vector index
    LEANN-->>RAG: index id / chunk ids
    RAG-->>API: external document/chunk mapping
    API->>DB: upsert playbook_rag_indexes provider/source mapping
    API-->>FE: published + indexed status
```

## 12. `GET /onboarding/tracks`

```mermaid
sequenceDiagram
    participant FE as React App
    participant API as Actix API
    participant DB as Turso

    FE->>API: GET onboarding tracks
    API->>API: check sales or manager permission
    API->>DB: select tracks, topic counts, assignment progress, badges
    DB-->>API: track library and badge summary
    API-->>FE: 200 tracks
```

## 13. `GET /onboarding/tracks/:id`

```mermaid
sequenceDiagram
    participant FE as React App
    participant API as Actix API
    participant DB as Turso

    FE->>API: GET track detail
    API->>API: check track visibility and assignment scope
    API->>DB: select track, topics, source refs, progress, badge criteria
    DB-->>API: track detail
    API-->>FE: 200 track with topic progress
```

## 14. `POST /onboarding/senario-completions`

```mermaid
sequenceDiagram
    participant FE as React App
    participant API as Actix API
    participant DB as Turso
    participant Audit as Audit Log

    FE->>API: POST completed Senario session and score
    API->>API: find linked track topic and validate required_score
    API->>DB: upsert onboarding_topic_progress
    API->>DB: recalculate track percent and award badge if threshold met
    API->>Audit: log onboarding.senario_topic_completed
    API-->>FE: 200 updated track progress and badge state
```

## 15. WSS `/ws/voice-sessions`

```mermaid
sequenceDiagram
    participant FE as React App
    participant WS as Actix WebSocket
    participant ASR as Botnoi ASR
    participant PSearch as Scenario/Playbook Engine
    participant TTS as Botnoi TTS
    participant DB as Turso

    FE->>WS: session.start persona/scenario
    WS->>DB: insert voice_sessions status=active
    WS->>PSearch: preload valid related playbook sections
    PSearch-->>WS: selected sections
    WS-->>FE: session.ready
    loop each user turn
        FE->>WS: audio.chunk
        WS->>ASR: stream or submit audio chunk
        ASR-->>WS: asr.partial
        WS-->>FE: asr.partial
        ASR-->>WS: asr.final
        WS->>DB: insert voice_turn speaker=sales
        WS->>PSearch: generate AI customer response from scenario and preloaded sections
        PSearch-->>WS: ai.text
        WS-->>FE: ai.text
        WS->>TTS: synthesize speech
        TTS-->>WS: audio response
        WS->>DB: insert voice_turn speaker=ai
        WS-->>FE: tts.audio
    end
    FE->>WS: session.end
    WS->>DB: update voice_sessions status=completed
    WS->>DB: insert training_results
    WS-->>FE: session.summary
```
