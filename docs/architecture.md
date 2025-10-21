# Architecture Documentation

**Performance Tracker System Architecture v0.1.0**

This document describes the architecture, design patterns, and technical decisions for the Performance Tracker application.

---

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Principles](#architecture-principles)
- [Plugin-Based Architecture](#plugin-based-architecture)
- [Data Flow](#data-flow)
- [Database Design](#database-design)
- [Error Handling Strategy](#error-handling-strategy)
- [Frontend Architecture](#frontend-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Security Architecture](#security-architecture)
- [Testing Strategy](#testing-strategy)

---

## System Overview

Performance Tracker is a full-stack application for tracking and analyzing performance events. The system follows a **plugin-based backend architecture** using Fastify, a **type-safe database layer** with Drizzle ORM, and a **modern React frontend** with server state management.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   React     │  │ TanStack     │  │  shadcn/ui      │   │
│  │   Vite      │  │ Query        │  │  Tailwind CSS   │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/JSON
                         │ (CORS Protected)
┌────────────────────────┴────────────────────────────────────┐
│                     Backend (Fastify)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Plugin System                        │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────┐  │  │
│  │  │  ENV   │  │  CORS  │  │   DB   │  │  Health  │  │  │
│  │  └────────┘  └────────┘  └────────┘  └──────────┘  │  │
│  │  ┌────────┐  ┌────────┐                             │  │
│  │  │  Info  │  │ Static │                             │  │
│  │  └────────┘  └────────┘                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│  ┌────────────────────────┴──────────────────────────────┐ │
│  │              Drizzle ORM (Effect-Wrapped)             │ │
│  └────────────────────────┬──────────────────────────────┘ │
└─────────────────────────────┴──────────────────────────────┘
                              │
┌─────────────────────────────┴──────────────────────────────┐
│                    SQLite Database                          │
│  ┌──────────────┐           ┌────────────────────────┐     │
│  │   persons    │           │  performance_events    │     │
│  │              │           │                        │     │
│  │  id (PK)     │◄──────────│  personId (FK)         │     │
│  │  email       │           │  timestamp             │     │
│  │  firstName   │           │  type                  │     │
│  │  ...         │           │  payload (JSON)        │     │
│  └──────────────┘           └────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture Principles

### Constitution-Driven Design

The application follows a strict **constitution** (architectural rules) defined in the project specification:

1. **Bun Runtime Only** - No Node.js, all scripts use Bun
2. **Fastify Plugin Architecture** - All features as Fastify plugins
3. **Drizzle ORM Only** - Type-safe database access, no raw SQL
4. **Effect-First Error Handling** - All async operations use Effect library
5. **Zod for Input Validation** - Schema-based validation for all inputs
6. **Test-Driven Development** - Tests written before implementation
7. **Environment-Based Configuration** - No hardcoded secrets
8. **Fail-Fast Startup** - Server refuses to start with invalid config

### Design Patterns

- **Plugin Pattern**: Modular, composable backend architecture
- **Repository Pattern**: Database queries encapsulated in query modules
- **Factory Pattern**: Database client, query client, plugin registration
- **Functional Error Handling**: Effect library for type-safe error propagation
- **Service Layer**: Business logic separated from HTTP handlers
- **Dependency Injection**: Fastify decorators for shared services

---

## Plugin-Based Architecture

### Fastify Plugin System

The backend uses Fastify's plugin system for modularity and testability. Each plugin is a self-contained module with clear responsibilities.

### Plugin Loading Order

Plugins are registered in a specific order to handle dependencies:

```typescript
// 1. Environment Validation (FIRST - blocks startup if invalid)
await fastify.register(envPlugin)

// 2. Database Plugin (provides db decorator)
await fastify.register(dbPlugin)

// 3. CORS Plugin (security)
await fastify.register(corsPlugin)

// 4. Health Plugin (monitoring)
await fastify.register(healthPlugin)

// 5. Info Plugin (version info)
await fastify.register(infoPlugin)

// 6. Static Plugin (frontend serving - production only)
await fastify.register(staticPlugin)
```

### Plugin Structure

```
src/backend/plugins/
├── env.ts      # Environment variable validation
├── db.ts       # Database connection and Drizzle client
├── cors.ts     # CORS configuration
├── health.ts   # /healthz endpoint
├── info.ts     # /infoz endpoint
└── static.ts   # Static file serving (production)
```

### Environment Plugin (`env.ts`)

**Purpose**: Validate all environment variables on startup using `fastify-env`.

**Configuration Schema**:
```typescript
{
  DATABASE_PATH: { type: 'string' },
  PORT: { type: 'number', default: 3000 },
  HOST: { type: 'string', default: 'localhost' },
  CORS_ORIGIN: { type: 'string', default: 'http://localhost:5173' },
  NODE_ENV: { type: 'string', default: 'development' }
}
```

**Behavior**:
- ✅ Valid config → Server starts
- ❌ Invalid config → **Server refuses to start** with clear error message

**Example Error**:
```
Error: Environment variable validation failed
Missing required variables: DATABASE_PATH
Invalid variables: PORT (expected number, got string)
```

### Database Plugin (`db.ts`)

**Purpose**: Register Drizzle ORM client with Fastify and provide database access via decorator.

**Features**:
- Creates Bun SQLite connection
- Configures PRAGMAs (WAL mode, foreign keys ON, synchronous NORMAL)
- Registers Drizzle client as `fastify.db`
- Provides access to all query modules

**Usage in Routes**:
```typescript
fastify.get('/api/events', async (request, reply) => {
  const events = await fastify.db.query.performanceEvents.findMany()
  return { data: events }
})
```

### CORS Plugin (`cors.ts`)

**Purpose**: Protect API from unauthorized origins with environment-based whitelist.

**Configuration**:
- **Development**: `http://localhost:5173` (Vite dev server)
- **Production**: Configured via `CORS_ORIGIN` environment variable

**Security**:
- Blocks requests from non-whitelisted origins
- Allows credentials for authenticated requests
- Handles preflight OPTIONS requests

### Health Plugin (`health.ts`)

**Purpose**: Provide comprehensive health check for monitoring and observability.

**Endpoint**: `GET /healthz`

**Checks**:
1. Server status (always returns app info)
2. Database connection (queries latest migration)
3. Migration state (from `__drizzle_migrations` table)

**Response**:
```json
{
  "status": "healthy",
  "app": { ... },
  "database": {
    "connected": true,
    "latestMigration": "0000_sparkling_the_hood",
    "migrationDate": "2025-10-16T12:00:00.000Z"
  },
  "timestamp": "2025-10-16T12:00:00.123Z"
}
```

**Use Cases**:
- Kubernetes liveness/readiness probes
- Load balancer health checks
- Monitoring dashboards (Grafana, Datadog, etc.)
- CI/CD smoke tests

### Info Plugin (`info.ts`)

**Purpose**: Lightweight server information without database dependency.

**Endpoint**: `GET /infoz`

**Response**:
```json
{
  "environment": "development",
  "name": "performance-tracker",
  "status": "running",
  "uptime": 3600,
  "version": "0.1.0"
}
```

**Use Cases**:
- Version discovery for clients
- Quick server status (no DB dependency)
- Debugging deployments

### Static Plugin (`static.ts`)

**Purpose**: Serve built frontend in production while preserving Vite HMR in development.

**Behavior**:

| Environment | Frontend Serving |
|-------------|------------------|
| **Development** | Vite dev server (:5173) with HMR |
| **Production** | Fastify serves built files from `src/frontend/dist` |
| **Test** | Disabled |

**Features**:
- SPA fallback: non-API routes serve `index.html`
- Production optimization: static file caching
- Development skip: preserves Vite hot reload

---

## Data Flow

### Request Lifecycle

```
1. HTTP Request
   ↓
2. Fastify Router
   ↓
3. CORS Check (cors plugin)
   ↓
4. Route Handler
   ↓
5. Input Validation (Zod schemas)
   ↓
6. Effect-Wrapped Query
   ↓
7. Drizzle ORM (parameterized query)
   ↓
8. SQLite Database
   ↓
9. Effect Result (Success | Error)
   ↓
10. HTTP Response (JSON)
```

### Example: Fetching Events

```typescript
// 1. Route handler
fastify.get('/api/events', async (request, reply) => {
  // 2. Call Effect-wrapped query
  const result = await Effect.runPromise(
    getPerformanceEvents({ limit: 20 })
  )
  
  // 3. Return result (Effect handles errors)
  return { data: result }
})

// 4. Query module (Effect-wrapped)
export const getPerformanceEvents = (params: { limit: number }) =>
  Effect.tryPromise({
    try: () => db.query.performanceEvents.findMany({
      limit: params.limit,
      orderBy: desc(performanceEvents.timestamp)
    }),
    catch: (error) => new DatabaseError({ cause: error })
  })
```

---

## Database Design

### Schema Overview

The database follows **normalized relational design** with referential integrity enforced via foreign keys.

### Entities

#### `persons` Table

Represents employees or individuals in the system.

```sql
CREATE TABLE persons (
  id TEXT PRIMARY KEY,              -- UUID
  email TEXT UNIQUE NOT NULL,       -- Unique constraint
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  title TEXT,
  startDate TEXT NOT NULL,          -- ISO 8601 date
  createdAt TEXT NOT NULL,          -- ISO 8601 timestamp
  updatedAt TEXT NOT NULL           -- ISO 8601 timestamp
);

CREATE INDEX idx_persons_email ON persons(email);
CREATE INDEX idx_persons_start_date ON persons(startDate);
```

#### `performance_events` Table

Tracks performance events associated with persons.

```sql
CREATE TABLE performance_events (
  id TEXT PRIMARY KEY,              -- UUID
  personId TEXT NOT NULL,           -- Foreign key to persons
  timestamp TEXT NOT NULL,          -- ISO 8601 timestamp
  type TEXT NOT NULL,               -- Event type (e.g., 'pr-commit')
  payload TEXT,                     -- JSON blob
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (personId) REFERENCES persons(id)
);

CREATE INDEX idx_performance_events_person_id ON performance_events(personId);
CREATE INDEX idx_performance_events_timestamp ON performance_events(timestamp);
CREATE INDEX idx_performance_events_type ON performance_events(type);
```

### Relationships

```
persons (1) ──────── (N) performance_events
   ↑                        ↓
   └──────── personId ──────┘
```

### Indexes

Strategic indexes for common query patterns:

- **persons.email**: Unique lookups, login queries
- **persons.startDate**: Date range queries, reporting
- **performance_events.personId**: Join queries, person-specific events
- **performance_events.timestamp**: Time-based queries, pagination
- **performance_events.type**: Event type filtering, analytics

### Migrations

**Migration Strategy**: Forward-only, idempotent

```
src/backend/database/migrations/
├── 0000_sparkling_the_hood.sql    # performance_events table
├── meta/
│   ├── _journal.json              # Migration history
│   └── 0000_snapshot.json         # Schema snapshot
```

**Migration Workflow**:
1. Modify Drizzle schema (`src/backend/database/schema/*.ts`)
2. Generate migration: `bun run db:generate`
3. Review generated SQL in `migrations/XXXX_*.sql`
4. Apply migration: `bun run db:migrate`

**Idempotency**: Migrations track applied changes in `__drizzle_migrations` table. Re-running migrations has no effect if already applied.

---

## Error Handling Strategy

### Effect Library

All asynchronous operations use the **Effect library** for type-safe, functional error handling.

### Error Types

```typescript
// Database errors
export class DatabaseError extends Effect.Data.Error<{
  readonly _tag: 'DatabaseError'
  readonly cause?: unknown
}> {}

// Validation errors
export class ValidationError extends Effect.Data.Error<{
  readonly _tag: 'ValidationError'
  readonly errors: Array<{ field: string; message: string }>
}> {}

// Not found errors
export class NotFoundError extends Effect.Data.Error<{
  readonly _tag: 'NotFoundError'
  readonly resource: string
  readonly id: string
}> {}
```

### Effect-Wrapped Queries

```typescript
import { Effect } from 'effect'

export const getPersonById = (id: string) =>
  Effect.tryPromise({
    try: () => db.query.persons.findFirst({
      where: eq(persons.id, id)
    }),
    catch: (error) => new DatabaseError({ cause: error })
  }).pipe(
    Effect.flatMap((person) =>
      person
        ? Effect.succeed(person)
        : Effect.fail(new NotFoundError({ resource: 'person', id }))
    )
  )
```

### Error Propagation

```typescript
// Route handler
fastify.get('/api/persons/:id', async (request, reply) => {
  const result = await Effect.runPromise(
    getPersonById(request.params.id).pipe(
      Effect.catchAll((error) => {
        if (error._tag === 'NotFoundError') {
          reply.code(404)
          return Effect.succeed({ error: 'Person not found', id: error.id })
        }
        if (error._tag === 'DatabaseError') {
          reply.code(500)
          return Effect.succeed({ error: 'Database error occurred' })
        }
        reply.code(500)
        return Effect.succeed({ error: 'Unknown error' })
      })
    )
  )
  return result
})
```

### Benefits

- **Type Safety**: Compiler knows all possible error types
- **Composability**: Chain operations with `pipe`, `flatMap`, `map`
- **Explicit Error Handling**: No silent failures
- **Testability**: Easy to mock and test error scenarios

---

## Frontend Architecture

### Technology Stack

- **React 18**: UI library with hooks
- **Vite 5**: Build tool with HMR
- **TanStack Query 5**: Server state management
- **Tailwind CSS 3**: Utility-first styling
- **shadcn/ui**: Re-usable component library
- **Radix UI**: Accessible primitives

### Project Structure

```
src/frontend/
├── src/
│   ├── components/
│   │   └── ui/               # shadcn/ui components
│   │       └── button.tsx
│   ├── hooks/
│   │   └── useHealth.ts      # TanStack Query hooks
│   ├── lib/
│   │   ├── api-client.ts     # API fetch utilities
│   │   ├── query-client.ts   # TanStack Query config
│   │   └── utils.ts          # Utility functions (cn)
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Tailwind + theme CSS
├── vite.config.ts            # Vite configuration
├── tailwind.config.ts        # Tailwind + theme config
├── tsconfig.json             # TypeScript config
└── index.html                # HTML entry point
```

### State Management

**Server State**: TanStack Query (react-query)
- Cache server responses
- Automatic refetching
- Loading/error states
- Optimistic updates

**Local State**: React useState/useReducer
- UI state (modals, forms)
- Component-specific state

### API Client Layer

```typescript
// lib/api-client.ts
export const fetchHealth = () =>
  fetch('http://localhost:3000/healthz').then((res) => res.json())

// hooks/useHealth.ts
export const useHealth = () =>
  useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30000  // Refetch every 30s
  })

// App.tsx
const { data, isLoading, error } = useHealth()
```

### Component Architecture

- **Atomic Design**: Small, reusable components
- **shadcn/ui Pattern**: Copy components into project, customize freely
- **Accessibility**: Radix UI primitives (keyboard navigation, screen readers)
- **Dark Mode**: CSS variables + Tailwind dark mode

---

## Deployment Architecture

### Development Mode

```
┌──────────────────┐         ┌──────────────────┐
│  Vite Dev Server │         │ Fastify Backend  │
│   :5173          │◄────────│   :3000          │
│   (HMR enabled)  │  Proxy  │                  │
└──────────────────┘         └──────────────────┘
         │                            │
         │                            │
         └────────── Browser ─────────┘
```

**Scripts**:
- `bun run dev` - Both servers with hot reload
- `bun run dev:server` - Backend only
- `bun run dev:client` - Frontend only

### Production Mode

```
┌───────────────────────────────────────┐
│       Fastify Server (:3000)          │
│  ┌─────────────────────────────────┐  │
│  │  /api/*     → API Routes        │  │
│  │  /healthz   → Health Plugin     │  │
│  │  /infoz     → Info Plugin       │  │
│  │  /*         → Static Files      │  │
│  │               (frontend dist)   │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

**Build Process**:
1. Build frontend: `bun run build:client` → `src/frontend/dist/`
2. Build backend: `bun run build:server` → `dist/server.js`
3. Start: `NODE_ENV=production bun run dist/server.js`

### Docker Deployment

**Multi-Stage Build**:

```dockerfile
# Stage 1: Build
FROM oven/bun:1.2.23 AS builder
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Stage 2: Production
FROM oven/bun:1.2.23-slim
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/frontend/dist ./src/frontend/dist
EXPOSE 3000
CMD ["bun", "run", "dist/server.js"]
```

### Kubernetes Deployment

**Helm Chart** (`infrastructure/helm/performance-tracker/`):

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: {{ .Values.replicas }}
  template:
    spec:
      containers:
      - name: performance-tracker
        image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_PATH
          value: /data/performance-tracker.db
        - name: NODE_ENV
          value: production
        livenessProbe:
          httpGet:
            path: /healthz
            port: 3000
        readinessProbe:
          httpGet:
            path: /healthz
            port: 3000
```

---

## Security Architecture

### Defense in Depth

1. **SQL Injection Prevention**: Drizzle ORM parameterized queries
2. **CORS Protection**: Environment-based origin whitelist
3. **Input Validation**: Zod schemas for all user input
4. **Environment Variables**: No hardcoded secrets
5. **Fail-Fast Validation**: Invalid config prevents startup
6. **Type Safety**: End-to-end TypeScript with strict mode

### OWASP Top 10 Coverage

| Vulnerability | Mitigation |
|---------------|------------|
| **Injection** | Drizzle ORM parameterization |
| **Broken Authentication** | (Planned for Spec 002) |
| **Sensitive Data Exposure** | Environment variables only |
| **XML External Entities** | Not applicable (JSON only) |
| **Broken Access Control** | (Planned for Spec 002) |
| **Security Misconfiguration** | Fail-fast env validation |
| **XSS** | React auto-escaping |
| **Insecure Deserialization** | Zod validation |
| **Components with Vulnerabilities** | Bun security updates |
| **Insufficient Logging** | Fastify logger (Pino) |

---

## Testing Strategy

### Test-Driven Development (TDD)

**Mandatory workflow**:
1. Write failing test
2. Implement feature
3. Verify test passes
4. Refactor if needed

### Testing Pyramid

```
       ┌──────────┐
       │   E2E    │  ← Smoke tests (container)
       ├──────────┤
       │Integration│  ← API + DB tests
       ├──────────┤
       │   Unit   │  ← Query, utility tests
       └──────────┘
```

### Backend Tests

**Framework**: Bun test runner

**Test Files**:
```
tests/backend/
├── database/
│   ├── examples.test.ts         # Query examples
│   ├── indexes-fk.test.ts       # Foreign keys, indexes
│   ├── schema.test.ts           # Schema validation
│   └── queries/
│       └── performance-events.test.ts
└── plugins/
    ├── health.test.ts           # Health endpoint
    └── info.test.ts             # Info endpoint
```

**Example Test**:
```typescript
import { test, expect } from 'bun:test'

test('health endpoint returns database status', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/healthz'
  })
  
  expect(response.statusCode).toBe(200)
  const json = response.json()
  expect(json.status).toBe('healthy')
  expect(json.database.connected).toBe(true)
})
```

### Frontend Tests

**Framework**: Bun test + @testing-library/react + happy-dom

**Test Files**:
```
tests/frontend/
├── setup.ts                     # Test setup (matchers)
├── preload.ts                   # DOM registration
└── dom/
    └── smoke.test.tsx           # Component rendering
```

**Example Test**:
```typescript
import { render, screen } from '@testing-library/react'
import { test, expect } from 'bun:test'

test('renders health status', () => {
  render(<App />)
  expect(screen.getByRole('heading')).toHaveTextContent('Performance Tracker')
})
```

### Integration Tests

**Database Tests**: Create test DB, run migrations, verify schema

**API Tests**: Use `fastify.inject()` to test endpoints without HTTP

**Container Tests**: `scripts/smoke-container.sh` verifies Docker image

---

## Performance Considerations

### Database Optimization

- **Indexes**: Strategic indexes on common query columns
- **WAL Mode**: Write-Ahead Logging for concurrent reads
- **Connection Pooling**: Bun SQLite connection reuse
- **Cursor Pagination**: Efficient pagination without OFFSET

### Frontend Optimization

- **Code Splitting**: Vite automatic chunk splitting
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Vite minification, compression
- **CDN-Ready**: Static assets with cache headers

### API Optimization

- **Fastify**: One of the fastest Node.js frameworks
- **Bun Runtime**: Native performance boost
- **JSON Serialization**: Fast JSON.stringify
- **Minimal Middleware**: Only essential plugins

---

## Future Enhancements

### Planned Features (Spec 002+)

- **Authentication**: JWT-based auth
- **Authorization**: Role-based access control (RBAC)
- **Real-Time Updates**: WebSockets for live data
- **Background Jobs**: SideQuest worker queue
- **Caching**: Redis for frequently accessed data
- **Rate Limiting**: Protect against abuse
- **Observability**: Structured logging, metrics, tracing
- **Multi-Tenancy**: Isolated data per organization

---

## Appendix

### Key Files

| File | Purpose |
|------|---------|
| `src/backend/index.ts` | Server entry point, plugin registration |
| `src/backend/database/client.ts` | Database connection, Drizzle client |
| `src/backend/database/schema/` | Drizzle schema definitions |
| `src/backend/plugins/` | Fastify plugins |
| `src/frontend/main.tsx` | Frontend entry point |
| `src/frontend/lib/query-client.ts` | TanStack Query configuration |
| `infrastructure/Dockerfile` | Docker multi-stage build |
| `infrastructure/helm/` | Kubernetes Helm charts |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts |
| `tsconfig.json` | TypeScript config |
| `biome.json` | Linting, formatting config |
| `bunfig.toml` | Bun test configuration |
| `vite.config.ts` | Vite build config |
| `tailwind.config.ts` | Tailwind CSS config |
| `drizzle.config.ts` | Drizzle ORM config |
| `.env.example` | Environment variable template |

---

**Version**: 0.1.0  
**Last Updated**: 2025-10-18  
**Authors**: Performance Tracker Team
