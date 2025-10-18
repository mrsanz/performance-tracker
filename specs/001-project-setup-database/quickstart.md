# Quick Start Guide: Performance Tracker Development

## Prerequisites

- **Bun**: Install from https://bun.sh/
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```
- **Git**: For version control
- **VSCode** (recommended): With extensions listed below

---

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd performance-tracker

# Install dependencies
bun install

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file:

```bash
# Database
# Path to SQLite database file
DATABASE_PATH=./data/performance-tracker.db

# Server
PORT=3000
HOST=localhost

# CORS (for local development)
CORS_ORIGIN=http://localhost:5173

# Application
NODE_ENV=development
# Version is read from package.json (do not set APP_VERSION in .env)
```

### 3. Initialize Database

```bash
# Run migrations (creates database and schema)
bun run db:migrate

# (Optional) Seed database with sample data
bun run db:seed

# Verify database created
ls -la data/performance-tracker.db
```

### 4. Start Development Server

```bash
# Run migrations and start server (recommended for first run)
bun run dev

# Or start just the server with hot reload:
bun run dev:server
```

The server will start on http://localhost:3000 with:
- Startup database validation (fails fast if DB unreachable)
- Hot module reloading for rapid development

---

## Verify Setup

### 1. Check Backend Health

```bash
# Health check endpoint
curl http://localhost:3000/healthz

# Expected response:
# {
#   "status": "healthy",
#   "app": {
#     "environment": "development",
#     "name": "performance-tracker",
#     "status": "running",
#     "uptime": 5,
#     "version": "0.1.0"
#   },
#   "database": {
#     "connected": true,
#     "latestMigration": "0000_ambitious_justice",
#     "migrationDate": "2025-01-01T12:00:00.000Z"
#   },
#   "timestamp": "2025-01-01T12:00:05.123Z"
# }

# Info endpoint
curl http://localhost:3000/infoz

# Expected response:
# {
#   "environment": "development",
#   "name": "performance-tracker",
#   "status": "running",
#   "uptime": 10,
#   "version": "0.1.0"
# }
```

### 2. Explore Database with Drizzle Studio

```bash
bun run db:studio
```

Opens interactive database viewer at https://local.drizzle.studio

---

## Project Structure

```
performance-tracker/
├── src/
│   ├── server/              # Fastify backend
│   │   ├── database/        # Drizzle ORM + migrations
│   │   ├── plugins/         # Fastify plugins
│   │   ├── routes/          # API routes
│   │   └── index.ts         # Server entry point
│   ├── client/              # React frontend
│   │   ├── components/      # React components
│   │   ├── hooks/           # TanStack Query hooks
│   │   ├── api/             # API client layer
│   │   └── main.tsx         # Frontend entry point
│   └── types/               # Shared types
│       ├── database/        # Database types (Drizzle)
│       └── api/             # API types (Zod schemas)
├── tests/                   # Test files
│   ├── server/              # Backend tests
│   └── client/              # Frontend tests
├── infrastructure/          # Docker, Helm, etc.
├── .env                     # Environment variables (DO NOT COMMIT)
├── .env.example             # Environment template
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

---

## Common Tasks

### Database Management

```bash
# Create new migration
bun run db:generate

# Run migrations
bun run db:migrate

# Drop database and recreate (re-runs migrations and seeds)
bun run db:reset

# Open database in Studio (Drizzle Kit)
bun run db:studio

# Populate database with sample data
bun run db:seed
```

**Note**: This project uses forward-only migrations. To undo changes, use `db:reset` to drop and recreate the database, or manually write a new migration to reverse changes.

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test tests/server/database.test.ts

# Run with coverage
bun test --coverage
```

### Linting and Formatting

```bash
# Check code style
bun run lint

# Fix code style issues
bun run lint:fix

# Type check
bun run typecheck
```

### Building

```bash
# Build backend
bun run build:workers

# Build backend
bun run build:server

# Build frontend
bun run build:client

# Build all
bun run build

# Build docker images
bun run build:docker
```

### Docker

```bash
# Build Docker image (use version from package.json) - and tag it twice
docker build -t performance-tracker:$(jq -r .version package.json) -t performance-tracker:latest ./infrastructure/Dockerfile

# Run container
docker run -p 3000:3000 --env-file .env performance-tracker:latest

# Build and run with docker-compose
docker-compose up
```

---

## VSCode Extensions

Recommended extensions (defined in `.vscode/extensions.json`):

- **Bun for Visual Studio Code**: Bun runtime support
- **Tailwind CSS IntelliSense**: CSS class completion
- **Drizzle ORM**: Schema and query IntelliSense
- **Effect**: Effect library support
- **ESLint**: Linting integration
- **GitHub Actions**: Workflow file support
- **Rest Client**: Test API endpoints in VSCode

Install all recommended extensions:
```
1. Open Command Palette (Cmd/Ctrl+Shift+P)
2. Type: "Extensions: Show Recommended Extensions"
3. Click "Install Workspace Recommended Extensions"
```

---

## Development Workflow

### 1. TDD Workflow (MANDATORY per constitution)

```bash
# 1. Write failing test
# Create test file: tests/server/feature.test.ts

# 2. Run test (should fail)
bun test tests/server/feature.test.ts

# 3. Implement feature to make test pass

# 4. Run test again (should pass)
bun test tests/server/feature.test.ts

# 5. Refactor if needed, tests still passing
```

### 2. Adding a New API Endpoint

1. **Define Zod schema** (input validation):
   ```typescript
   // src/types/api/inputs.ts
   export const CreateItemSchema = z.object({ ... })
   ```

2. **Write tests first** (TDD):
   ```typescript
   // tests/server/routes/items.test.ts
   test('should create item', async () => {
     const response = await app.inject({
       method: 'POST',
       url: '/api/items',
       payload: { ... }
     })
     expect(response.statusCode).toBe(201)
   })
   ```

3. **Implement route**:
   ```typescript
   // src/server/routes/items.ts
   export const itemsRoutes: FastifyPluginAsync = async (fastify) => {
     fastify.post('/api/items', async (request, reply) => {
       // Implementation using Effect for error handling
     })
   }
   ```

4. **Add database queries** (if needed):
   ```typescript
   // src/server/database/queries/items.ts
   export const createItem = (data) => Effect.tryPromise({ ... })
   ```

### 3. Adding a Frontend Feature

1. **Create API hook** (TanStack Query):
   ```typescript
   // src/client/hooks/useItems.ts
   export const useCreateItem = () => {
     return useMutation({
       mutationFn: (data) => apiClient.items.create(data)
     })
   }
   ```

2. **Write component tests**:
   ```typescript
   // tests/client/components/ItemForm.test.tsx
   test('should submit form', async () => {
     // Test using @testing-library/react
   })
   ```

3. **Implement component**:
   ```typescript
   // src/client/components/ItemForm.tsx
   export const ItemForm = () => {
     const { mutate } = useCreateItem()
     // Component implementation
   }
   ```

### 4. Database Schema Changes

1. **Update Drizzle schema**:
   ```typescript
   // src/server/database/schema/items.ts
   export const items = sqliteTable('items', { ... })
   ```

2. **Generate migration**:
   ```bash
   bun run db:generate
   ```

3. **Review generated migration**:
   ```bash
   cat src/server/database/migrations/XXXX_create_items.sql
   ```

4. **Run migration**:
   ```bash
   bun run db:migrate
   ```

5. **Update types** (Drizzle auto-generates):
   ```typescript
   // Types automatically available
   import { InferSelectModel } from 'drizzle-orm'
   import { items } from '../schema'
   type Item = InferSelectModel<typeof items>
   ```

---

## Troubleshooting

### Database Issues

**Problem**: `Database is locked`
```bash
# Solution: Close any open database connections
# Ensure only one process accesses the database
# Check for zombie processes
ps aux | grep bun
```

**Problem**: `Migrations table not found`
```bash
# Solution: Re-initialize database
bun run db:reset
```

### Server Won't Start

**Problem**: `Port 3000 already in use`
```bash
# Solution: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

**Problem**: `Environment variable missing`
```bash
# Solution: Ensure .env file exists and is valid
cp .env.example .env
# Edit .env with your values
```

### CORS Errors in Browser

**Problem**: `CORS policy: No 'Access-Control-Allow-Origin' header`
```bash
# Solution: Add frontend URL to CORS_ORIGIN in .env
CORS_ORIGIN=http://localhost:5173

# Restart server
bun run dev:server
```

### Type Errors

**Problem**: `Cannot find module 'X'`
```bash
# Solution: Regenerate types
bun run typecheck

# Or restart TypeScript server in VSCode
Cmd/Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

---

## CI/CD

### GitHub Actions

The project uses GitHub Actions for continuous integration and deployment. The workflow is defined in `.github/workflows/ci.yml` and runs automatically on:

- **Push to branches**: `main`, `develop`, or any `feat/**` branch
- **Pull Requests**: To `main` or `develop` branches

#### Workflow Jobs (Run in Parallel)

1. **Test Job**
   - Runs all tests with `bun test`
   - Uses Bun runtime
   - Installs dependencies with frozen lockfile

2. **Lint & Type Check Job**
   - Runs `bun run lint` to check code style
   - Runs `bun run typecheck` for TypeScript validation
   - Ensures code quality standards

3. **Build Job**
   - Builds the server with `bun run build:server`
   - Verifies build artifacts are created
   - Ensures production build succeeds

4. **Docker Job**
   - Builds Docker image using multi-stage Dockerfile
   - Uses Docker Buildx with GitHub Actions cache
   - Runs container smoke test:
     * Starts container with test configuration
     * Waits for server startup
     * Calls `/healthz` endpoint
     * Verifies healthy response
     * Cleans up test container
   - Tags image with commit SHA

#### Viewing Workflow Runs

```bash
# View in GitHub UI
https://github.com/<org>/<repo>/actions

# Or use GitHub CLI
gh run list
gh run view <run-id>
gh run watch
```

#### Local Pre-commit Hooks

The project uses Husky to run checks before each commit:

```bash
# Automatically runs on git commit:
# 1. Linting (bun run lint)
# 2. Type checking (bun run typecheck)

# To skip hooks (not recommended):
git commit --no-verify -m "message"
```

#### Running Full CI Suite Locally

```bash
# Run all CI checks manually:

# 1. Linting
bun run lint

# 2. Type checking
bun run typecheck

# 3. Tests
bun test

# 4. Build
bun run build:server

# 5. Docker build
bun run build:docker

# 6. Container smoke test
bun run smoke:container
```

#### CI Environment Variables

The CI workflow uses these environment variables:
- `DATABASE_PATH`: Set to `/data/test.db` for container tests
- `PORT`: `3000`
- `HOST`: `0.0.0.0` (to allow external connections in Docker)
- `NODE_ENV`: `production`
- `CORS_ORIGIN`: `http://localhost:5173`

#### Troubleshooting CI Failures

**Lint Failures**:
```bash
# Fix locally first
bun run lint:fix
git add .
git commit
```

**Type Check Failures**:
```bash
# Run locally to see errors
bun run typecheck
# Fix errors, then commit
```

**Test Failures**:
```bash
# Run tests locally
bun test
# Or run specific failing test
bun test path/to/test.ts
```

**Docker Build Failures**:
```bash
# Test Docker build locally
bun run build:docker
# Check Dockerfile and .dockerignore
```

---

## Next Steps

After completing this setup:

1. **Verify all success criteria**:
   - ✅ Developer can clone, setup, and run in <10 minutes
   - ✅ Health check returns success
   - ✅ Migration creates PerformanceEvent schema
   - ✅ Docker image builds successfully
   - ✅ Frontend and backend communicate

2. **Move to Spec 002**: API Implementation
   - Implement full CRUD for PerformanceEvents
   - Add authentication
   - Add user management

3. **Move to Spec 003**: Frontend MVP
   - Build dashboard UI
   - Implement data visualization
   - Add real-time updates

---

## Resources

- **Bun Documentation**: https://bun.sh/docs
- **Fastify Documentation**: https://fastify.dev/
- **Drizzle ORM**: https://orm.drizzle.team/
- **Effect Documentation**: https://effect.website/docs
- **TanStack Query**: https://tanstack.com/query/
- **Tailwind CSS**: https://tailwindcss.com/

---

## Getting Help

- Check this quickstart guide first
- Review the research.md document for technical decisions
- Consult the data-model.md for database schema
- Check API contracts in contracts/api.md
- Ask in team chat or open GitHub issue
