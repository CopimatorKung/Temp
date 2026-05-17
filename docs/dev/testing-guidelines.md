# Testing Guidelines: SaleSync MVP

เอกสารนี้ดัดแปลงแนวทางจาก [go-testing-guidelines.md](./go-testing-guidelines.md) ให้เหมาะกับ SaleSync ที่ใช้ Rust + Actix Web, React, Turso, WSS และ Botnoi ASR/TTS

## 1. Testing Philosophy

เน้น test ที่จับความเสี่ยงจริงของระบบ:

- quality review batch lifecycle และ file/document validation
- ASR/TTS provider failure
- scorecard/rule correctness
- playbook search citation และ abstention
- WSS session stability
- permission และ audit log
- onboarding progress correctness

## 2. Test Pyramid

```text
                    E2E 5%
              Integration 20%
            Service/API 30%
         Domain/Unit 45%
```

| Layer | Target | ตัวอย่าง |
|---|---:|---|
| Domain/Unit | 95% | scoring, rule matching, batch/item status transition |
| Application Service | 90% | batch processing service, audio process service, training result service |
| Infrastructure | 80% | Turso adapter, storage adapter, Botnoi mock adapter |
| API/WSS | 85% | Actix handlers, WebSocket session |
| Frontend Critical Components | 80% | upload, transcript, scorecard, voice panel |

## 3. Backend Test Structure

```text
src/
  domain/
    entities/
      scorecard.rs
      scorecard_test.rs
    value_objects/
  application/
    usecases/
      audio_processing.rs
      audio_processing_test.rs
  infrastructure/
    actix_http/
      routers/
      middleware.rs
    turso/
      repositories/
    botnoi/
tests/
  integration/
    audio_submission_flow.rs
    qa_message_flow.rs
    voice_session_flow.rs
```

## 4. Test Naming

ใช้ pattern:

```text
test_{function_or_use_case}_when_{condition}_should_{expected}
```

ตัวอย่าง:

- `test_score_required_opening_when_phrase_missing_should_fail_rule`
- `test_audio_upload_when_file_type_invalid_should_return_422`
- `test_voice_session_when_tts_fails_should_return_retryable_error`
- `test_qa_message_when_no_source_found_should_abstain`

## 5. Domain Test Matrix

| Domain | Test Cases |
|---|---|
| Scorecard | required rule pass/fail, negative phrase hit, conditional rule, evidence timestamp |
| Quality Review Batch | create batch, add items, sequential processing, partial failure, invalid transition |
| Audio Submission | valid status transition, invalid transition, owner access |
| Playbook | draft not searchable, published searchable, expired promotion section excluded |
| Onboarding | topic completion, linked Senario pass/fail, badge threshold unlock, manager sign-off required |
| Voice Session | start, turn complete, end, abandoned session |

## 6. API Test Matrix

| API | Required Tests |
|---|---|
| `POST /quality-review-batches` | valid payload, missing guidance, forbidden role |
| `POST /quality-review-batches/:id/items` | add audio items, add `.md/.txt/.doc/.docx` document items, invalid file type, empty extracted text, oversize file, wrong owner |
| `POST /quality-review-batches/:id/run` | sequential success, empty batch, already running, partial failure |
| `GET /quality-review-batches` | list own/team batches, status filter, permission scope |
| `GET /quality-review-batches/:id` | batch detail with item statuses, forbidden, not found |
| `POST /audio-submissions` | valid payload, missing field, forbidden role |
| `POST /audio-submissions/:id/file` | valid file, invalid type, oversize file, wrong owner |
| `POST /audio-submissions/:id/process` | success, missing file, ASR failure, scoring failure |
| `GET /audio-submissions/:id/transcript` | success, not found, forbidden |
| `PATCH /scorecard-results/:id/override` | manager success, sales forbidden, missing reason |
| `PATCH /recording-review-batches/:id` | rename success, empty name validation, forbidden cross-team batch |
| `POST /recording-review-batches/:id/attempts` | browser recording attempt, uploaded audio attempt, invalid audio type, sort order assigned |
| `GET /recording-review-attempts/:id/transcript` | success with utterances, processing state, no transcript yet, forbidden |
| `POST /playbooks` | admin success, sales forbidden, duplicate version |
| `POST /playbooks/:id/sections` | valid section, missing tags, invalid effective/expiry date |
| `POST /playbook-chat-sessions` | create session, forbidden role, missing title |
| `GET /playbook-chat-sessions/:id` | owner/team access, forbidden, messages ordered by created_at |
| `POST /playbook-chat-sessions/:id/messages` | answer with citation, abstain, prompt injection text, expired source excluded |
| `POST /playbook-messages/:id/feedback` | useful/not useful feedback, forbidden, invalid value |
| `GET /onboarding/tracks` | sales sees assigned tracks, manager sees team tracks, cross-team hidden |
| `GET /onboarding/tracks/:id` | track detail, topic ordering, badge rule, forbidden track |
| `PUT /onboarding/tracks/:id` | update topic order, invalid source ref, forbidden sales role |
| `POST /onboarding/track-topics/:topicId/complete` | valid completion, score below threshold, duplicate completion |
| `POST /onboarding/senario-completions` | linked Senario passes topic, score below threshold keeps in progress, badge unlock |
| `GET /onboarding/users/:id/progress` | self access, manager team access, cross-team forbidden |

## 6.1 Backend Error Handling Test Matrix

| Rule | Required Test |
|---|---|
| no `unwrap`/`expect`/`panic!` in production code | CI runs clippy with `clippy::unwrap_used`, `clippy::expect_used`, `clippy::panic` denied |
| validation error | invalid DTO returns 422 and `VALIDATION_ERROR` |
| domain invariant error | invalid status transition returns 409 and `INVALID_STATE` |
| permission error | cross-team access returns 403 and `FORBIDDEN` |
| repository not found | missing entity returns 404 and `NOT_FOUND` |
| upstream error | Botnoi/Turso/storage failure returns 502/503 and `UPSTREAM_ERROR` |
| unexpected error | response hides internal detail but logs trace id |

## 7. WSS Test Matrix

| Scenario | Expected |
|---|---|
| valid `session.start` | returns `session.ready` |
| audio chunk before session start | returns error |
| ASR partial received | emits `asr.partial` |
| ASR final received | stores sales turn |
| TTS fails | emits retryable error |
| client disconnects | marks session abandoned |
| session ends normally | creates training result |

## 8. Frontend Test Matrix

| Component | Tests |
|---|---|
| `BatchOverview` | empty list, create batch, run batch, open batch detail |
| `BatchDetail` | audio/document item status progress, selected item result, partial failure state |
| `RecordingReviewBatches` | create batch, select input mode, select training rubric, open batch detail |
| `RecordingReviewDetail` | attempt 1/2/3 comparison, latest score, improvement, draft/queued/scored attempts, rename batch, add record/upload attempt, live mic input meter, stop recording confirmation before queue |
| `AttemptReviewModal` | play/pause state, SRT timestamp rendering, speaker label, play segment, editable ASR segment with edited indicator, empty/processing transcript |
| `TrainingRubricTable` | list rubrics, draft/published status, validation tests |
| `AskChatPage` | create session, switch session, send message, show citations, show abstain state |
| `AudioUploader` | file type validation, size validation, upload progress, error state |
| `TranscriptViewer` | timestamp rendering, empty transcript, speaker labels |
| `ScorecardSummary` | score bands, critical flags, evidence open |
| `VoiceSessionPanel` | state transitions, partial transcript, TTS playback, disconnect |
| `OnboardingProgress` | track percent, topic status rendering, locked topic, passed linked Senario topic, badge earned state |
| `CitationList` | source display, missing citation warning |

## 9. Mock Strategy

| Dependency | Unit Test | Integration Test |
|---|---|---|
| Botnoi ASR | mock client returns transcript | use recorded fixture response |
| Botnoi TTS | mock client returns audio URL | use fixture audio response |
| Turso | repository mock | test database |
| Storage | in-memory/local temp | local-compatible storage |
| Playbook Search | deterministic fake sections/snippets | fixture-based FTS/BM25 results |

## 10. Edge Cases Catalog

### Audio

- empty file
- unsupported extension
- supported extension but invalid content
- file too large
- batch with no items
- batch with mixed audio/document items
- batch run while already processing
- recording review batch with no attempts
- recording review attempt order skips number
- browser recording permission denied
- browser recording saved but upload fails
- uploaded recording uses unsupported format
- attempt 1 has no score but attempt 2 is queued
- one item fails while other items score successfully
- audio duration too short
- audio duration too long
- no speech detected
- Thai/English mixed speech
- low confidence transcript

### Scoring

- required phrase said with different wording
- prohibited phrase appears in customer speech, not sales speech
- price mentioned without condition
- transcript missing timestamp
- duplicate evidence

### Playbook Search/Q&A

- no approved playbook section
- draft section retrieved accidentally
- expired promotion section retrieved accidentally
- conflicting section versions
- prompt injection in pasted question
- citation points to wrong section

### WSS

- reconnect after network drop
- session start twice
- audio chunk arrives out of order
- TTS response delayed
- user ends session while AI is speaking

### Permission

- sales opens another sales submission
- manager opens cross-team data
- sales attempts score override
- admin action without admin role

## 11. CI Gates

Minimum gates for MVP:

- Rust format check
- Rust clippy
- Rust unit tests
- API integration tests
- frontend lint
- frontend unit tests
- build frontend
- coverage report

Suggested coverage gates:

- domain >= 95%
- application >= 90%
- API handlers >= 85%
- frontend critical components >= 80%

## 12. PR Checklist

- tests cover success and failure paths
- edge cases added for risky logic
- mocks assert expected calls
- API error response shape verified
- permission test added for protected route
- audit log tested for sensitive action
- UI has loading, empty, error and success state
- no test depends on real Botnoi API unless marked integration
