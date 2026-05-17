# Backend Architecture Standard

มาตรฐาน backend ของ SaleSync ใช้แนวทางเดียวกับ `Rayato159/quests-tracker` ในระดับ architecture คือ **Domain-Driven Design + Clean Architecture** โดยปรับ HTTP adapter จากตัวอย่างให้ใช้ **Actix Web** ตาม decision ของโปรเจกต์นี้

Reference:

- GitHub: `https://github.com/Rayato159/quests-tracker`
- Pattern สำคัญจาก repo อ้างอิง: `application/usecases`, `domain/entities`, `domain/repositories`, `domain/value_objects`, `infrastructure/{http,database,auth}`

## 1. Architecture Rule

Dependency direction ต้องเป็นแบบนี้:

```text
infrastructure -> application -> domain
```

Rules:

- `domain` ห้าม import `actix_web`, database client, storage client, Botnoi client หรือ playbook-search provider
- `application` เรียก dependency ผ่าน trait ที่อยู่ใน `domain/repositories` หรือ `application/ports`
- `infrastructure` เป็นที่เดียวที่รู้จัก framework, database, external API และ protocol
- HTTP handler ต้องบางที่สุด ทำหน้าที่ validate/extract request แล้วเรียก use case
- business rule ต้องอยู่ใน use case หรือ domain method ไม่ใช่ใน route handler

## 2. Folder Structure

ใช้ single Rust package structure แบบ repo อ้างอิงก่อน ยังไม่ต้องแตก workspace หลาย crate ใน MVP

```text
src/
  main.rs
  lib.rs

  config/
    mod.rs
    config_loader.rs
    config_model.rs
    stage.rs

  domain/
    mod.rs
    entities/
      mod.rs
      audio_submission.rs
      scorecard.rs
      playbook.rs
      recording_review.rs
      voice_session.rs
      onboarding.rs
    repositories/
      mod.rs
      audio_submissions.rs
      transcripts.rs
      scorecards.rs
      playbooks.rs
      recording_review_batches.rs
      recording_review_attempts.rs
      voice_sessions.rs
      onboarding.rs
      transaction_provider.rs
    value_objects/
      mod.rs
      audio_submission_model.rs
      transcript_model.rs
      scorecard_model.rs
      qa_message_model.rs
      recording_review_model.rs
      voice_session_model.rs
      onboarding_model.rs
      status.rs

  application/
    mod.rs
    usecases/
      mod.rs
      audio_submission.rs
      audio_processing.rs
      scorecard_review.rs
      recording_review.rs
      recording_review_processing.rs
      playbook_management.rs
      playbook_answering.rs
      playbook_indexing.rs
      voice_roleplay.rs
      onboarding_progress.rs

  infrastructure/
    mod.rs
    actix_http/
      mod.rs
      http_serve.rs
      middleware.rs
      default_routes.rs
      routers/
        mod.rs
        audio_submissions.rs
        scorecards.rs
        recording_review_batches.rs
        playbooks.rs
        qa.rs
        voice_sessions.rs
        onboarding.rs
    turso/
      mod.rs
      turso_connector.rs
      repositories/
        mod.rs
        audio_submissions.rs
        transcripts.rs
        scorecards.rs
        recording_review_batches.rs
        recording_review_attempts.rs
        playbooks.rs
        voice_sessions.rs
        onboarding.rs
    storage/
      mod.rs
      object_storage.rs
    botnoi/
      mod.rs
      asr_client.rs
      tts_client.rs
    playbook_search/
      mod.rs
      fts_search_client.rs
    jwt_authentication/
      mod.rs
      jwt_model.rs
      authentication_model.rs

  tests/
```

## 3. Layer Responsibilities

### 3.1 Domain Layer

เก็บ business concepts และ contracts

Allowed:

- entity structs
- value objects
- repository traits
- status enums
- conversion จาก request-like model ไป entity ถ้าไม่ผูก framework
- pure validation หรือ domain transition

Forbidden:

- `actix_web`
- SQL query
- HTTP client
- Botnoi API call
- file storage operation
- environment variable read

### 3.2 Application Layer

เก็บ use cases และ orchestration

Allowed:

- use case structs เช่น `AudioProcessingUseCase`
- รับ repository/client traits ผ่าน generic หรือ `Arc<dyn Trait>`
- orchestrate flow เช่น upload -> ASR -> transcript -> scoring
- transaction boundary ผ่าน `transaction_provider`

Forbidden:

- direct SQL
- framework response type
- direct Botnoi SDK/client ถ้าไม่ผ่าน port/trait

### 3.3 Infrastructure Layer

เก็บ adapter ทั้งหมด

Allowed:

- Actix Web routers, extractors, middleware, websocket handler
- Turso repository implementation
- storage implementation
- Botnoi ASR/TTS client
- playbook search client
- JWT authentication
- config loading

## 4. Naming Convention

| Type | Convention | Example |
|---|---|---|
| Entity | `{Thing}Entity` | `AudioSubmissionEntity` |
| Request/DTO model | `{Action}{Thing}Model` | `CreateAudioSubmissionModel` |
| Repository trait | `{Thing}Repository` | `AudioSubmissionsRepository` |
| Repository implementation | `{Thing}Turso` | `AudioSubmissionsTurso` |
| Use case | `{Thing}UseCase` | `AudioProcessingUseCase` |
| Router file | plural domain name | `audio_submissions.rs` |

## 5. Route Construction Standard

แต่ละ router ต้องประกอบ dependency เหมือน pattern ของ repo อ้างอิง:

```rust
pub fn routes(db_pool: Arc<TursoPool>, storage: Arc<StorageClient>) -> Scope {
    let audio_repo = AudioSubmissionsTurso::new(Arc::clone(&db_pool));
    let transcript_repo = TranscriptsTurso::new(Arc::clone(&db_pool));
    let botnoi_asr = BotnoiAsrClient::new();

    let use_case = AudioProcessingUseCase::new(
        Arc::new(audio_repo),
        Arc::new(transcript_repo),
        Arc::clone(&storage),
        Arc::new(botnoi_asr),
    );

    web::scope("/audio-submissions")
        .app_data(web::Data::new(use_case))
        .route("", web::post().to(create))
        .route("/{submission_id}/file", web::post().to(upload_file))
        .route("/{submission_id}/process", web::post().to(process))
}
```

## 6. Handler Standard

Handler ทำแค่:

1. extract state/path/json/multipart
2. check authentication/authorization ผ่าน middleware หรือ extractor
3. call use case
4. map result เป็น HTTP response

ห้ามใส่ business rule เช่น score calculation, Senario scenario logic หรือ playbook answer policy ใน handler

## 7. Error Handling Standard

Production backend code ห้ามใช้:

- `unwrap()`
- `expect()`
- `panic!()`
- `todo!()` หรือ `unimplemented!()` ใน code path ที่ deploy ได้

ให้ใช้ `Result` และ error mapping ชัดเจนทุก layer แทน

### 7.1 Crate Policy

| Crate | ใช้ที่ไหน | Rule |
|---|---|---|
| `anyhow` | bootstrap, infrastructure adapter, provider client, migration/worker boundary | ใช้เพื่อ attach context ให้ external error แต่ห้ามส่ง `anyhow::Error` ออกเป็น HTTP response ตรง ๆ |
| `thiserror` | domain/application/infrastructure typed error | ใช้สร้าง error enum ที่ caller ตรวจชนิด error ได้ |
| `serde` | DTO serialization/deserialization | ใช้กับ request/response DTO และ integration boundary |
| `validator` หรือ validation function | request/application validation | ใช้ validate DTO ก่อนแปลงเข้า command/entity |

หลักการ:

- `anyhow::Context` ใช้ได้เมื่อ error มาจาก IO, env, network, Botnoi, Turso หรือ storage เพื่อเพิ่ม context
- domain และ application ต้อง expose typed error เช่น `DomainError`, `UseCaseError`, `RepositoryError`
- handler ต้อง map typed error เป็น `ApiErrorResponse` ตาม status code ที่ควบคุมได้
- ห้ามใช้ string matching เพื่อแยก error type

### 7.2 Error Type ต่อ Layer

```text
domain error
  -> application error
    -> infrastructure/handler maps to API error response
```

ตัวอย่าง:

```rust
#[derive(Debug, thiserror::Error)]
pub enum AudioSubmissionError {
    #[error("audio submission not found")]
    NotFound,

    #[error("invalid status transition from {from} to {to}")]
    InvalidStatusTransition { from: String, to: String },

    #[error("scorecard template does not match submission metadata")]
    ScorecardTemplateMismatch,
}

#[derive(Debug, thiserror::Error)]
pub enum UseCaseError {
    #[error(transparent)]
    AudioSubmission(#[from] AudioSubmissionError),

    #[error("permission denied")]
    PermissionDenied,

    #[error("external provider failed: {provider}")]
    ProviderFailed {
        provider: &'static str,
        #[source]
        source: anyhow::Error,
    },
}
```

### 7.3 API Error Response

HTTP layer ต้องตอบ error shape เดียวกัน:

```rust
#[derive(Debug, serde::Serialize)]
pub struct ApiErrorResponse {
    pub code: String,
    pub message: String,
    pub details: Option<serde_json::Value>,
    pub trace_id: Option<String>,
}
```

ตัวอย่าง mapping:

| Error | HTTP | code |
|---|---:|---|
| validation fail | 422 | `VALIDATION_ERROR` |
| not found | 404 | `NOT_FOUND` |
| permission denied | 403 | `FORBIDDEN` |
| invalid status transition | 409 | `INVALID_STATE` |
| Botnoi/Turso/storage temporary failure | 502/503 | `UPSTREAM_ERROR` |
| unexpected internal error | 500 | `INTERNAL_ERROR` |

## 8. DTO และ Model Boundary Standard

ต้องมี DTO หรือ model แยกตาม layer เพื่อไม่ให้ framework/database/external provider shape หลุดเข้ามาใน domain

```text
HTTP Request DTO
  -> Application Command DTO
    -> Domain Entity / Value Object
      -> Repository DTO / Row Model
        -> Database

External Provider DTO
  -> Application Provider Result DTO
    -> Domain Value Object
```

### 8.1 DTO Types

| Layer | Naming | ตัวอย่าง | Rule |
|---|---|---|---|
| HTTP request | `{Action}{Thing}Request` | `CreateAudioSubmissionRequest` | derive `Deserialize`, validate input shape |
| HTTP response | `{Thing}Response` | `AudioSubmissionResponse` | derive `Serialize`, ไม่ expose internal field |
| Application command | `{Action}{Thing}Command` | `CreateAudioSubmissionCommand` | validated แล้ว, ใช้ใน use case |
| Application result | `{Thing}ResultDto` | `AudioSubmissionResultDto` | output จาก use case |
| Domain entity/value object | `{Thing}Entity`, `{Thing}Status` | `AudioSubmissionEntity` | enforce invariant |
| Repository row/model | `{Thing}Row` หรือ `{Thing}Record` | `AudioSubmissionRow` | map กับ Turso schema |
| Provider DTO | `{Provider}{Action}Request/Response` | `BotnoiAsrResponse` | เฉพาะ infrastructure adapter |

### 8.2 Mapping Rule

- HTTP DTO validate basic shape เช่น required field, enum, file type, max length
- Application command validate permission/context เช่น role, owner, team scope
- Domain entity validate business invariant เช่น status transition, score range, template match
- Repository row map nullable/database format ให้เป็น domain type แบบ explicit
- Provider DTO ต้องถูก normalize ก่อนส่งเข้า use case/domain

ตัวอย่าง:

```rust
impl TryFrom<CreateAudioSubmissionRequest> for CreateAudioSubmissionCommand {
    type Error = ValidationError;

    fn try_from(request: CreateAudioSubmissionRequest) -> Result<Self, Self::Error> {
        if request.title.trim().is_empty() {
            return Err(ValidationError::MissingField("title"));
        }

        Ok(Self {
            title: request.title.trim().to_owned(),
            topic: request.topic,
            customer_segment: request.customer_segment,
            product: request.product,
            region: request.region,
            language: request.language,
            scorecard_template_id: request.scorecard_template_id,
        })
    }
}
```

### 8.3 Handler Mapping Example

```rust
pub async fn create(
    use_case: web::Data<AudioSubmissionUseCase>,
    body: web::Json<CreateAudioSubmissionRequest>,
) -> Result<HttpResponse, ApiError> {
    let command = CreateAudioSubmissionCommand::try_from(body.into_inner())?;
    let result = use_case.create(command).await?;
    Ok(HttpResponse::Created().json(AudioSubmissionResponse::from(result)))
}
```

`ApiError` ต้อง implement `ResponseError` เพื่อควบคุม status code และ `ApiErrorResponse`

## 9. Repository Trait Standard

Repository trait อยู่ใน `domain/repositories`

```rust
#[async_trait]
pub trait AudioSubmissionsRepository {
    async fn create(&self, entity: AudioSubmissionEntity) -> Result<String, RepositoryError>;
    async fn find_by_id(&self, id: &str) -> Result<Option<AudioSubmissionEntity>, RepositoryError>;
    async fn update_status(&self, id: &str, status: AudioSubmissionStatus) -> Result<(), RepositoryError>;
}
```

Implementation สำหรับ Turso อยู่ใน `infrastructure/turso/repositories`

## 10. External Provider Standard

Botnoi, storage และ playbook search ต้องมี trait/port เพื่อ mock ได้

ตำแหน่งที่แนะนำ:

- trait: `application/usecases` หรือ `domain/repositories` ถ้าเป็น persistence contract
- implementation: `infrastructure/botnoi`, `infrastructure/storage`, `infrastructure/playbook_search`
- `playbook_search` ต้องรองรับ provider adapter อย่างน้อย `turso_fts`, และเตรียม interface สำหรับ `kotaemon_leann` โดยไม่ให้ domain/application layer ผูกกับ Python/RAG SDK โดยตรง

Provider implementation ใช้ `anyhow::Context` ได้ แต่ต้อง map เป็น typed provider error:

```rust
let response = client
    .send(request)
    .await
    .context("botnoi asr request failed")
    .map_err(|source| ProviderError::Temporary {
        provider: "botnoi_asr",
        source,
    })?;
```

## 11. WebSocket Standard

Voice Senario อยู่ใน:

```text
infrastructure/actix_http/routers/voice_sessions.rs
application/usecases/voice_roleplay.rs
domain/entities/voice_session.rs
domain/value_objects/voice_session_model.rs
```

Rules:

- websocket handler เก็บ protocol state เท่าที่จำเป็น
- conversation state และ scoring summary อยู่ใน use case
- Botnoi ASR/TTS call ผ่าน port/client interface
- ทุก session ต้องบันทึก `voice_sessions`, `voice_turns`, และ `training_results`

## 12. CI และ Lint Rule สำหรับ Error Safety

CI ต้องมี `cargo clippy` ที่เปิด deny rule อย่างน้อย:

```bash
cargo clippy --all-targets --all-features -- \
  -D warnings \
  -D clippy::unwrap_used \
  -D clippy::expect_used \
  -D clippy::panic
```

ข้อยกเว้น:

- test code อาจใช้ `expect` เพื่อทำให้ failure message อ่านง่ายได้เฉพาะในไฟล์ test แต่ production module ห้ามใช้
- ถ้าจำเป็นต้องใช้ใน bootstrap จริง ๆ ต้องมี comment อธิบาย invariant และ tech lead approve แต่ default คือห้าม

## 13. Testing Standard

- domain และ application test อยู่ข้างไฟล์เหมือน pattern repo อ้างอิง เช่น `audio_processing_test.rs`
- repository integration test อยู่ใน `tests/integration` หรือใต้ infrastructure พร้อม feature flag
- mock repository traits ด้วย `mockall`
- route test ต้องตรวจ status code, body shape และ permission

## 14. SaleSync Domain Mapping

| SaleSync Domain | Use Case | Repository |
|---|---|---|
| Quality Review Batch | `quality_review_batch`, `quality_review_processing` | `quality_review_batches`, `quality_review_batch_items` |
| Audio Submission | `audio_submission`, `audio_processing` | `audio_submissions`, `transcripts` |
| Scorecard | `scorecard_review` | `scorecards`, `rules` |
| Playbook | `playbook_management`, `playbook_answering` | `playbooks` |
| Recording Review Training | `recording_review`, `recording_review_processing` | `recording_review_batches`, `recording_review_attempts`, `audio_submissions`, `scorecards` |
| Voice Senario Training | `voice_roleplay` | `voice_sessions` |
| Onboarding | `onboarding_track`, `onboarding_topic_progress`, `badge_awarding` | `onboarding_tracks`, `onboarding_track_topics`, `onboarding_topic_progress`, `onboarding_badges` |
