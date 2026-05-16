# SaleSync Backend

Backend will use Rust + Actix Web with DDD + Clean Architecture.

Backend coding rules:

- Production code must not use `unwrap()`, `expect()`, or `panic!()`.
- Use typed errors per layer and map them into a stable API error response.
- `anyhow` is allowed for infrastructure/bootstrap/provider context, but must not leak directly to HTTP responses.
- Each layer must have explicit DTO/model boundaries: HTTP request/response, application command/result, domain entity/value object, repository row, and external provider DTO.

The current implementation focus is the mock frontend. Backend scaffolding will follow:

- `src/domain`
- `src/application/usecases`
- `src/infrastructure/actix_http`
- `src/infrastructure/turso`
- `src/infrastructure/botnoi`
- `src/infrastructure/playbook_search`
