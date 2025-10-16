# Implementation Plan: Project Setup – Database, Infrastructure, and Folder Structure

**Branch**: `001-project-setup-database` | **Date**: 2025-10-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-project-setup-database/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Establish a complete full-stack development environment with SQLite database backend, Fastify API server, React frontend with Vite, and comprehensive infrastructure for local development and Kubernetes deployment. The system will use Bun as the runtime, Drizzle ORM for type-safe database access, Effect for error handling, and follow TDD practices. Includes Docker containerization, Helm charts, GitHub Actions CI/CD, and development tooling (linting, VSCode extensions). Initial database schema includes a PerformanceEvent entity for tracking performance data.

## Technical Context

**Language/Version**: TypeScript 5.x with Bun latest stable  
**Primary Dependencies**: Fastify (server), React 18+ (frontend), Vite (build), Drizzle ORM (database), Effect (error handling), TanStack Query (data fetching), Zod (validation), Tailwind CSS (styling)  
**Storage**: SQLite (via Bun's native SQLite API)  
**Testing**: Bun built-in test runner, @testing-library/react, fastify.inject()  
**Target Platform**: Linux server (Docker/Kubernetes), local development (macOS/Windows/Linux)  
**Project Type**: Web application (full-stack: backend API + frontend SPA)  
**Performance Goals**: <10 min developer onboarding, <100ms API response times, instant database queries via materialized views  
**Constraints**: SQLite single-file database, Bun runtime only (no Node.js), Effect library for all error handling, ts-standard for code style, TDD mandatory  
**Scale/Scope**: Initial setup spec (no business logic yet), foundation for multi-user performance tracking system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Status: PASS (design-level). Implementation will verify during setup PR.

- Runtime: Bun-only usage — PASS (spec + quickstart use Bun for dev/test/build)
- Server: Fastify with plugins — PASS (backend/api + backend/plugins structure)
- DB: Drizzle ORM over SQLite — PASS (data-model.md + research.md)
- Types: Zod for input validation only; responses implicit — PASS (contracts/api.md)
- Errors: Effect-first error handling — PASS (research.md plan and examples)
- Security: OWASP CORS via env whitelist — PASS (spec FRs + research config)
- Migrations: Idempotent up/down, fail-fast on invalid — PASS (spec + data-model)
- Operability: /healthz includes DB/migration; /infoz provided — PASS (contracts)
- Frontend: SPA fetches materialized views only — PASS (spec + research)
- Types sep: DB schemas vs API types — PASS (constitution + contracts notes)
- Config: dotenv + fastify-env — PASS (research + quickstart)
- CI/CD & Infra: Docker, K8s/Helm, GitHub Actions — PASS (research + quickstart)
- Code quality: ts-standard, TSDoc — PASS (research + tooling section)

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Sample Data Seeding
Include a task and script for populating the database with sample Person and PerformanceEvent data (`bun run db:seed`).

**Terminology Standardization**: All references to users/persons in this plan use 'Person' for consistency with the data model.

### Source Code (repository root)
```
src/
├── backend/
│   ├── api/           # Fastify route plugins (one file per route group)
│   ├── plugins/       # Fastify plugins (e.g., db, logger, CORS, etc.)
│   ├── services/      # Business/domain logic, injectable via plugins
│   ├── models/        # Database models (Drizzle ORM schemas)
│   └── tests/         # Backend unit/integration/contract tests
├── workers/
│   ├── jobs/          # SideQuest job definitions and handlers (background-only)
│   └── tests/         # Worker unit/integration tests
├── frontend/
│   ├── components/    # UI components (shadcn/ui, atomic design)
│   ├── pages/         # Route-based pages (Vite/React Router)
│   ├── features/      # Feature modules (state, hooks, logic)
│   ├── lib/           # Shared utilities, API clients, hooks
│   └── tests/         # Frontend unit/integration tests
```

**Structure Decision**: Workers do not expose HTTP; SideQuest runs as background-only. We consolidate integration under `src/backend/plugins/sidequest.ts` (register queues, schedulers) and keep `src/workers/jobs` for job handlers. Removed `workers/api` and `workers/plugins` to avoid redundancy with Fastify plugin architecture.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
