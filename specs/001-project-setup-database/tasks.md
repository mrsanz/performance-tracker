# Tasks: Project Setup – Database, Infrastructure, and Folder Structure

**Feature Branch**: `001-project-setup-database`  
**Input**: Design documents from `/specs/001-project-setup-database/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure that all user stories will build upon

- [ ] T001 Create root project structure: src/backend/, src/workers/, src/frontend/, infrastructure/, tests/
- [ ] T002 Initialize Bun project with package.json including all dependencies from research.md
- [ ] T003 [P] Configure TypeScript with tsconfig.json (strict mode, paths for @/ aliases)
- [ ] T004 [P] Configure ts-standard linting in package.json and .ts-standard.yml
- [ ] T005 [P] Create .env.example with DATABASE_URL, PORT, HOST, CORS_ORIGIN, NODE_ENV, APP_VERSION
- [ ] T006 [P] Create .gitignore excluding .env, node_modules, dist/, data/
- [ ] T007 [P] Create VSCode settings in .vscode/extensions.json recommending Bun, Tailwind, Drizzle, Effect extensions
- [ ] T008 [P] Create README.md with project overview and link to quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create Drizzle ORM configuration in src/backend/database/drizzle.config.ts
- [ ] T010 Create Person schema in src/backend/database/schema/persons.ts with all fields per data-model.md
- [ ] T011 Create PerformanceEvent schema in src/backend/database/schema/performance-events.ts with personId FK
- [ ] T012 Create database types export in src/backend/database/schema/index.ts
- [ ] T013 Create database client connection in src/backend/database/client.ts using Bun SQLite
- [ ] T014 Create migration 0001_create_persons.sql (up/down) per data-model.md
- [ ] T015 Create migration 0000_create_performance_events.sql (up/down) per data-model.md
- [ ] T016 Create migration runner script in src/backend/database/migrate.ts with idempotent logic
- [ ] T017 Create database seeding script in src/backend/database/seed.ts generating 5 Persons and 60 PerformanceEvents
- [ ] T018 Add db:migrate, db:migrate:down, db:seed, db:generate, db:reset, db:studio scripts to package.json
- [ ] T019 Create Fastify app initialization in src/backend/index.ts
- [ ] T020 Create environment validation plugin in src/backend/plugins/env.ts using fastify-env
- [ ] T021 Create database plugin in src/backend/plugins/db.ts registering Drizzle client
- [ ] T022 Create CORS plugin in src/backend/plugins/cors.ts with environment-based whitelist per research.md
- [ ] T023 Create Effect error handling utilities in src/backend/lib/errors.ts
- [ ] T024 Add dev:server, build:server, test scripts to package.json

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Developer boots project locally (Priority: P1) 🎯 MVP

**Goal**: Enable developers to clone, install, run migrations, and start the server with health endpoints

**Independent Test**: Clone repo, run `bun install && bun run db:migrate && bun run dev:server`, verify server starts and `/healthz` returns success

### Implementation for User Story 1

- [ ] T025 [P] [US1] Create health check plugin in src/backend/plugins/health.ts implementing /healthz endpoint per contracts/api.md
- [ ] T026 [P] [US1] Create info endpoint plugin in src/backend/plugins/info.ts implementing /infoz endpoint per contracts/api.md
- [ ] T027 [US1] Register health and info plugins in src/backend/index.ts
- [ ] T028 [US1] Create example query in src/backend/database/queries/performance-events.ts demonstrating personId + timestamp filter
- [ ] T029 [US1] Add startup validation in src/backend/index.ts checking database connection and failing fast with clear errors
- [ ] T030 [US1] Create development startup script that runs migrations and starts server
- [ ] T031 [US1] Update quickstart.md Setup section with exact clone, install, migrate, run steps
- [ ] T032 [US1] Verify SC-001: Clone to running server takes <10 minutes
- [ ] T033 [US1] Verify SC-002: /healthz returns app version, database connection, latest migration
- [ ] T034 [US1] Verify SC-002a: /infoz returns server status and version
- [ ] T035 [US1] Verify SC-003: Migrations are idempotent when run multiple times
- [ ] T036 [US1] Verify SC-007: Server fails to start with clear error when DATABASE_URL missing
- [ ] T037 [US1] Verify SC-012: Person and PerformanceEvent schemas created with FK relationship
- [ ] T038 [US1] Verify SC-013: `bun run db:seed` creates 5 Persons and 20 PerformanceEvents

**Checkpoint**: Developer can now run the full backend stack locally with health endpoints

---

## Phase 4: User Story 2 - Infrastructure and configuration ready for deployment (Priority: P2)

**Goal**: Docker image builds, Helm charts render, environment variables load correctly

**Independent Test**: Build Docker image, verify it runs; render Helm charts, verify manifests generated

### Implementation for User Story 2

- [ ] T039 [P] [US2] Create Dockerfile in infrastructure/Dockerfile with multi-stage build for Bun app
- [ ] T040 [P] [US2] Create .dockerignore excluding .env, node_modules, tests, specs
- [ ] T041 [P] [US2] Create Helm chart structure in infrastructure/helm/performance-tracker/
- [ ] T042 [P] [US2] Create Helm Chart.yaml with app metadata and version from package.json
- [ ] T043 [P] [US2] Create Helm values.yaml with configurable replicas, image, env vars, resources
- [ ] T044 [P] [US2] Create Helm deployment.yaml template for app deployment
- [ ] T045 [P] [US2] Create Helm service.yaml template for app service
- [ ] T046 [P] [US2] Create Helm configmap.yaml template for non-secret configuration
- [ ] T047 [P] [US2] Create Helm secret.yaml template for sensitive configuration (DATABASE_URL)
- [ ] T048 [US2] Add build:docker script to package.json using package.json version tag
- [ ] T049 [US2] Create docker-compose.yml for local container testing
- [ ] T050 [US2] Update quickstart.md Docker section with build and run commands
- [ ] T051 [US2] Verify SC-004: Docker image builds and runs server successfully
- [ ] T052 [US2] Verify SC-005: Helm chart renders manifests for app and database
- [ ] T053 [US2] Verify SC-006: No hardcoded secrets in codebase, all via env vars
- [ ] T054 [US2] Verify SC-007: App fails gracefully when required env vars missing in container

**Checkpoint**: Project is now deployable to any Kubernetes environment

---

## Phase 5: User Story 3 - Database and ORM ready for use (Priority: P3)

**Goal**: Drizzle ORM fully configured, migrations work, sample data can be seeded

**Independent Test**: Run migrations, seed data, query database using Drizzle

### Implementation for User Story 3

- [ ] T055 [P] [US3] Create query utilities in src/backend/database/queries/persons.ts with Effect-wrapped functions
- [ ] T056 [P] [US3] Create query utilities in src/backend/database/queries/performance-events.ts with Effect-wrapped functions
- [ ] T057 [US3] Add PRAGMA statements in src/backend/database/client.ts (WAL mode, foreign keys ON, synchronous NORMAL)
- [ ] T058 [US3] Create database query examples in src/backend/database/queries/examples.ts showing Person-Event joins
- [ ] T059 [US3] Update quickstart.md Database Management section with all db:* commands
- [ ] T060 [US3] Verify migrations create proper indexes per data-model.md
- [ ] T061 [US3] Verify foreign key relationship enforced (try to insert PerformanceEvent with invalid personId)
- [ ] T062 [US3] Verify example query executes successfully and returns results
- [ ] T063 [US3] Verify seed data creates variety of event types and timestamps

**Checkpoint**: Database layer is production-ready with full type safety

---

## Phase 6: User Story 4 - Development tooling and CI/CD configured (Priority: P3)

**Goal**: Linting works, VSCode extensions recommended, GitHub Actions configured

**Independent Test**: Run linter, open in VSCode, push to trigger CI/CD

### Implementation for User Story 4

- [ ] T064 [P] [US4] Create GitHub Actions workflow in .github/workflows/ci.yml with parallel jobs
- [ ] T065 [P] [US4] Configure test job in CI workflow running `bun test`
- [ ] T066 [P] [US4] Configure build job in CI workflow running `bun run build`
- [ ] T067 [P] [US4] Configure docker job in CI workflow building and pushing image
- [ ] T068 [P] [US4] Create lint script in package.json running `ts-standard`
- [ ] T069 [P] [US4] Create lint:fix script in package.json running `ts-standard --fix`
- [ ] T070 [P] [US4] Create typecheck script in package.json running `tsc --noEmit`
- [ ] T071 [P] [US4] Create pre-commit hook configuration in .husky/pre-commit running lint and typecheck
- [ ] T072 [US4] Update quickstart.md CI/CD section with workflow details
- [ ] T073 [US4] Verify SC-008: GitHub Actions runs tests, build, Docker compilation in parallel
- [ ] T074 [US4] Verify linting catches common issues (unused vars, formatting)
- [ ] T075 [US4] Verify VSCode shows extension recommendations on first open

**Checkpoint**: Code quality gates are enforced automatically

---

## Phase 7: User Story 5 - Frontend foundation configured (Priority: P2)

**Goal**: React app with Vite builds and runs, TanStack Query configured, can call backend

**Independent Test**: Run frontend dev server, verify it loads and can make API call to /healthz

### Implementation for User Story 5

- [ ] T076 [P] [US5] Initialize Vite project in src/frontend/ with React and TypeScript templates
- [ ] T077 [P] [US5] Install TanStack Query, Tailwind CSS, and component library dependencies
- [ ] T078 [P] [US5] Configure Tailwind in src/frontend/tailwind.config.ts
- [ ] T079 [P] [US5] Configure Vite proxy in src/frontend/vite.config.ts pointing to backend
- [ ] T080 [P] [US5] Create TanStack Query client setup in src/frontend/lib/query-client.ts
- [ ] T081 [P] [US5] Create API client utilities in src/frontend/lib/api-client.ts for fetch calls
- [ ] T082 [P] [US5] Create health check hook in src/frontend/hooks/useHealth.ts using TanStack Query
- [ ] T083 [P] [US5] Create basic App component in src/frontend/App.tsx displaying health status
- [ ] T084 [P] [US5] Create main entry point in src/frontend/main.tsx with QueryClientProvider
- [ ] T085 [P] [US5] Create index.html in src/frontend/
- [ ] T086 [US5] Add dev:client, build:client scripts to package.json
- [ ] T087 [US5] Add dev script to package.json running both dev:server and dev:client concurrently
- [ ] T088 [US5] Update quickstart.md with frontend startup instructions
- [ ] T089 [US5] Verify SC-009: CORS allows frontend origin from env, blocks others
- [ ] T090 [US5] Verify SC-011: Frontend dev server starts and API calls work
- [ ] T091 [US5] Verify frontend displays live health status from backend

**Checkpoint**: Full-stack application is running with frontend-backend communication

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final touches that affect multiple user stories

- [ ] T092 [P] Create comprehensive README.md with badges, features, tech stack, and quickstart link
- [ ] T093 [P] Add TSDoc comments to all exported functions per constitution requirement
- [ ] T094 [P] Create API documentation in docs/api.md based on contracts/api.md
- [ ] T095 [P] Create architecture diagram in docs/architecture.md showing plugin structure
- [ ] T096 [P] Verify SQL injection prevention: test malicious input through Drizzle (SC-010)
- [ ] T097 [P] Create example test file in tests/backend/health.test.ts using fastify.inject()
- [ ] T098 [P] Create example test file in tests/frontend/App.test.tsx using @testing-library/react
- [ ] T099 Run full quickstart.md validation from clean clone to verify all steps work
- [ ] T100 Final constitution check against all requirements in plan.md
- [ ] T101 Create release notes summarizing what was delivered per spec.md success criteria

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Can start first as P1 priority
- **User Story 2 (Phase 4)**: Depends on Foundational - Can run parallel to US1 (different files)
- **User Story 3 (Phase 5)**: Depends on Foundational - Can run parallel to US1/US2 (enhances DB layer)
- **User Story 4 (Phase 6)**: Depends on Foundational and US1 (needs working code to lint/test)
- **User Story 5 (Phase 7)**: Depends on Foundational and US1 (needs backend endpoints to call)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent after Foundational - Primary MVP
- **User Story 2 (P2)**: Independent after Foundational - Can work in parallel with US1
- **User Story 3 (P3)**: Independent after Foundational - Enhances US1's database layer
- **User Story 4 (P3)**: Depends on US1 for working code - Can start once US1 tasks T025-T030 complete
- **User Story 5 (P2)**: Depends on US1 for backend API - Can start once US1 tasks T025-T027 complete

### Within Each User Story

- Tasks marked [P] within a story can run in parallel
- Tasks without [P] have implicit dependencies on prior tasks in same story
- Verification tasks run after implementation tasks complete

### Parallel Opportunities

**Setup (Phase 1)**: Tasks T003-T008 can all run in parallel after T001-T002

**Foundational (Phase 2)**: 
- T010-T012 (schemas) can run in parallel
- T014-T015 (migrations) can run in parallel after schemas
- T020-T022 (plugins) can run in parallel after T019

**User Story 1**: Tasks T025-T026 can run in parallel

**User Story 2**: Tasks T039-T047 can all run in parallel (independent Helm/Docker files)

**User Story 3**: Tasks T055-T056 can run in parallel

**User Story 4**: Tasks T064-T071 can run in parallel

**User Story 5**: Tasks T076-T085 can run in parallel

**Polish (Phase 8)**: Tasks T092-T098 can all run in parallel

**Maximum Parallelism**: After Foundational completes, US1 + US2 + US3 can all proceed simultaneously (different file areas)

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

For fastest time-to-value, implement in this order:

1. **Phase 1 (Setup)** - Required foundation
2. **Phase 2 (Foundational)** - Required infrastructure
3. **Phase 3 (User Story 1)** - P1: Gets basic server running ✅ MVP COMPLETE HERE

At this checkpoint, developers can:
- Clone and run the project locally
- See health status
- Run migrations
- Seed sample data

### Incremental Delivery

After MVP, deliver remaining stories in priority order:

4. **Phase 7 (User Story 5)** - P2: Adds frontend (high value)
5. **Phase 4 (User Story 2)** - P2: Enables deployment (infrastructure)
6. **Phase 5 (User Story 3)** - P3: Enhances database utilities
7. **Phase 6 (User Story 4)** - P3: Adds CI/CD automation
8. **Phase 8 (Polish)** - Final quality improvements

### Parallel Team Strategy

If multiple developers available:

- **Developer A**: Setup → Foundational → User Story 1 (critical path)
- **Developer B**: Wait for Foundational → User Story 2 (Docker/Helm)
- **Developer C**: Wait for Foundational → User Story 3 (Database utilities)
- **Developer D**: Wait for US1 T025-T027 → User Story 5 (Frontend)
- **Developer E**: Wait for US1 T025-T030 → User Story 4 (CI/CD)

---

## Task Count Summary

- **Setup**: 8 tasks
- **Foundational**: 16 tasks (BLOCKS all stories)
- **User Story 1** (P1): 14 tasks ← MVP
- **User Story 2** (P2): 16 tasks
- **User Story 3** (P3): 9 tasks
- **User Story 4** (P3): 12 tasks
- **User Story 5** (P2): 16 tasks
- **Polish**: 10 tasks

**Total**: 101 tasks

**Parallel Opportunities**: 47 tasks marked [P] can run in parallel with other tasks in their phase

**MVP Task Count**: 24 tasks (Setup + Foundational + User Story 1)

---

## Success Validation

After completing all tasks, verify these outcomes from spec.md:

- ✅ SC-001: Developer setup time <10 minutes
- ✅ SC-002/SC-002a: Health and info endpoints return correct data
- ✅ SC-003: Migrations are idempotent
- ✅ SC-004: Docker image builds and runs
- ✅ SC-005: Helm charts render correctly
- ✅ SC-006: No hardcoded secrets
- ✅ SC-007: Fail-fast with clear errors
- ✅ SC-008: CI/CD runs parallel jobs
- ✅ SC-009: CORS correctly enforced
- ✅ SC-010: SQL injection prevented
- ✅ SC-011: Frontend communicates with backend
- ✅ SC-012: Person and PerformanceEvent schemas correct
- ✅ SC-013: Seed command creates sample data

All 13 success criteria must pass before considering this feature complete.
