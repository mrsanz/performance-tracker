# Research: Project Setup – Database, Infrastructure, and Folder Structure

**Feature**: 001-project-setup-database  
**Date**: 2025-10-16

## Overview

This research document captures key technical decisions, best practices, and implementation patterns for setting up a full-stack Bun + Fastify + React application with SQLite database, following the project constitution.

## Technology Decisions

### 1. Runtime: Bun

**Decision**: Use Bun as the exclusive JavaScript runtime

**Rationale**:
- Native SQLite support eliminates external dependencies
- Fast test runner built-in (replaces Jest)
- Superior performance for TypeScript execution
- Single runtime for both development and production
- Built-in package manager and bundler

**References**:
- Bun SQLite: https://bun.com/docs/api/sql#sqlite
- Bun Testing: https://bun.com/guides/test/testing-library

**Alternatives Considered**:
- Node.js: Rejected due to constitution requirement for Bun-only runtime
- Deno: Not evaluated (constitution specifies Bun)

---

### 2. Database ORM: Drizzle

**Decision**: Use Drizzle ORM with Bun's native SQLite driver

**Rationale**:
- Type-safe schema definitions with TypeScript inference
- Automatic migration generation
- SQL-like query syntax (minimal learning curve)
- Excellent Bun SQLite integration
- Lightweight with no runtime overhead
- Parameterized queries prevent SQL injection by default

**References**:
- Drizzle with Bun SQL: https://orm.drizzle.team/docs/connect-bun-sql
- Drizzle Migrations: https://orm.drizzle.team/docs/migrations
- Best Practices: https://orm.drizzle.team/

**Implementation Notes**:
- Schema files in `src/server/database/schema/`
- Migration files in `src/server/database/migrations/`
- Separate database types from API types (constitution requirement)
- Use `drizzle-kit` for migration generation

**Alternatives Considered**:
- Prisma: Heavier, generates separate client
- TypeORM: More complex, not optimized for Bun
- Raw SQL: Rejected due to lack of type safety

---

### 3. API Framework: Fastify

**Decision**: Fastify with plugin-based architecture

**Rationale**:
- High performance (benchmarked faster than Express)
- Built-in schema validation support
- Plugin system enables clean service separation
- Easy to split into microservices later
- Strong TypeScript support
- Mature ecosystem

**References**:
- Fastify Plugin Guide: https://fastify.dev/docs/latest/Guides/Write-Plugin/
- Fastify Testing: https://fastify.dev/docs/latest/Guides/Testing/
- Fastify with Zod: https://www.james-gardner.dev/posts/fastify-with-zod/

**Implementation Notes**:
- Core plugins: `src/server/plugins/`
  - `db.ts` - Database connection
  - `env.ts` - Environment configuration
  - `cors.ts` - CORS configuration
  - `health.ts` - Health check endpoints which extend infoz endpoints
- Route plugins: `src/server/routes/`
- Use `fastify.inject()` for testing (constitution requirement)
- Composable server that should be able to serve up all other paths upon final deployment.

**Plugin Structure Example**:
```typescript
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

const dbPlugin: FastifyPluginAsync = async (fastify) => {
  // Plugin implementation
}

export default fp(dbPlugin)
```

---

### 4. Frontend: React + Vite + TanStack Query

**Decision**: React SPA with Vite build tool and TanStack Query for server state

**Rationale**:
- Vite provides instant HMR and fast builds
- TanStack Query handles caching, refetching, and error states
- Type-safe API client integration
- React ecosystem maturity for data visualization
- Tailwind CSS for rapid styling

**References**:
- TanStack Query: https://tanstack.com/query/
- Vite: https://vitejs.dev/

**Implementation Notes**:
- Frontend root: `src/client/`
- API client layer with generated types
- TanStack Query for all backend communication
- Separate concerns: UI components, API hooks, types
- Production served up via main Fastify server at root path

---

### 5. Error Handling: Effect

**Decision**: Effect library for all error handling (constitution requirement)

**Rationale**:
- Explicit error handling (no silent failures)
- Railway-oriented programming pattern
- Type-safe error types
- Composable error handling

**References**:
- Effect Docs: https://effect.website/docs
- Guidelines: https://effect.website/docs/code-style/guidelines/
- Two Error Types: https://effect.website/docs/error-management/two-error-types/

**Implementation Notes**:
- All functions that can fail return `Effect<Success, Error>`
- Use `Effect.try` for external calls
- No try/catch blocks - use Effect error handling
- Database operations wrapped in Effect

**Example Pattern**:
```typescript
import { Effect } from 'effect'

export const queryDatabase = (id: string): Effect.Effect<User, DatabaseError> =>
  Effect.try({
    try: () => db.query.users.findFirst({ where: eq(users.id, id) }),
    catch: (error) => new DatabaseError({ cause: error })
  })
```

---

### 6. Validation: Zod

**Decision**: Zod for API input validation only (not for responses or database)

**Rationale**:
- Runtime type validation at API boundaries
- Excellent TypeScript integration
- Fast and lightweight
- Works well with Fastify and React

**References**:
- Validating API with Zod: https://www.wisp.blog/blog/validating-api-response-with-zod#performance-considerations

**Implementation Notes**:
- Input schemas only: `src/types/api/inputs.ts`
- Function Response types are implicit unless internally consumed (constitution requirement)
- Database types are separate (constitution requirement)

---

### 7. Environment Configuration: dotenv + fastify-env

**Decision**: dotenv for loading, fastify-env for Fastify integration

**Rationale**:
- Industry standard for environment variables
- Fastify plugin for type-safe config access
- Validation on startup (fail fast)

**References**:
- Fastify env plugin: https://dev.to/olen_d/how-to-access-dotenv-variables-using-fastify-env-plugin-2i34

**Required Environment Variables**:
```bash
# Database
DATABASE_URL=./data/performance-tracker.db

# Server
PORT=3000
HOST=localhost

# CORS
CORS_ORIGIN=http://localhost:5173

# Application
NODE_ENV=development
APP_VERSION=0.1.0
```

**Implementation Notes**:
- How to add environment variables and configuration is well described in the root `README.md`
- Disctiontion between develpment vs prodcution is documented
- `NODE_ENV=production` is the default setting unless running the app in dev mode via `bun run dev`
- `APP_VERSION` comes from the `package.json`
- `.env-local` and `.env-example` is documented
- `.env-local` and `.env-example` is generated 

---

### 8. Security: CORS

**Decision**: OWASP-compliant CORS with environment-based whitelist

**Rationale**:
- Prevents unauthorized cross-origin requests
- Environment-specific configuration (dev/prod)

**Implementation Notes**:
- CORS origins from environment variables
- Strict origin validation
- No wildcard (*) in production

**CORS Configuration**:
```typescript
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true
})
```

---

### 9. Infrastructure: Docker + Kubernetes + Helm

**Decision**: Docker for containerization, Helm for Kubernetes deployment

**Rationale**:
- Docker provides consistent runtime environment
- Kubernetes enables scaling and orchestration
- Helm simplifies deployment configuration
- Local development parity with production

**Implementation Notes**:
- Dockerfile(s) in `infrastructure/docker`
- Helm charts in `infrastructure/helm/`
- docker helm and migration commands aliased to bun scripts
- Configuratble app deployments for api, frontend, database and workflows (seperate or all in one deployment)
- Seperate chart for database and worklows clearly specifycing memory and cpu limits.
- Environment-specific values files

---

### 10. CI/CD: GitHub Actions

**Decision**: GitHub Actions with parallel jobs

**Rationale**:
- Native GitHub integration
- Parallel execution for speed
- Free for public repos
- Matrix builds for multiple environments

**Pipeline Jobs**:
1. **Test**: Run Bun test suite
2. **Build**: Compile TypeScript, bundle frontend
3. **Docker**: Build and push Docker image

**Implementation Notes**:
- Workflow file: `.github/workflows/ci.yml`
- Jobs run in parallel
- Cache dependencies for speed
- Fail fast on errors

---

### 11. Development Tooling

**Decision**: ts-standard for linting, VSCode extensions for DX

**Rationale**:
- ts-standard: Zero-config TypeScript linter
- Consistent code style across team
- VSCode extensions improve productivity

**Required VSCode Extensions**:
- Bun for TypeScript
- Tailwind CSS IntelliSense
- Drizzle ORM
- Effect
- GitHub Actions

**Linting Configuration**:
```json
{
  "scripts": {
    "lint": "ts-standard",
    "lint:fix": "ts-standard --fix"
  }
}
```

---

## Database Schema Design

### Initial Schema: PerformanceEvent

**Purpose**: Generic event tracking for performance analysis (foundation for future features)

**Fields**:
- `id`: UUID primary key
- `timestamp`: DateTime (indexed for time-series queries)
- `type`: String (event type discriminator)
- `payload`: JSON (flexible data structure)
- `createdAt`: DateTime (audit trail)
- `updatedAt`: DateTime (audit trail)

**Indexes**:
- Primary: `id`
- Secondary: `timestamp` (for time-range queries)
- Secondary: `type` (for event type filtering)

**Migration Strategy**:
- Idempotent migrations (can run multiple times)
- Up/down migration scripts
- Version tracking in migrations table

---


## Folder Structure

### Chosen Structure: Web Application (Option 2)

**Rationale**: Separate backend and frontend for clear boundaries, enabling future service splitting. Workers (background jobs) are defined in `src/workers/jobs` and SideQuest integration is handled via a Fastify plugin in `src/backend/plugins/sidequest.ts`. No worker HTTP endpoints are exposed; all jobs are background-only.

```
performance-tracker/
├── src/
│   ├── backend/                # Backend (Fastify)
│   │   ├── api/                # Fastify route plugins
│   │   ├── plugins/            # Fastify plugins (db, env, cors, health, sidequest)
│   │   ├── services/           # Business/domain logic
│   │   ├── models/             # Drizzle ORM schemas
│   │   └── tests/              # Backend tests
│   ├── workers/
│   │   ├── jobs/               # SideQuest job definitions and handlers (background-only)
│   │   └── tests/              # Worker unit/integration tests
│   ├── frontend/
│   │   ├── components/         # React components
│   │   ├── pages/              # Route-based pages
│   │   ├── features/           # Feature modules
│   │   ├── lib/                # Shared utilities, API clients, hooks
│   │   └── tests/              # Frontend tests
├── infrastructure/
│   ├── helm/                   # Helm charts
│   └── docker/                 # Docker configs
├── .github/
│   └── workflows/              # CI/CD
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Implementation Sequence

### Phase 0: Repository Setup
1. Initialize Bun project
2. Configure TypeScript + ts-standard
3. Setup folder structure
4. Add .gitignore, .env.example

### Phase 1: Backend Foundation
1. Install Fastify + plugins
2. Configure dotenv + fastify-env
3. Setup Drizzle ORM + Bun SQLite
4. Create initial schema (PerformanceEvent)
5. Generate first migration
6. Implement health check endpoints

### Phase 2: Frontend Foundation
1. Setup Vite + React + TypeScript
2. Configure Tailwind CSS
3. Install TanStack Query
4. Create API client layer
5. Implement basic UI shell

### Phase 3: Infrastructure
1. Create Dockerfile
2. Setup Helm charts
3. Configure GitHub Actions
4. Document deployment process

### Phase 4: Testing Setup
1. Configure Bun test runner
2. Add @testing-library for React
3. Write contract tests for db schema
4. Write example tests for backend, worker and ui frontend
4. Setup pre-commit hooks

---

## Open Questions / Future Research

All technical decisions for the initial setup spec are resolved and constitution-compliant. The workers/jobs structure is finalized: all background jobs are defined in `src/workers/jobs`, with SideQuest integration handled via a Fastify plugin in `src/backend/plugins/sidequest.ts`. No worker HTTP endpoints are exposed; jobs are background-only. See plan.md for rationale.

Future specs will address:
- Data ingestion patterns
- Advanced background job orchestration (SideQuest)
- Performance monitoring
- User authentication
