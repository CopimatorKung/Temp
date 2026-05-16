# Code Quality: 98% Coverage, Unit Tests & Edge Cases

## ระบบบริหารจัดการสมรรถนะไซเบอร์ (CSCS) — Go Testing Guidelines

> **Reference:** SRS-CSCS-v1.2 · golang-hexagonal-architecture.md · architecture-quality-metrics.md
> **Target:** 98% code coverage · table-driven tests · systematic edge cases · CI enforcement
> **Updated:** 2026-03-08

---

## สารบัญ

- [1. Testing Philosophy & Layer Targets](#1-testing-philosophy--layer-targets)
- [2. Test Structure & Naming Conventions](#2-test-structure--naming-conventions)
- [3. Table-Driven Tests](#3-table-driven-tests)
- [4. Domain Layer Tests (Pure Functions)](#4-domain-layer-tests-pure-functions)
- [5. Application Layer Tests (Mock Ports)](#5-application-layer-tests-mock-ports)
- [6. Infrastructure Layer Tests (Testcontainers)](#6-infrastructure-layer-tests-testcontainers)
- [7. Transport Layer Tests (HTTP Handlers)](#7-transport-layer-tests-http-handlers)
- [8. Consumer / RabbitMQ Tests](#8-consumer--rabbitmq-tests)
- [9. Edge Cases Catalog](#9-edge-cases-catalog)
- [10. Mock Strategy](#10-mock-strategy)
- [11. Coverage Enforcement & CI](#11-coverage-enforcement--ci)
- [12. Benchmarks & Performance Tests](#12-benchmarks--performance-tests)
- [13. Quick Reference](#13-quick-reference)

---

## 1. Testing Philosophy & Layer Targets

### 1.1 The Testing Pyramid for Hexagonal Architecture

```
                    ┌──────────┐
                    │   E2E    │  5%  — Full stack (k6, httptest + real DB)
                   /└──────────┘\
                  /  ┌──────────┐ \
                 /   │Integration│  \  20% — Infrastructure (testcontainers)
                /    └──────────┘   \
               /   ┌──────────────┐  \
              /    │ Application  │   \  30% — Service layer (mock ports)
             /     └──────────────┘    \
            / ┌────────────────────────┐\
           /  │   Domain / Unit        │ \ 45% — Pure functions, zero dependencies
          /   └────────────────────────┘  \
         └────────────────────────────────┘
```

### 1.2 Coverage Targets per Layer

| Layer | Package Path | Coverage Target | Test Type | Rationale |
|-------|-------------|-----------------|-----------|-----------|
| **Domain** | `internal/domain/...` | **100%** | Unit (pure) | Zero I/O — no excuses |
| **Application** | `internal/application/...` | **98%** | Unit + mock ports | Core use-case logic |
| **Infrastructure** | `internal/infrastructure/...` | **90%** | Integration (testcontainers) | Adapter mapping + DB transactions |
| **Transport** | `internal/transport/...` | **95%** | HTTP handler + consumer | Request/response contract |
| **Overall** | `./internal/...` | **≥ 98%** | Mix | CI gate |

### 1.3 What Counts as "Untestable" (Exempt Lines)

Go's `go test -cover` counts all executable statements. Only these are permitted to be excluded:

```go
// Permitted exclusions — mark with //nolint:gocover or build tags:

// 1. main() entrypoint wiring (cmd/api/main.go, cmd/worker/main.go)
// 2. panic-only paths with no business logic
// 3. log.Fatal on startup (DB/Redis/AMQP dial failures)
// 4. Generated code (mocks, protobuf) — exclude via .coverignore

// NEVER exclude:
// ❌ domain logic branches
// ❌ error return paths in application services
// ❌ all case branches in switch statements
```

---

## 2. Test Structure & Naming Conventions

### 2.1 File Placement

```
internal/
├── domain/
│   └── idp/
│       ├── gap_calculator.go
│       └── gap_calculator_test.go      ← same package, white-box test
├── application/
│   └── assessment/
│       ├── service.go
│       └── service_test.go             ← same package
├── infrastructure/
│   └── persistence/
│       ├── competency_repo.go
│       └── competency_repo_test.go     ← integration tag
└── transport/
    └── http/
        └── handlers/
            ├── idp_handler.go
            └── idp_handler_test.go     ← httptest

tests/
├── architecture/                       ← Fitness Functions (see architecture-quality-metrics.md)
├── integration/                        ← Cross-layer E2E
│   └── assessment_flow_test.go
└── performance/                        ← k6 scripts (not Go tests)
    └── api_sla_test.js
```

### 2.2 Naming Convention

```go
// Pattern: Test{FunctionName}_{Scenario}_{ExpectedOutcome}

func TestCalculateDualGap_WhenPositionGapIs2_ReturnsHighPriority(t *testing.T) {}
func TestCalculateDualGap_WhenCurrentExceedsExpected_ReturnsLowPriority(t *testing.T) {}
func TestActivateVersion_WhenDraftExists_TransitionsToDraftAndDeactivatesActive(t *testing.T) {}
func TestActivateVersion_WhenNoDraftExists_ReturnsErrNotFound(t *testing.T) {}
func TestRecordAssessment_WhenDuplicatePlatformRef_ReturnsNilIdempotently(t *testing.T) {}

// Subtest pattern for table-driven:
// t.Run("{scenario}", func(t *testing.T) { ... })
```

### 2.3 Test Helpers & Test Fixtures

```go
// tests/testutil/fixtures.go — shared factory functions
package testutil

import (
	"cscs/internal/domain/competency"
	"cscs/internal/domain/user"
	"time"
)

// MakeCompetency builds a valid Competency for use in tests.
// Override fields with functional options.
func MakeCompetency(opts ...func(*competency.Competency)) *competency.Competency {
    c := &competency.Competency{
        ID:                 "comp-001",
        Code:               "dcwf-866",
        NameTH:             "ความมั่นคงระบบเครือข่าย",
        NameEN:             "Network Security",
        Type:               competency.TypeCore,
        Version:            1,
        Status:             competency.StatusActive,
        VersionDescription: "Initial version",
        IsActive:           true,
        CreatedAt:          time.Now(),
    }
    for _, opt := range opts {
        opt(c)
    }
    return c
}

// Functional option pattern for flexible test data
func WithStatus(s competency.Status) func(*competency.Competency) {
    return func(c *competency.Competency) { c.Status = s }
}

func WithVersion(v int) func(*competency.Competency) {
    return func(c *competency.Competency) { c.Version = v }
}

func WithBaseID(id string) func(*competency.Competency) {
    return func(c *competency.Competency) { c.BaseCompetencyID = &id }
}

// MakeUser builds a valid User for tests
func MakeUser(opts ...func(*user.User)) *user.User {
    u := &user.User{
        ID:               "user-001",
        Email:            "somchai@rtarf.mil.th",
        Role:             user.RolePersonnel,
        PermissionRoleID: "role-personnel",
        IsActive:         true,
    }
    for _, opt := range opts {
        opt(u)
    }
    return u
}

// AssertNoError is a concise helper (avoids repetitive if err != nil)
func AssertNoError(t *testing.T, err error) {
    t.Helper()
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
}

// AssertError asserts that err is non-nil and matches target
func AssertError(t *testing.T, err error, target error) {
    t.Helper()
    if err == nil {
        t.Fatalf("expected error %v, got nil", target)
    }
    if !errors.Is(err, target) {
        t.Fatalf("expected error %v, got %v", target, err)
    }
}
```

---

## 3. Table-Driven Tests

Table-driven tests are the **primary pattern** for all domain and application unit tests. They maximize coverage with minimal boilerplate and make edge cases self-documenting.

### 3.1 Standard Table-Driven Template

```go
func TestFunctionName(t *testing.T) {
    tests := []struct {
        name    string      // scenario description
        input   InputType   // test input(s)
        want    OutputType  // expected result
        wantErr error       // nil if no error expected
    }{
        // Happy path first
        {name: "...", input: ..., want: ..., wantErr: nil},
        // Edge cases
        {name: "...", input: ..., want: ..., wantErr: SomeErr},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel() // safe for pure functions

            got, err := FunctionUnderTest(tt.input)

            if !errors.Is(err, tt.wantErr) {
                t.Errorf("error: got %v, want %v", err, tt.wantErr)
            }
            if err == nil && got != tt.want {
                t.Errorf("result: got %v, want %v", got, tt.want)
            }
        })
    }
}
```

### 3.2 Tips for 98% Coverage with Table Tests

```
Rule 1: Every branch in an if/switch/for must have at least one test case
Rule 2: Every error return path must have a "wantErr" test case
Rule 3: Boundary values must be explicit rows (0, 1, max-1, max, max+1)
Rule 4: nil/zero-value inputs must be tested
Rule 5: The "default" branch of a switch must be tested
Rule 6: Both sides of every boolean condition must be tested
```

---

## 4. Domain Layer Tests (Pure Functions)

Domain tests have zero external dependencies — no mocks, no DB, no network. They must be fast (< 1ms each) and cover 100% of branches.

### 4.1 Gap Calculator Tests (FR-03-2, FR-03-3)

```go
// internal/domain/idp/gap_calculator_test.go
package idp_test

import (
	"cscs/internal/domain/idp"
	"testing"
)

func TestCalculateDualGap(t *testing.T) {
    tests := []struct {
        name              string
        current           int
        expectedPosition  int
        expectedRank      int
        wantGapByPosition int
        wantGapByRank     int
        wantPriority      idp.GapPriority
    }{
        // ── Happy path ──────────────────────────────────────────────────
        {
            name:              "high priority: gap_by_position >= 2",
            current:           1, expectedPosition: 3, expectedRank: 4,
            wantGapByPosition: 2, wantGapByRank: 3,
            wantPriority:      idp.GapPriorityHigh,
        },
        {
            name:              "medium priority: gap_by_position == 1",
            current:           2, expectedPosition: 3, expectedRank: 3,
            wantGapByPosition: 1, wantGapByRank: 1,
            wantPriority:      idp.GapPriorityMedium,
        },
        {
            name:              "low priority: gap_by_position == 0",
            current:           3, expectedPosition: 3, expectedRank: 4,
            wantGapByPosition: 0, wantGapByRank: 1,
            wantPriority:      idp.GapPriorityLow,
        },
        // ── Edge: current exceeds expected (over-qualified) ────────────
        {
            name:              "low priority: current > expected_position (negative gap)",
            current:           4, expectedPosition: 3, expectedRank: 3,
            wantGapByPosition: -1, wantGapByRank: -1,
            wantPriority:      idp.GapPriorityLow,
        },
        {
            name:              "max negative gap: current=5, expected=1",
            current:           5, expectedPosition: 1, expectedRank: 1,
            wantGapByPosition: -4, wantGapByRank: -4,
            wantPriority:      idp.GapPriorityLow,
        },
        // ── Edge: gap_by_position and gap_by_rank diverge ─────────────
        {
            name:              "rank gap much higher than position gap",
            current:           3, expectedPosition: 4, expectedRank: 5,
            wantGapByPosition: 1, wantGapByRank: 2,
            wantPriority:      idp.GapPriorityMedium, // priority uses position axis
        },
        // ── Boundary: exactly at boundary values ────────────────────
        {
            name:              "boundary: gap_by_position exactly 2 → high",
            current:           1, expectedPosition: 3, expectedRank: 1,
            wantGapByPosition: 2, wantGapByRank: 0,
            wantPriority:      idp.GapPriorityHigh,
        },
        {
            name:              "boundary: gap_by_position exactly 1 → medium (not high)",
            current:           2, expectedPosition: 3, expectedRank: 2,
            wantGapByPosition: 1, wantGapByRank: 0,
            wantPriority:      idp.GapPriorityMedium,
        },
        // ── Edge: all levels same ───────────────────────────────────
        {
            name:              "no gap: all levels identical",
            current:           3, expectedPosition: 3, expectedRank: 3,
            wantGapByPosition: 0, wantGapByRank: 0,
            wantPriority:      idp.GapPriorityLow,
        },
        // ── Edge: min/max level boundaries ──────────────────────────
        {
            name:              "min level: current=1, expected=1",
            current:           1, expectedPosition: 1, expectedRank: 1,
            wantGapByPosition: 0, wantGapByRank: 0,
            wantPriority:      idp.GapPriorityLow,
        },
        {
            name:              "max level: current=5, expected=5",
            current:           5, expectedPosition: 5, expectedRank: 5,
            wantGapByPosition: 0, wantGapByRank: 0,
            wantPriority:      idp.GapPriorityLow,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            got := idp.CalculateDualGap(tt.current, tt.expectedPosition, tt.expectedRank)

            if got.GapByPosition != tt.wantGapByPosition {
                t.Errorf("GapByPosition: got %d, want %d", got.GapByPosition, tt.wantGapByPosition)
            }
            if got.GapByRank != tt.wantGapByRank {
                t.Errorf("GapByRank: got %d, want %d", got.GapByRank, tt.wantGapByRank)
            }
            if got.Priority != tt.wantPriority {
                t.Errorf("Priority: got %s, want %s", got.Priority, tt.wantPriority)
            }
        })
    }
}
```

### 4.2 Expected Level Calculator Tests (FR-13-2 to FR-13-5)

```go
// internal/domain/expectedlevel/calculator_test.go
package expectedlevel_test

import (
	"cscs/internal/domain/expectedlevel"
	"testing"
)

func TestCalculate_BaseLevelByLastDigit(t *testing.T) {
    tests := []struct {
        name               string
        rankType           expectedlevel.RankType
        rankOrderLastDigit int
        tier               expectedlevel.PositionTier
        seniorityIndex     int
        wantExpectedByPos  int
        wantExpectedByRank int
    }{
        // ── Sanyabat (Commissioned) mappings (FR-13-2) ──────────────
        {
            name: "Sanyabat lastDigit=1 → base=2, mid tier, seniority=5",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 1,
            tier: expectedlevel.TierMid, seniorityIndex: 5,
            wantExpectedByPos: 2, wantExpectedByRank: 2, // base=2 + tier=0 + rank=0
        },
        {
            name: "Sanyabat lastDigit=3 → base=3",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 3,
            tier: expectedlevel.TierMid, seniorityIndex: 5,
            wantExpectedByPos: 3, wantExpectedByRank: 3,
        },
        {
            name: "Sanyabat lastDigit=5 → base=4",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 5,
            tier: expectedlevel.TierMid, seniorityIndex: 5,
            wantExpectedByPos: 4, wantExpectedByRank: 4,
        },
        {
            name: "Sanyabat lastDigit=6 → base=5 (max)",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 6,
            tier: expectedlevel.TierMid, seniorityIndex: 5,
            wantExpectedByPos: 5, wantExpectedByRank: 5,
        },
        {
            name: "Sanyabat unknown lastDigit=9 → default base=2",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 9,
            tier: expectedlevel.TierMid, seniorityIndex: 5,
            wantExpectedByPos: 2, wantExpectedByRank: 2,
        },
        // ── Prathuan (Non-commissioned) — no level 5 (FR-13-2) ──────
        {
            name: "Prathuan lastDigit=1 → base=2",
            rankType: expectedlevel.RankTypePrathuan, rankOrderLastDigit: 1,
            tier: expectedlevel.TierMid, seniorityIndex: 5,
            wantExpectedByPos: 2, wantExpectedByRank: 2,
        },
        {
            name: "Prathuan lastDigit=6 → default base=2 (no level 5 for Prathuan)",
            rankType: expectedlevel.RankTypePrathuan, rankOrderLastDigit: 6,
            tier: expectedlevel.TierMid, seniorityIndex: 5,
            wantExpectedByPos: 2, wantExpectedByRank: 2,
        },
        // ── Tier adjustments (FR-13-3) ───────────────────────────────
        {
            name: "entry tier subtracts 1",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 3,
            tier: expectedlevel.TierEntry, seniorityIndex: 5,
            wantExpectedByPos: 2, wantExpectedByRank: 2, // base=3 + tier=-1 = 2
        },
        {
            name: "executive tier adds 2",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 3,
            tier: expectedlevel.TierExecutive, seniorityIndex: 5,
            wantExpectedByPos: 5, wantExpectedByRank: 5, // base=3 + tier=+2 = 5
        },
        {
            name: "senior tier adds 1",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 1,
            tier: expectedlevel.TierSenior, seniorityIndex: 5,
            wantExpectedByPos: 3, wantExpectedByRank: 3, // base=2 + tier=+1 = 3
        },
        // ── Rank seniority adjustments (FR-13-4) ─────────────────────
        {
            name: "seniority <= 2 subtracts 1 from rank axis",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 3,
            tier: expectedlevel.TierMid, seniorityIndex: 2,
            wantExpectedByPos: 3, // no rank adj on position axis
            wantExpectedByRank: 2, // base=3 + tier=0 + rank=-1 = 2
        },
        {
            name: "seniority >= 9 adds 1 to rank axis",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 3,
            tier: expectedlevel.TierMid, seniorityIndex: 9,
            wantExpectedByPos: 3,
            wantExpectedByRank: 4, // base=3 + tier=0 + rank=+1 = 4
        },
        {
            name: "seniority 3-8 has no rank adjustment",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 3,
            tier: expectedlevel.TierMid, seniorityIndex: 5,
            wantExpectedByPos: 3,
            wantExpectedByRank: 3, // base=3 + tier=0 + rank=0 = 3
        },
        // ── Clamp boundaries (FR-13-5) ────────────────────────────────
        {
            name: "clamp: result below 1 is clamped to 1",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 1,
            tier: expectedlevel.TierEntry, seniorityIndex: 1,
            // base=2, tier=-1, rank=-1 → position=1 (clamped), rank=0→1 (clamped)
            wantExpectedByPos: 1, wantExpectedByRank: 1,
        },
        {
            name: "clamp: result above 5 is clamped to 5",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 6,
            tier: expectedlevel.TierExecutive, seniorityIndex: 10,
            // base=5, tier=+2, rank=+1 → all clamped to 5
            wantExpectedByPos: 5, wantExpectedByRank: 5,
        },
        // ── Seniority boundary exact values ───────────────────────────
        {
            name: "seniority boundary: exactly 2 → subtract",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 3,
            tier: expectedlevel.TierMid, seniorityIndex: 2,
            wantExpectedByPos: 3, wantExpectedByRank: 2,
        },
        {
            name: "seniority boundary: exactly 3 → no adjustment",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 3,
            tier: expectedlevel.TierMid, seniorityIndex: 3,
            wantExpectedByPos: 3, wantExpectedByRank: 3,
        },
        {
            name: "seniority boundary: exactly 8 → no adjustment",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 3,
            tier: expectedlevel.TierMid, seniorityIndex: 8,
            wantExpectedByPos: 3, wantExpectedByRank: 3,
        },
        {
            name: "seniority boundary: exactly 9 → add 1",
            rankType: expectedlevel.RankTypeSanyabat, rankOrderLastDigit: 3,
            tier: expectedlevel.TierMid, seniorityIndex: 9,
            wantExpectedByPos: 3, wantExpectedByRank: 4,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            got := expectedlevel.Calculate(tt.rankType, tt.rankOrderLastDigit, tt.tier, tt.seniorityIndex)

            if got.ExpectedByPosition != tt.wantExpectedByPos {
                t.Errorf("ExpectedByPosition: got %d, want %d", got.ExpectedByPosition, tt.wantExpectedByPos)
            }
            if got.ExpectedByRank != tt.wantExpectedByRank {
                t.Errorf("ExpectedByRank: got %d, want %d", got.ExpectedByRank, tt.wantExpectedByRank)
            }
        })
    }
}

func TestClamp(t *testing.T) {
    tests := []struct {
        name     string
        v, min, max int
        want     int
    }{
        {"below min", 0, 1, 5, 1},
        {"at min", 1, 1, 5, 1},
        {"in range", 3, 1, 5, 3},
        {"at max", 5, 1, 5, 5},
        {"above max", 6, 1, 5, 5},
        {"min equals max", 3, 3, 3, 3},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            // clamp is unexported — test via Calculate or export for testing
            got := expectedlevel.ClampExported(tt.v, tt.min, tt.max)
            if got != tt.want {
                t.Errorf("Clamp(%d, %d, %d) = %d, want %d", tt.v, tt.min, tt.max, got, tt.want)
            }
        })
    }
}
```

### 4.3 Competency Domain Lifecycle Tests (FR-06-2 to FR-06-7)

```go
// internal/domain/competency/versioning_test.go
package competency_test

import (
	"cscs/internal/domain/competency"
	"cscs/tests/testutil"
	"errors"
	"testing"
)

func TestCompetency_Activate(t *testing.T) {
    tests := []struct {
        name        string
        startStatus competency.Status
        wantStatus  competency.Status
        wantErr     error
    }{
        {
            name:        "draft transitions to active",
            startStatus: competency.StatusDraft,
            wantStatus:  competency.StatusActive,
            wantErr:     nil,
        },
        {
            name:        "active cannot be activated again",
            startStatus: competency.StatusActive,
            wantStatus:  competency.StatusActive, // unchanged
            wantErr:     competency.ErrNotDraft,
        },
        {
            name:        "inactive cannot be activated",
            startStatus: competency.StatusInactive,
            wantStatus:  competency.StatusInactive, // unchanged
            wantErr:     competency.ErrNotDraft,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            c := testutil.MakeCompetency(testutil.WithStatus(tt.startStatus))

            err := c.Activate()

            if !errors.Is(err, tt.wantErr) {
                t.Errorf("error: got %v, want %v", err, tt.wantErr)
            }
            if c.Status != tt.wantStatus {
                t.Errorf("status: got %s, want %s", c.Status, tt.wantStatus)
            }
            // If activation succeeded, ActivatedAt must be set
            if tt.wantErr == nil && c.ActivatedAt == nil {
                t.Error("ActivatedAt must be set after successful activation")
            }
        })
    }
}

func TestCompetency_Deactivate(t *testing.T) {
    tests := []struct {
        name        string
        startStatus competency.Status
        wantStatus  competency.Status
        wantErr     error
    }{
        {"active transitions to inactive", competency.StatusActive, competency.StatusInactive, nil},
        {"draft cannot be deactivated", competency.StatusDraft, competency.StatusDraft, competency.ErrNotActive},
        {"inactive cannot be deactivated again", competency.StatusInactive, competency.StatusInactive, competency.ErrNotActive},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            c := testutil.MakeCompetency(testutil.WithStatus(tt.startStatus))

            err := c.Deactivate()

            if !errors.Is(err, tt.wantErr) {
                t.Errorf("error: got %v, want %v", err, tt.wantErr)
            }
            if c.Status != tt.wantStatus {
                t.Errorf("status: got %s, want %s", c.Status, tt.wantStatus)
            }
        })
    }
}

func TestCompetency_SoftDelete(t *testing.T) {
    c := testutil.MakeCompetency()
    if !c.IsActive {
        t.Fatal("precondition: competency must be active before soft delete")
    }

    c.SoftDelete()

    if c.IsActive {
        t.Error("SoftDelete must set IsActive = false")
    }
    // Soft delete should NOT change status — only is_active flag
    if c.Status != competency.StatusActive {
        t.Errorf("SoftDelete must not change Status; got %s, want %s", c.Status, competency.StatusActive)
    }
}
```

---

## 5. Application Layer Tests (Mock Ports)

Application tests use mock implementations of all ports (interfaces). No real DB, Redis, or AMQP.

### 5.1 Mock Generation Strategy

```go
// Use testify/mock for all port interfaces.
// Generate with: go generate ./internal/application/...

// tests/mocks/assessment_mocks.go
package mocks

import (
	"context"
	domainassessment "cscs/internal/domain/assessment"

	"github.com/stretchr/testify/mock"
)

// MockAssessmentRepository implements domain/assessment.Repository
type MockAssessmentRepository struct{ mock.Mock }

func (m *MockAssessmentRepository) Save(ctx context.Context, a *domainassessment.Assessment) error {
    return m.Called(ctx, a).Error(0)
}

func (m *MockAssessmentRepository) FindByUserID(ctx context.Context, userID string) ([]domainassessment.Assessment, error) {
    args := m.Called(ctx, userID)
    return args.Get(0).([]domainassessment.Assessment), args.Error(1)
}

// MockMessagePublisher implements application/assessment.MessagePublisher
type MockMessagePublisher struct{ mock.Mock }

func (m *MockMessagePublisher) PublishAssessmentReceived(ctx context.Context, event interface{}) error {
    return m.Called(ctx, event).Error(0)
}

// MockIdempotencyStore implements application/assessment.IdempotencyStore
type MockIdempotencyStore struct{ mock.Mock }

func (m *MockIdempotencyStore) IsProcessed(ctx context.Context, key string) (bool, error) {
    args := m.Called(ctx, key)
    return args.Bool(0), args.Error(1)
}

func (m *MockIdempotencyStore) MarkProcessed(ctx context.Context, key string) error {
    return m.Called(ctx, key).Error(0)
}
```

### 5.2 Assessment Service Tests

```go
// internal/application/assessment/service_test.go
package assessment_test

import (
    "context"
    "errors"
    "testing"

	"cscs/internal/application/assessment"
	"cscs/tests/mocks"
	"cscs/tests/testutil"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func newTestService(
    assessmentRepo *mocks.MockAssessmentRepository,
    userRepo       *mocks.MockUserRepository,
    publisher      *mocks.MockMessagePublisher,
    idempotency    *mocks.MockIdempotencyStore,
) *assessment.Service {
    return assessment.NewService(assessmentRepo, userRepo, publisher, idempotency)
}

func TestRecordAssessment_HappyPath(t *testing.T) {
    ctx := context.Background()

    repo     := new(mocks.MockAssessmentRepository)
    userRepo := new(mocks.MockUserRepository)
    pub      := new(mocks.MockMessagePublisher)
    idem     := new(mocks.MockIdempotencyStore)

    user := testutil.MakeUser()
    req  := assessment.RecordAssessmentRequest{
        UserID:            user.ID,
        CompetencyID:      "comp-001",
        AssessorID:        "assessor-001",
        Score:             85.5,
        LevelAchieved:     "advanced",
        PlatformReference: "elearn-ref-001",
    }

    // Set up expectations
    idem.On("IsProcessed", ctx, "assessment:idem:elearn-ref-001").Return(false, nil)
    userRepo.On("FindByID", ctx, user.ID).Return(user, nil)
    repo.On("Save", ctx, mock.AnythingOfType("*assessment.Assessment")).Return(nil)
    idem.On("MarkProcessed", ctx, "assessment:idem:elearn-ref-001").Return(nil)
    pub.On("PublishAssessmentReceived", ctx, mock.Anything).Return(nil)

    svc := newTestService(repo, userRepo, pub, idem)
    err := svc.RecordAssessment(ctx, req)

    assert.NoError(t, err)
    idem.AssertExpectations(t)
    repo.AssertExpectations(t)
    pub.AssertExpectations(t)
}

func TestRecordAssessment_EdgeCases(t *testing.T) {
    ctx := context.Background()

    tests := []struct {
        name        string
        setupMocks  func(*mocks.MockAssessmentRepository, *mocks.MockUserRepository, *mocks.MockMessagePublisher, *mocks.MockIdempotencyStore)
        req         assessment.RecordAssessmentRequest
        wantErr     error
        assertMocks func(*testing.T, *mocks.MockAssessmentRepository, *mocks.MockMessagePublisher, *mocks.MockIdempotencyStore)
    }{
        // ── Idempotency: already processed ────────────────────────────
        {
            name: "duplicate platform_reference returns nil (idempotent — FR-12-4)",
            setupMocks: func(repo *mocks.MockAssessmentRepository, userRepo *mocks.MockUserRepository, pub *mocks.MockMessagePublisher, idem *mocks.MockIdempotencyStore) {
                idem.On("IsProcessed", ctx, mock.Anything).Return(true, nil) // already done
            },
            req: assessment.RecordAssessmentRequest{PlatformReference: "dup-ref"},
            wantErr: nil,
            assertMocks: func(t *testing.T, repo *mocks.MockAssessmentRepository, pub *mocks.MockMessagePublisher, idem *mocks.MockIdempotencyStore) {
                repo.AssertNotCalled(t, "Save")         // must NOT save again
                pub.AssertNotCalled(t, "PublishAssessmentReceived") // must NOT republish
            },
        },
        // ── Idempotency: Redis error → fail open ──────────────────────
        {
            name: "idempotency Redis error should propagate",
            setupMocks: func(repo *mocks.MockAssessmentRepository, userRepo *mocks.MockUserRepository, pub *mocks.MockMessagePublisher, idem *mocks.MockIdempotencyStore) {
                idem.On("IsProcessed", ctx, mock.Anything).Return(false, errors.New("redis: connection refused"))
            },
            req:     assessment.RecordAssessmentRequest{PlatformReference: "ref-001"},
            wantErr: errors.New("idempotency check"),
            assertMocks: func(t *testing.T, repo *mocks.MockAssessmentRepository, pub *mocks.MockMessagePublisher, idem *mocks.MockIdempotencyStore) {
                repo.AssertNotCalled(t, "Save")
            },
        },
        // ── User not found ────────────────────────────────────────────
        {
            name: "user not found returns error without saving",
            setupMocks: func(repo *mocks.MockAssessmentRepository, userRepo *mocks.MockUserRepository, pub *mocks.MockMessagePublisher, idem *mocks.MockIdempotencyStore) {
                idem.On("IsProcessed", ctx, mock.Anything).Return(false, nil)
                userRepo.On("FindByID", ctx, "ghost-user").Return(nil, errors.New("user: not found"))
            },
            req:     assessment.RecordAssessmentRequest{UserID: "ghost-user", PlatformReference: "ref-002"},
            wantErr: errors.New("user not found"),
            assertMocks: func(t *testing.T, repo *mocks.MockAssessmentRepository, pub *mocks.MockMessagePublisher, idem *mocks.MockIdempotencyStore) {
                repo.AssertNotCalled(t, "Save")
                pub.AssertNotCalled(t, "PublishAssessmentReceived")
            },
        },
        // ── DB save fails ─────────────────────────────────────────────
        {
            name: "repository save failure returns error without publishing",
            setupMocks: func(repo *mocks.MockAssessmentRepository, userRepo *mocks.MockUserRepository, pub *mocks.MockMessagePublisher, idem *mocks.MockIdempotencyStore) {
                idem.On("IsProcessed", ctx, mock.Anything).Return(false, nil)
                userRepo.On("FindByID", ctx, "user-001").Return(testutil.MakeUser(), nil)
                repo.On("Save", ctx, mock.Anything).Return(errors.New("pq: duplicate key"))
            },
            req:     assessment.RecordAssessmentRequest{UserID: "user-001", PlatformReference: "ref-003"},
            wantErr: errors.New("save assessment"),
            assertMocks: func(t *testing.T, repo *mocks.MockAssessmentRepository, pub *mocks.MockMessagePublisher, idem *mocks.MockIdempotencyStore) {
                pub.AssertNotCalled(t, "PublishAssessmentReceived") // must NOT publish if save fails
                idem.AssertNotCalled(t, "MarkProcessed")            // must NOT mark if save fails
            },
        },
        // ── Publish fails ─────────────────────────────────────────────
        {
            name: "publish failure returns error (message not lost — idempotency already marked)",
            setupMocks: func(repo *mocks.MockAssessmentRepository, userRepo *mocks.MockUserRepository, pub *mocks.MockMessagePublisher, idem *mocks.MockIdempotencyStore) {
                idem.On("IsProcessed", ctx, mock.Anything).Return(false, nil)
                userRepo.On("FindByID", ctx, "user-001").Return(testutil.MakeUser(), nil)
                repo.On("Save", ctx, mock.Anything).Return(nil)
                idem.On("MarkProcessed", ctx, mock.Anything).Return(nil)
                pub.On("PublishAssessmentReceived", ctx, mock.Anything).Return(errors.New("amqp: channel closed"))
            },
            req:     assessment.RecordAssessmentRequest{UserID: "user-001", PlatformReference: "ref-004"},
            wantErr: errors.New("amqp"),
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            repo     := new(mocks.MockAssessmentRepository)
            userRepo := new(mocks.MockUserRepository)
            pub      := new(mocks.MockMessagePublisher)
            idem     := new(mocks.MockIdempotencyStore)

            tt.setupMocks(repo, userRepo, pub, idem)

            svc := newTestService(repo, userRepo, pub, idem)
            err := svc.RecordAssessment(ctx, tt.req)

            if tt.wantErr != nil {
                assert.Error(t, err)
                assert.Contains(t, err.Error(), tt.wantErr.Error())
            } else {
                assert.NoError(t, err)
            }
            if tt.assertMocks != nil {
                tt.assertMocks(t, repo, pub, idem)
            }
        })
    }
}
```

### 5.3 Competency Service Tests (FR-06-3 to FR-06-6)

```go
// internal/application/competency/service_test.go
package competency_test

import (
    "context"
    "errors"
    "testing"

	appcomp "cscs/internal/application/competency"
	domaincomp "cscs/internal/domain/competency"
	"cscs/tests/mocks"
	"cscs/tests/testutil"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestActivateVersion(t *testing.T) {
    ctx := context.Background()

    tests := []struct {
        name       string
        setupMocks func(*mocks.MockCompetencyRepository, *mocks.MockAuditLogger)
        draftID    string
        actorID    string
        wantErr    error
    }{
        {
            name: "successfully activates draft → active, active → inactive",
            setupMocks: func(repo *mocks.MockCompetencyRepository, audit *mocks.MockAuditLogger) {
                draft := testutil.MakeCompetency(
                    testutil.WithStatus(domaincomp.StatusDraft),
                    testutil.WithBaseID("base-comp-001"),
                )
                repo.On("FindByID", ctx, "draft-001").Return(draft, nil)
                repo.On("ActivateVersion", ctx, "draft-001", "base-comp-001").Return(nil)
                audit.On("Log", ctx, mock.Anything).Return(nil)
            },
            draftID: "draft-001",
            actorID: "admin-001",
            wantErr: nil,
        },
        {
            name: "draft not found returns ErrNotFound",
            setupMocks: func(repo *mocks.MockCompetencyRepository, audit *mocks.MockAuditLogger) {
                repo.On("FindByID", ctx, "ghost-draft").Return(nil, domaincomp.ErrNotFound)
            },
            draftID: "ghost-draft",
            wantErr: domaincomp.ErrNotFound,
        },
        {
            name: "activating an already-active competency returns error",
            setupMocks: func(repo *mocks.MockCompetencyRepository, audit *mocks.MockAuditLogger) {
                active := testutil.MakeCompetency(testutil.WithStatus(domaincomp.StatusActive))
                repo.On("FindByID", ctx, "active-001").Return(active, nil)
                // ActivateVersion should NOT be called
            },
            draftID: "active-001",
            wantErr: domaincomp.ErrNotDraft,
        },
        {
            name: "DB transaction failure rolls back and returns error",
            setupMocks: func(repo *mocks.MockCompetencyRepository, audit *mocks.MockAuditLogger) {
                draft := testutil.MakeCompetency(
                    testutil.WithStatus(domaincomp.StatusDraft),
                    testutil.WithBaseID("base-001"),
                )
                repo.On("FindByID", ctx, "draft-002").Return(draft, nil)
                repo.On("ActivateVersion", ctx, "draft-002", "base-001").
                    Return(errors.New("pq: serialization failure"))
                // audit.Log must NOT be called if DB fails
            },
            draftID: "draft-002",
            wantErr: errors.New("pq"),
        },
        {
            name: "audit log failure does not block activation (best-effort audit)",
            setupMocks: func(repo *mocks.MockCompetencyRepository, audit *mocks.MockAuditLogger) {
                draft := testutil.MakeCompetency(
                    testutil.WithStatus(domaincomp.StatusDraft),
                    testutil.WithBaseID("base-002"),
                )
                repo.On("FindByID", ctx, "draft-003").Return(draft, nil)
                repo.On("ActivateVersion", ctx, "draft-003", "base-002").Return(nil)
                audit.On("Log", ctx, mock.Anything).Return(errors.New("audit: write failed"))
                // Service should still return nil — audit is best-effort
            },
            draftID: "draft-003",
            wantErr: nil, // activation succeeds even if audit fails
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            repo  := new(mocks.MockCompetencyRepository)
            audit := new(mocks.MockAuditLogger)
            tt.setupMocks(repo, audit)

            svc := appcomp.NewService(repo, audit)
            err := svc.ActivateVersion(ctx, tt.draftID, tt.actorID)

            if tt.wantErr != nil {
                assert.Error(t, err)
            } else {
                assert.NoError(t, err)
            }
            repo.AssertExpectations(t)
            audit.AssertExpectations(t)
        })
    }
}
```

---

## 6. Infrastructure Layer Tests (Testcontainers)

Integration tests use real PostgreSQL and Redis via `testcontainers-go`. Tagged with `//go:build integration`.

### 6.1 Test Database Setup

```go
// tests/integration/db_helpers_test.go
//go:build integration

package integration_test

import (
    "context"
    "testing"

    "github.com/testcontainers/testcontainers-go"
    "github.com/testcontainers/testcontainers-go/modules/postgres"
    "github.com/testcontainers/testcontainers-go/modules/redis"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

// containerDB spins up a PostgreSQL container for one test and tears it down after.
func containerDB(t *testing.T) *gorm.DB {
    t.Helper()
    ctx := context.Background()

    pgContainer, err := postgres.RunContainer(ctx,
        testcontainers.WithImage("postgres:16-alpine"),
        postgres.WithDatabase("cscs_test"),
        postgres.WithUsername("test"),
        postgres.WithPassword("test"),
        testcontainers.WithWaitStrategy(
            wait.ForLog("database system is ready to accept connections").
                WithOccurrence(2).WithStartupTimeout(30*time.Second),
        ),
    )
    if err != nil {
        t.Fatalf("start postgres container: %v", err)
    }
    t.Cleanup(func() { _ = pgContainer.Terminate(ctx) })

    dsn, _ := pgContainer.ConnectionString(ctx, "sslmode=disable")
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        t.Fatalf("connect gorm: %v", err)
    }

    runMigrations(t, db)
    return db
}

func runMigrations(t *testing.T, db *gorm.DB) {
    t.Helper()
    m, err := migrate.New("file://../../migrations", db.DSN())
    if err != nil {
        t.Fatalf("migrations init: %v", err)
    }
    if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
        t.Fatalf("migrations up: %v", err)
    }
}
```

### 6.2 Competency Repository Integration Tests

```go
// internal/infrastructure/persistence/competency_repo_test.go
//go:build integration

package persistence_test

import (
    "context"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
    domaincomp "cscs/internal/domain/competency"
    "cscs/internal/infrastructure/persistence"
    "cscs/tests/integration"
    "cscs/tests/testutil"
)

func TestCompetencyRepo_ActivateVersion_Atomic(t *testing.T) {
    db  := integration.ContainerDB(t)
    ctx := context.Background()
    repo := persistence.NewCompetencyRepository(db)

    // Arrange: create an active competency (v1)
    active := testutil.MakeCompetency(testutil.WithStatus(domaincomp.StatusActive))
    require.NoError(t, repo.Save(ctx, active))

    // Create a draft from it
    draft := testutil.MakeCompetency(
        testutil.WithStatus(domaincomp.StatusDraft),
        testutil.WithBaseID(active.ID),
        testutil.WithVersion(2),
    )
    require.NoError(t, repo.Save(ctx, draft))

    // Act: activate draft
    err := repo.ActivateVersion(ctx, draft.ID, active.ID)
    require.NoError(t, err)

    // Assert: draft is now active
    updatedDraft, err := repo.FindByID(ctx, draft.ID)
    require.NoError(t, err)
    assert.Equal(t, domaincomp.StatusActive, updatedDraft.Status)
    assert.NotNil(t, updatedDraft.ActivatedAt)

    // Assert: previous active is now inactive
    updatedActive, err := repo.FindByID(ctx, active.ID)
    require.NoError(t, err)
    assert.Equal(t, domaincomp.StatusInactive, updatedActive.Status)

    // Assert: database invariant — only 1 active (FF-05)
    actives, err := repo.FindActive(ctx)
    require.NoError(t, err)
    count := 0
    for _, c := range actives {
        if c.BaseCompetencyID != nil && *c.BaseCompetencyID == active.ID ||
            c.ID == active.ID {
            count++
        }
    }
    assert.Equal(t, 1, count, "exactly 1 active version per base competency")
}

func TestCompetencyRepo_ActivateVersion_RollsBackOnConflict(t *testing.T) {
    db  := integration.ContainerDB(t)
    ctx := context.Background()
    repo := persistence.NewCompetencyRepository(db)

    // Simulate concurrent activation — the partial unique index should prevent
    // a second active from being inserted
    active := testutil.MakeCompetency(testutil.WithStatus(domaincomp.StatusActive))
    require.NoError(t, repo.Save(ctx, active))

    draft1 := testutil.MakeCompetency(testutil.WithStatus(domaincomp.StatusDraft), testutil.WithBaseID(active.ID))
    draft2 := testutil.MakeCompetency(testutil.WithStatus(domaincomp.StatusDraft), testutil.WithBaseID(active.ID))
    require.NoError(t, repo.Save(ctx, draft1))
    require.NoError(t, repo.Save(ctx, draft2))

    // First activation succeeds
    require.NoError(t, repo.ActivateVersion(ctx, draft1.ID, active.ID))

    // Second activation must fail — cannot have 2 active versions
    err := repo.ActivateVersion(ctx, draft2.ID, draft1.ID)
    assert.Error(t, err, "concurrent activation must fail due to unique index")
}

func TestCompetencyRepo_SoftDelete(t *testing.T) {
    db  := integration.ContainerDB(t)
    ctx := context.Background()
    repo := persistence.NewCompetencyRepository(db)

    c := testutil.MakeCompetency()
    require.NoError(t, repo.Save(ctx, c))

    // Act: soft delete
    c.SoftDelete()
    require.NoError(t, repo.Update(ctx, c))

    // Assert: not returned in normal FindActive
    actives, err := repo.FindActive(ctx)
    require.NoError(t, err)
    for _, a := range actives {
        if a.ID == c.ID {
            t.Error("soft-deleted competency must not appear in FindActive")
        }
    }

    // Assert: still retrievable by ID (not hard deleted)
    found, err := repo.FindByID(ctx, c.ID)
    require.NoError(t, err)
    assert.False(t, found.IsActive, "is_active must be false after soft delete")
}
```

### 6.3 Redis Cache Integration Tests

```go
// internal/infrastructure/cache/idp_cache_test.go
//go:build integration

package cache_test

import (
    "context"
    "testing"
    "time"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
    "github.com/testcontainers/testcontainers-go/modules/redis"
    redisclient "github.com/redis/go-redis/v9"
    "cscs/internal/domain/idp"
    "cscs/internal/infrastructure/cache"
)

func containerRedis(t *testing.T) *redisclient.Client {
    t.Helper()
    ctx := context.Background()

    container, err := redis.RunContainer(ctx,
        testcontainers.WithImage("redis:7-alpine"),
    )
    require.NoError(t, err)
    t.Cleanup(func() { _ = container.Terminate(ctx) })

    addr, _ := container.ConnectionString(ctx)
    return redisclient.NewClient(&redisclient.Options{Addr: addr})
}

func TestIDPCache_SetAndGet(t *testing.T) {
    client := containerRedis(t)
    c   := cache.NewIDPCache(client)
    ctx := context.Background()

    records := []idp.IDP{
        {UserID: "user-001", CompetencyID: "comp-001", CurrentLevel: 2, GapByPosition: 1},
        {UserID: "user-001", CompetencyID: "comp-002", CurrentLevel: 3, GapByPosition: 0},
    }

    // Set
    require.NoError(t, c.Set(ctx, "user-001", records))

    // Get — cache hit
    got, err := c.Get(ctx, "user-001")
    require.NoError(t, err)
    assert.Len(t, got, 2)
    assert.Equal(t, records[0].CompetencyID, got[0].CompetencyID)
}

func TestIDPCache_Get_Miss(t *testing.T) {
    client := containerRedis(t)
    c   := cache.NewIDPCache(client)
    ctx := context.Background()

    // Get on non-existent key → nil, nil (cache miss)
    got, err := c.Get(ctx, "no-such-user")
    assert.NoError(t, err)
    assert.Nil(t, got, "cache miss must return nil, not error")
}

func TestIDPCache_Invalidate(t *testing.T) {
    client := containerRedis(t)
    c   := cache.NewIDPCache(client)
    ctx := context.Background()

    records := []idp.IDP{{UserID: "user-002", CompetencyID: "comp-001"}}
    require.NoError(t, c.Set(ctx, "user-002", records))

    // Invalidate
    require.NoError(t, c.Invalidate(ctx, "user-002"))

    // Get after invalidation → cache miss
    got, err := c.Get(ctx, "user-002")
    assert.NoError(t, err)
    assert.Nil(t, got, "invalidated cache must return nil")
}

func TestRateLimiter_AllowLogin(t *testing.T) {
    client := containerRedis(t)
    rl  := cache.NewRateLimiter(client)
    ctx := context.Background()

    const ip = "192.168.1.100"

    // First 5 requests should be allowed (NFR-S-3: 5 req/min)
    for i := 0; i < 5; i++ {
        allowed, err := rl.AllowLogin(ctx, ip)
        require.NoError(t, err)
        assert.True(t, allowed, "request %d should be allowed", i+1)
    }

    // 6th request must be blocked
    allowed, err := rl.AllowLogin(ctx, ip)
    require.NoError(t, err)
    assert.False(t, allowed, "6th login attempt must be blocked")
}

func TestIdempotencyStore_PreventsDuplication(t *testing.T) {
    client := containerRedis(t)
    store  := cache.NewIdempotencyStore(client)
    ctx    := context.Background()

    key := "assessment:idem:test-ref-123"

    // First check: not processed
    processed, err := store.IsProcessed(ctx, key)
    require.NoError(t, err)
    assert.False(t, processed)

    // Mark as processed
    require.NoError(t, store.MarkProcessed(ctx, key))

    // Second check: now processed
    processed, err = store.IsProcessed(ctx, key)
    require.NoError(t, err)
    assert.True(t, processed)
}
```

---

## 7. Transport Layer Tests (HTTP Handlers)

Handler tests use `net/http/httptest` to test the full request-response cycle without a real server.

### 7.1 Handler Test Pattern

```go
// internal/transport/http/handlers/idp_handler_test.go
package handlers_test

import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

	appidp "cscs/internal/application/idp"
	"cscs/internal/transport/http/handlers"
	"cscs/tests/mocks"
	"cscs/tests/testutil"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestIDPHandler_GetMyGaps(t *testing.T) {
    tests := []struct {
        name           string
        userID         string          // injected via auth middleware context
        setupMocks     func(*mocks.MockIDPService)
        wantStatusCode int
        wantBody       map[string]interface{}
    }{
        {
            name:   "returns IDP gaps for authenticated user",
            userID: "user-001",
            setupMocks: func(svc *mocks.MockIDPService) {
                svc.On("GetByUserID", mock.Anything, "user-001").Return([]appidp.IDPResponse{
                    {CompetencyID: "comp-001", GapByPosition: 1, Priority: "medium"},
                    {CompetencyID: "comp-002", GapByPosition: 0, Priority: "low"},
                }, nil)
            },
            wantStatusCode: http.StatusOK,
        },
        {
            name:   "returns 404 when user has no IDP data",
            userID: "new-user",
            setupMocks: func(svc *mocks.MockIDPService) {
                svc.On("GetByUserID", mock.Anything, "new-user").Return(nil, appidp.ErrIDPNotFound)
            },
            wantStatusCode: http.StatusNotFound,
        },
        {
            name:   "returns 500 on service error",
            userID: "user-001",
            setupMocks: func(svc *mocks.MockIDPService) {
                svc.On("GetByUserID", mock.Anything, "user-001").Return(nil, errors.New("db error"))
            },
            wantStatusCode: http.StatusInternalServerError,
        },
        {
            name:           "returns 401 when no user in context (unauthenticated)",
            userID:         "", // no user ID → simulates missing auth
            setupMocks:     func(svc *mocks.MockIDPService) {}, // no calls expected
            wantStatusCode: http.StatusUnauthorized,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            svc := new(mocks.MockIDPService)
            tt.setupMocks(svc)

            handler := handlers.NewIDPHandler(svc)
            req     := httptest.NewRequest(http.MethodGet, "/idp/me/gaps", nil)

            // Inject user ID into context (simulates auth middleware)
            if tt.userID != "" {
                req = req.WithContext(context.WithValue(req.Context(), handlers.ContextKeyUserID, tt.userID))
            }

            rec := httptest.NewRecorder()
            handler.GetMyGaps(rec, req)

            assert.Equal(t, tt.wantStatusCode, rec.Code)
            svc.AssertExpectations(t)
        })
    }
}
```

### 7.2 Integration Handler Tests (E-Learning — FR-12)

```go
// internal/transport/http/handlers/integration_handler_test.go
package handlers_test

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

	appassessment "cscs/internal/application/assessment"
	"cscs/internal/transport/http/handlers"
	"cscs/tests/mocks"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestIntegrationHandler_PostAssessment(t *testing.T) {
    tests := []struct {
        name           string
        apiKey         string
        body           interface{}
        setupMocks     func(*mocks.MockAssessmentService)
        wantStatusCode int
        wantErrorCode  string
    }{
        // ── Happy path ─────────────────────────────────────────────────
        {
            name:   "valid assessment returns 201",
            apiKey: "valid-api-key",
            body: map[string]interface{}{
                "user_id":            "user-001",
                "competency_id":      "comp-001",
                "assessor_id":        "assessor-001",
                "score":              85.5,
                "level_achieved":     "advanced",
                "platform_reference": "elearn-ref-001",
            },
            setupMocks: func(svc *mocks.MockAssessmentService) {
                svc.On("RecordAssessment", mock.Anything, mock.AnythingOfType("assessment.RecordAssessmentRequest")).
                    Return(nil)
            },
            wantStatusCode: http.StatusCreated,
        },
        // ── Authentication ─────────────────────────────────────────────
        {
            name:           "missing API key returns 401",
            apiKey:         "",
            body:           map[string]interface{}{},
            setupMocks:     func(svc *mocks.MockAssessmentService) {},
            wantStatusCode: http.StatusUnauthorized,
            wantErrorCode:  "MISSING_API_KEY",
        },
        {
            name:           "invalid API key returns 401",
            apiKey:         "wrong-key",
            body:           map[string]interface{}{},
            setupMocks:     func(svc *mocks.MockAssessmentService) {},
            wantStatusCode: http.StatusUnauthorized,
            wantErrorCode:  "INVALID_API_KEY",
        },
        // ── Validation ─────────────────────────────────────────────────
        {
            name:   "missing required fields returns 422",
            apiKey: "valid-api-key",
            body:   map[string]interface{}{"score": 85.5}, // missing user_id, competency_id, etc.
            setupMocks: func(svc *mocks.MockAssessmentService) {},
            wantStatusCode: http.StatusUnprocessableEntity,
        },
        {
            name:   "score out of range returns 422",
            apiKey: "valid-api-key",
            body: map[string]interface{}{
                "user_id": "user-001", "competency_id": "comp-001",
                "score": 150.0, // > 100
                "platform_reference": "ref-005",
            },
            setupMocks:     func(svc *mocks.MockAssessmentService) {},
            wantStatusCode: http.StatusUnprocessableEntity,
        },
        // ── Idempotency (FR-12-4) ──────────────────────────────────────
        {
            name:   "duplicate platform_reference returns 200 (idempotent)",
            apiKey: "valid-api-key",
            body: map[string]interface{}{
                "user_id": "user-001", "competency_id": "comp-001",
                "score": 85.5, "level_achieved": "advanced",
                "platform_reference": "already-processed",
            },
            setupMocks: func(svc *mocks.MockAssessmentService) {
                svc.On("RecordAssessment", mock.Anything, mock.Anything).Return(nil) // service handles idempotency internally
            },
            wantStatusCode: http.StatusCreated, // or 200 depending on design
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            svc := new(mocks.MockAssessmentService)
            tt.setupMocks(svc)

            handler := handlers.NewIntegrationHandler(svc, "valid-api-key")

            body, _ := json.Marshal(tt.body)
            req := httptest.NewRequest(http.MethodPost, "/integrations/elearning/assessments", bytes.NewReader(body))
            req.Header.Set("Content-Type", "application/json")
            if tt.apiKey != "" {
                req.Header.Set("X-API-Key", tt.apiKey)
            }

            rec := httptest.NewRecorder()
            handler.PostAssessment(rec, req)

            assert.Equal(t, tt.wantStatusCode, rec.Code)

            if tt.wantErrorCode != "" {
                var resp map[string]string
                json.NewDecoder(rec.Body).Decode(&resp)
                assert.Equal(t, tt.wantErrorCode, resp["error"])
            }
            svc.AssertExpectations(t)
        })
    }
}
```

---

## 8. Consumer / RabbitMQ Tests

Consumers are tested by directly invoking the handler with crafted `amqp.Delivery` messages.

```go
// internal/transport/consumer/assessment_consumer_test.go
package consumer_test

import (
    "encoding/json"
    "log/slog"
    "os"
    "testing"

	appidp "cscs/internal/application/idp"
	"cscs/internal/infrastructure/messaging"
	"cscs/internal/transport/consumer"
	"cscs/tests/mocks"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func makeDelivery(t *testing.T, body interface{}) amqp.Delivery {
    t.Helper()
    data, err := json.Marshal(body)
    if err != nil {
        t.Fatal(err)
    }
    return amqp.Delivery{Body: data}
}

func TestAssessmentConsumer_Handle(t *testing.T) {
    logger := slog.New(slog.NewTextHandler(os.Stderr, nil))

    tests := []struct {
        name        string
        delivery    amqp.Delivery
        setupMocks  func(*mocks.MockGapService)
        wantAck     bool
        wantNack    bool
    }{
        {
            name: "valid event triggers gap recalculation and acks",
            delivery: makeDelivery(t, messaging.AssessmentReceivedEvent{
                UserID:        "user-001",
                CompetencyID:  "comp-001",
                Score:         85.5,
                LevelAchieved: "advanced",
            }),
            setupMocks: func(svc *mocks.MockGapService) {
                svc.On("RecalculateAfterAssessment", mock.Anything,
                    appidp.RecalculateRequest{
                        UserID:       "user-001",
                        CompetencyID: "comp-001",
                        NewLevel:     "advanced",
                    },
                ).Return(nil)
            },
            wantAck:  true,
            wantNack: false,
        },
        {
            name:       "malformed JSON is nacked without requeue",
            delivery:   amqp.Delivery{Body: []byte("not-json{{{")},
            setupMocks: func(svc *mocks.MockGapService) {}, // no calls expected
            wantAck:    false,
            wantNack:   true,
        },
        {
            name: "gap service error causes nack with requeue",
            delivery: makeDelivery(t, messaging.AssessmentReceivedEvent{
                UserID: "user-001", CompetencyID: "comp-001",
            }),
            setupMocks: func(svc *mocks.MockGapService) {
                svc.On("RecalculateAfterAssessment", mock.Anything, mock.Anything).
                    Return(errors.New("db: connection lost"))
            },
            wantAck:  false,
            wantNack: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            gapSvc := new(mocks.MockGapService)
            tt.setupMocks(gapSvc)

            acked  := false
            nacked := false

            // Inject ack/nack callbacks for observation
            tt.delivery.Acknowledger = &mockAcknowledger{
                ackFn:  func() { acked = true },
                nackFn: func() { nacked = true },
            }

            c := consumer.NewAssessmentConsumer(gapSvc, logger)
            c.HandleDelivery(tt.delivery) // expose for testing

            assert.Equal(t, tt.wantAck, acked)
            assert.Equal(t, tt.wantNack, nacked)
            gapSvc.AssertExpectations(t)
        })
    }
}
```

---

## 9. Edge Cases Catalog

A systematic list of edge cases that **must** have dedicated test rows for CSCS domain logic.

### 9.1 Domain Edge Cases

| Domain | Edge Case | Test Scenario | SRS Ref |
|--------|-----------|---------------|---------|
| Gap Calculation | `current == expected` | gap = 0, priority = low | FR-03-3 |
| Gap Calculation | `current > expected` | negative gap, still low | FR-03-3 |
| Gap Calculation | `current = 1, expected = 5` | max gap = 4, high | FR-03-3 |
| Gap Calculation | Position/rank gaps diverge (pos=0, rank=2) | priority uses position axis | FR-03-2 |
| Expected Level | Sanyabat `lastDigit=6` with `entry tier + seniority≤2` | `5 - 1 - 1 = 3` | FR-13 |
| Expected Level | Any combination that would underflow (< 1) | clamp to 1 | FR-13-5 |
| Expected Level | Any combination that would overflow (> 5) | clamp to 5 | FR-13-5 |
| Expected Level | Unknown `lastDigit` (e.g., 0, 2, 4, 7, 8, 9) | falls back to default 2 | FR-13-2 |
| Expected Level | Unknown `RankType` (neither sanyabat nor prathuan) | safe default | FR-13-1 |
| Competency | Activate when already Active | `ErrNotDraft` | FR-06-2 |
| Competency | Activate when Inactive | `ErrNotDraft` | FR-06-2 |
| Competency | Create draft when draft already exists | error returned | FR-06-5 |
| Competency | Version number overflow (int) | handled gracefully | FR-06-4 |
| Competency | SoftDelete on already-inactive | `is_active = false` stays false | FR-06-8 |

### 9.2 Application Edge Cases

| Service | Edge Case | Expected Behavior |
|---------|-----------|-------------------|
| AssessmentService | `PlatformReference = ""` (empty) | validation error before save |
| AssessmentService | `Score = 0` | valid — zero is a score |
| AssessmentService | `Score = 100` | valid — max boundary |
| AssessmentService | `Score = 100.001` | validation error |
| AssessmentService | `Score = -1` | validation error |
| AssessmentService | All fields empty | validation error |
| BatchAssessment | Empty batch `[]` | succeed with 0 records |
| BatchAssessment | Batch with all duplicates | succeed with all skipped |
| BatchAssessment | Batch: some fail, some succeed | partial success — return BatchResult |
| BatchAssessment | `BatchID = ""` | validation error |
| PersonnelService | Bulk import with 0 rows | succeed with empty result |
| PersonnelService | Bulk import with invalid CSV | return row-level errors |
| PersonnelService | Move user to same team/position | no-op, no IDP recalculation event |
| ReportService | GenerateReport with invalid type | validation error, no enqueue |
| ReportService | Poll status for non-existent reportID | `ErrNotFound` |

### 9.3 Infrastructure Edge Cases

| Component | Edge Case | Expected Behavior |
|-----------|-----------|-------------------|
| Redis Cache | Redis unavailable on Set | fail open (log, return nil) |
| Redis Cache | Redis unavailable on Get | fail open (return nil, nil = cache miss) |
| Redis RateLimit | Redis unavailable | `Allow = true` (fail open — NFR-S-3 footnote) |
| Idempotency | Redis SET NX race condition | one wins, other is idempotent |
| GORM Repo | DB connection lost mid-transaction | return wrapped error, transaction rolled back |
| GORM Repo | Unique constraint violation | return domain-meaningful error |
| GORM Repo | NULL FK on optional field | handled without nil pointer panic |

### 9.4 HTTP Handler Edge Cases

| Handler | Edge Case | Expected HTTP Response |
|---------|-----------|----------------------|
| All | `Content-Type: text/plain` (wrong type) | 415 Unsupported Media Type |
| All | Malformed JSON body | 400 Bad Request |
| All | Body too large (> 1MB) | 413 Request Entity Too Large |
| Auth | Login with empty password | 422 Unprocessable Entity |
| Auth | 6th login attempt from same IP | 429 Too Many Requests |
| Competency | Activate non-draft competency | 409 Conflict |
| Competency | Create draft when draft exists | 409 Conflict |
| Integration | POST assessment without `X-API-Key` | 401 Unauthorized |
| Integration | Batch with > 500 records | 413 or 422 |
| Reports | Poll non-existent report ID | 404 Not Found |

---

## 10. Mock Strategy

### 10.1 When to Use Which Strategy

| Scenario | Strategy | Rationale |
|----------|----------|-----------|
| Domain layer tests | **No mocks** — call functions directly | Pure functions: no dependencies |
| Application layer tests | **testify/mock** for all port interfaces | Verify exact calls + argument matching |
| Infrastructure tests | **testcontainers** (real DB/Redis) | Test actual SQL, transactions, index behavior |
| HTTP handler tests | **testify/mock** for application services | Fast, controllable response scenarios |
| Consumer tests | **testify/mock** + `mockAcknowledger` | Control AMQP ack/nack behavior |

### 10.2 Mock Generation with go:generate

```go
// Add to each port interface file:

// internal/domain/competency/repository.go
//go:generate mockery --name=CompetencyRepository --output=../../../tests/mocks --outpkg=mocks

// internal/application/assessment/service.go
//go:generate mockery --name=MessagePublisher --output=../../../tests/mocks --outpkg=mocks
//go:generate mockery --name=IdempotencyStore --output=../../../tests/mocks --outpkg=mocks
```

```bash
# Install mockery
go install github.com/vektra/mockery/v2@latest

# Regenerate all mocks
go generate ./internal/...
```

### 10.3 Asserting Mock Call Order

```go
// When execution order matters (Connascence of Execution — see architecture-quality-metrics.md)
// use InOrder() to enforce call sequence

func TestRecordAssessment_CallOrder(t *testing.T) {
    ctx := context.Background()
    idem := new(mocks.MockIdempotencyStore)
    repo := new(mocks.MockAssessmentRepository)
    pub  := new(mocks.MockMessagePublisher)

    // Assert: idempotency check BEFORE save BEFORE publish
    call1 := idem.On("IsProcessed", ctx, mock.Anything).Return(false, nil)
    call2 := repo.On("Save", ctx, mock.Anything).Return(nil).NotBefore(call1)
    call3 := idem.On("MarkProcessed", ctx, mock.Anything).Return(nil).NotBefore(call2)
    pub.On("PublishAssessmentReceived", ctx, mock.Anything).Return(nil).NotBefore(call3)

    svc := assessment.NewService(repo, mocks.NewMockUserRepository(t), pub, idem)
    _ = svc.RecordAssessment(ctx, assessment.RecordAssessmentRequest{
        UserID:            "u1",
        CompetencyID:      "c1",
        PlatformReference: "ref-001",
    })

    idem.AssertExpectations(t)
    repo.AssertExpectations(t)
    pub.AssertExpectations(t)
}
```

---

## 11. Coverage Enforcement & CI

### 11.1 Generating Coverage Reports

```bash
# Run all unit tests with coverage
go test ./internal/... -coverprofile=coverage.out -covermode=atomic

# Generate HTML report
go tool cover -html=coverage.out -o coverage.html

# Show per-package summary
go tool cover -func=coverage.out | tail -1

# Run only integration tests (requires Docker)
go test ./internal/... ./tests/integration/... -tags=integration -coverprofile=coverage_integration.out

# Combined coverage (unit + integration)
gocovmerge coverage.out coverage_integration.out > coverage_full.out
go tool cover -func=coverage_full.out | grep total
```

### 11.2 Coverage Gate Script

```bash
#!/bin/bash
# scripts/check_coverage.sh
# Fails with exit 1 if total coverage < threshold

set -e

THRESHOLD=98.0

go test ./internal/... -coverprofile=coverage.out -covermode=atomic 2>/dev/null

COVERAGE=$(go tool cover -func=coverage.out | grep total | awk '{print $3}' | tr -d '%')

echo "📊 Total Coverage: ${COVERAGE}%"
echo "📏 Threshold:      ${THRESHOLD}%"

# Compare using awk (bc not always available in CI)
PASS=$(awk "BEGIN { print ($COVERAGE >= $THRESHOLD) ? 1 : 0 }")

if [ "$PASS" -eq 1 ]; then
    echo "✅ Coverage gate passed!"
    exit 0
else
    MISSING=$(awk "BEGIN { printf \"%.1f\", $THRESHOLD - $COVERAGE }")
    echo "❌ Coverage gate FAILED — ${MISSING}% below threshold"
    echo ""
    echo "Under-covered packages:"
    go tool cover -func=coverage.out | awk '$3 != "100.0%" && $1 != "total:"' | \
        awk -F: '{print $1}' | sort -u | head -20
    exit 1
fi
```

### 11.3 Per-Package Coverage Targets

```bash
# scripts/check_coverage_per_package.sh
# Enforces per-layer minimums

declare -A TARGETS=(
    ["cscs/internal/domain"]="100.0"
    ["cscs/internal/application"]="98.0"
    ["cscs/internal/infrastructure"]="90.0"
    ["cscs/internal/transport"]="95.0"
)

for PKG in "${!TARGETS[@]}"; do
    TARGET="${TARGETS[$PKG]}"
    COVERAGE=$(go tool cover -func=coverage.out | grep "$PKG" | \
        awk '{sum+=$3; count++} END {printf "%.1f", sum/count}' | tr -d '%')

    if awk "BEGIN { exit ($COVERAGE < $TARGET) }"; then
        echo "✅ $PKG: ${COVERAGE}% (target: ${TARGET}%)"
    else
        echo "❌ $PKG: ${COVERAGE}% < ${TARGET}% target"
        FAILED=1
    fi
done

[ -z "$FAILED" ] || exit 1
```

### 11.4 Makefile Targets

```makefile
# Makefile — testing targets

.PHONY: test
test: ## Run all unit tests
	go test ./internal/... -race -timeout 60s

.PHONY: test-coverage
test-coverage: ## Run tests with coverage report
	go test ./internal/... -coverprofile=coverage.out -covermode=atomic -race
	go tool cover -html=coverage.out -o coverage.html
	@echo "📊 Coverage report: coverage.html"

.PHONY: test-integration
test-integration: ## Run integration tests (requires Docker)
	go test ./internal/... ./tests/integration/... \
		-tags=integration \
		-coverprofile=coverage_integration.out \
		-covermode=atomic \
		-timeout 120s

.PHONY: test-all
test-all: test test-integration ## Run unit + integration tests

.PHONY: coverage-gate
coverage-gate: test-coverage ## Fail if total coverage < 98%
	@bash scripts/check_coverage.sh

.PHONY: coverage-by-layer
coverage-by-layer: test-coverage ## Check coverage per layer
	@bash scripts/check_coverage_per_package.sh

.PHONY: test-race
test-race: ## Run with Go race detector
	go test ./internal/... -race -count=3

.PHONY: test-short
test-short: ## Run only short tests (skip slow ones)
	go test ./internal/... -short -timeout 30s
```

### 11.5 CI Pipeline

```yaml
# .github/workflows/test.yml
name: Tests & Coverage

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  unit-tests:
    name: Unit Tests (Domain + Application + Transport)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.25.6'
          cache: true

      - name: Run unit tests with race detector
        run: go test ./internal/... -race -coverprofile=coverage.out -covermode=atomic -timeout 60s

      - name: Coverage Gate — Total ≥ 98%
        run: bash scripts/check_coverage.sh

      - name: Coverage Gate — Per Layer
        run: bash scripts/check_coverage_per_package.sh

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: coverage.out
          fail_ci_if_error: true

  integration-tests:
    name: Integration Tests (PostgreSQL + Redis)
    runs-on: ubuntu-latest
    services:
      # Alternatively, use testcontainers (no services block needed)
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.25.6'
          cache: true

      - name: Run integration tests
        run: |
          go test ./internal/infrastructure/... ./tests/integration/... \
            -tags=integration \
            -coverprofile=coverage_integration.out \
            -covermode=atomic \
            -timeout 120s

      - name: Architecture Fitness Functions
        run: go test ./tests/architecture/... -v

  quality-gate:
    name: Quality Gate (CC + Lint + Fitness)
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.25.6' }

      - name: Install linters
        run: |
          go install github.com/fzipp/gocyclo/cmd/gocyclo@latest
          go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

      - name: Cyclomatic Complexity Gate
        run: |
          VIOLATIONS=$(gocyclo -over 10 internal | wc -l | tr -d ' ')
          [ "$VIOLATIONS" -eq 0 ] || (gocyclo -over 10 internal && exit 1)

      - name: golangci-lint
        run: golangci-lint run --config .golangci.yml --timeout 5m
```

### 11.6 Excluding from Coverage

```go
// Use build tags to exclude generated files and entrypoints:

// coverage.ignore (for gocovmerge)
cmd/api/main.go
cmd/worker/main.go
tests/mocks/

// In source files — only for truly untestable OS-exit paths:
func startServer(addr string) {
    if err := http.ListenAndServe(addr, nil); err != nil {
        log.Fatal(err) //nolint:gocover — OS-level failure, not testable
    }
}
```

---

## 12. Benchmarks & Performance Tests

Benchmark tests target performance-critical paths defined by NFR-P (SRS §5.1).

### 12.1 Domain Benchmark Tests

```go
// internal/domain/expectedlevel/calculator_bench_test.go
package expectedlevel_test

import (
	"cscs/internal/domain/expectedlevel"
	"testing"
)

// BenchmarkCalculate validates NFR-P-1: expected level calculation
// must not be the bottleneck in the ≤ 500ms API response budget.
func BenchmarkCalculate(b *testing.B) {
	b.ReportAllocs()
	for i := 0; i < b.N; i++ {
		_ = expectedlevel.Calculate(
			expectedlevel.RankTypeSanyabat,
			3,
			expectedlevel.TierSenior,
			5,
		)
	}
	// Expected: < 100ns/op, 0 allocs/op (pure computation)
}

// BenchmarkCalculateDualGap_LargeIDP simulates a user with 20 competencies.
func BenchmarkCalculateDualGap_LargeIDP(b *testing.B) {
	b.ReportAllocs()
	for i := 0; i < b.N; i++ {
		for j := 0; j < 20; j++ {
			_ = idp.CalculateDualGap(j%5+1, 3, 4)
		}
	}
}
```

### 12.2 Cache Benchmark Tests

```go
// internal/infrastructure/cache/idp_cache_bench_test.go
//go:build integration

package cache_test

import (
    "context"
    "testing"
    "cscs/internal/domain/idp"
)

// BenchmarkIDPCache_Get measures Redis read latency.
// Target: < 1ms p99 for 20-competency IDP (NFR-P-2 dashboard stats)
func BenchmarkIDPCache_Get(b *testing.B) {
    client := containerRedis(b)
    c   := cache.NewIDPCache(client)
    ctx := context.Background()

    // Pre-populate cache
    records := make([]idp.IDP, 20)
    for i := range records {
        records[i] = idp.IDP{UserID: "bench-user", CompetencyID: fmt.Sprintf("comp-%02d", i)}
    }
    if err := c.Set(ctx, "bench-user", records); err != nil {
        b.Fatal(err)
    }

    b.ResetTimer()
    b.ReportAllocs()

    for i := 0; i < b.N; i++ {
        if _, err := c.Get(ctx, "bench-user"); err != nil {
            b.Fatal(err)
        }
    }
}
```

### 12.3 Benchmark Thresholds

```bash
# Run benchmarks and compare against baseline
go test ./internal/... -bench=. -benchmem -benchtime=5s | tee benchmark_current.txt

# Compare with benchstat
go install golang.org/x/perf/cmd/benchstat@latest
benchstat benchmark_baseline.txt benchmark_current.txt

# Expected results:
# BenchmarkCalculate              3ns/op     0 B/op    0 allocs/op
# BenchmarkCalculateDualGap       8ns/op     0 B/op    0 allocs/op
# BenchmarkIDPCache_Get         800µs/op   2KB B/op    8 allocs/op
```

---

## 13. Quick Reference

### Test Command Cheat Sheet

```bash
# Run specific test by name
go test ./internal/domain/idp/... -run TestCalculateDualGap -v

# Run all tests in a package with verbose output
go test ./internal/application/assessment/... -v

# Run table subtest
go test ./internal/domain/idp/... -run "TestCalculateDualGap/high_priority" -v

# Run with race detector (always in CI)
go test ./internal/... -race

# Run only short tests (skip integration)
go test ./internal/... -short

# Run integration tests
go test ./internal/... -tags=integration

# Coverage for a single package
go test ./internal/domain/idp/... -cover

# Find uncovered lines (view in browser)
go test ./internal/... -coverprofile=out.prof && go tool cover -html=out.prof
```

### Coverage Checklist per PR

```
Before merging, verify:
□ go test ./internal/... -race  → PASS (no races)
□ Total coverage ≥ 98%
□ domain/ coverage = 100%
□ application/ coverage ≥ 98%
□ All error paths have wantErr test rows
□ All boundary values tested (0, 1, min, max-1, max, max+1)
□ All switch/case branches covered (including default)
□ No new magic strings (check for CoM violations)
□ Mock expectations asserted (AssertExpectations)
□ t.Parallel() used in pure function tests
□ No t.Sleep() in tests (use channel sync or mocks)
```

### Test Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| `time.Sleep(100ms)` in tests | Flaky, slow | Use channels, mocks, or `testcontainers` ready check |
| `if err != nil { t.Fatal }` everywhere | Unreadable | Use `require.NoError(t, err)` |
| One giant test function | No parallel, hard to debug | Split into table rows |
| `_ = svc.DoSomething()` (ignoring error) | Hides bugs | Always `assert.NoError(t, err)` |
| Mock without `AssertExpectations` | Calls may never happen | Always add `mock.AssertExpectations(t)` |
| Testing implementation, not behavior | Brittle | Test return values, not internal state |
| Hard-coded UUIDs across multiple tests | Collision risk | Use `testutil.Make*` fixtures |
| Testing `log.Printf` output | Fragile | Test side effects (DB state, published events) |

---

*เอกสารจัดทำอ้างอิง SRS-CSCS-v1.2 · golang-hexagonal-architecture.md · architecture-quality-metrics.md*
*Version 1.0 | สร้าง 2026-03-08*
*[Hexagonal Architecture](./golang-hexagonal-architecture.md) · [Quality Metrics](./architecture-quality-metrics.md) · [กลับหน้าหลัก](./ISO29110/00-INDEX.md)*
