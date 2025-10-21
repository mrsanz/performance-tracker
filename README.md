````markdown
# Performance Tracker

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-blue)](https://github.com/performance-tracker/performance-tracker/actions)
[![Bun](https://img.shields.io/badge/runtime-Bun-orange)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)]()

A production-ready full-stack performance tracking application with Bun + Fastify backend, SQLite + Drizzle ORM, and React + Vite frontend. Built with Test-Driven Development (TDD), Effect-based error handling, and comprehensive infrastructure for local development and Kubernetes deployment.

## ✨ Features

- **🚀 Fast Runtime**: Powered by Bun for lightning-fast installs, tests, and builds
- **🔒 Type-Safe Database**: Drizzle ORM with SQLite for compile-time type safety
- **⚡ Modern Backend**: Fastify server with plugin-based architecture
- **🎨 Modern Frontend**: React 18 + Vite with TanStack Query for server state
- **🎯 Effect-First**: Effect library for functional error handling
- **🧪 TDD Ready**: Bun test runner with @testing-library/react
- **🐳 Docker Ready**: Multi-stage builds with production optimization
- **☸️ Kubernetes Ready**: Helm charts for easy deployment
- **🔄 CI/CD**: GitHub Actions with parallel testing, linting, and Docker builds
- **🎨 Modern UI**: Tailwind CSS + shadcn/ui component library
- **📊 Health Monitoring**: `/healthz` and `/infoz` endpoints for observability
- **🔐 Security**: CORS protection, SQL injection prevention, environment-based config

## 🛠️ Tech Stack

### Backend
- **Runtime**: Bun 1.2.23+
- **Server**: Fastify 5.0 (plugin architecture)
- **Database**: SQLite (Bun native) + Drizzle ORM 0.44
- **Error Handling**: Effect 3.18
- **Validation**: Zod 3.25
- **Logging**: Fastify logger (Pino)

### Frontend
- **Framework**: React 18.3
- **Build Tool**: Vite 5.4
- **State Management**: TanStack Query 5.90
- **Styling**: Tailwind CSS 3.4 + shadcn/ui
- **Components**: Radix UI primitives
- **Icons**: Lucide React

### DevOps
- **Containerization**: Docker (multi-stage builds)
- **Orchestration**: Kubernetes (Helm charts)
- **CI/CD**: GitHub Actions
- **Linting**: Biome 2.2
- **Git Hooks**: Husky 9.1

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) 1.2.23 or higher
- Git

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd performance-tracker

# Install dependencies
bun install

# Copy environment template
cp .env.example .env

# Initialize database (run migrations)
bun run db:migrate

# (Optional) Seed with sample data
bun run db:seed

# Start development servers (backend + frontend)
bun run dev
```

The application will be running at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Health Check**: http://localhost:3000/healthz
- **Info**: http://localhost:3000/infoz

**Complete setup should take less than 10 minutes!** ⏱️

For detailed setup instructions, troubleshooting, and workflows, see the [📘 Quickstart Guide](./specs/001-project-setup-database/quickstart.md).

## 📚 Documentation

- **[📘 Quickstart Guide](./specs/001-project-setup-database/quickstart.md)** - Complete setup and development workflow
- **[🏗️ Architecture](./docs/architecture.md)** - System design and plugin structure
- **[📡 API Documentation](./docs/api.md)** - API endpoints and contracts
- **[📋 Specification](./specs/001-project-setup-database/spec.md)** - Feature requirements and success criteria
- **[📐 Data Model](./specs/001-project-setup-database/data-model.md)** - Database schema and relationships
- **[🔬 Research](./specs/001-project-setup-database/research.md)** - Technical decisions and trade-offs
- **[✅ Tasks](./specs/001-project-setup-database/tasks.md)** - Implementation task breakdown

## 📦 Project Structure

```
performance-tracker/
├── src/
│   ├── backend/              # Fastify backend
│   │   ├── database/         # Drizzle ORM + migrations + queries
│   │   ├── plugins/          # Fastify plugins (db, cors, health, etc.)
│   │   ├── lib/              # Utilities (errors, app-info, env validation)
│   │   └── index.ts          # Server entry point
│   ├── frontend/             # React frontend
│   │   ├── src/
│   │   │   ├── components/   # UI components (shadcn/ui)
│   │   │   ├── hooks/        # TanStack Query hooks
│   │   │   ├── lib/          # API client, utilities
│   │   │   ├── App.tsx       # Main app component
│   │   │   └── main.tsx      # Frontend entry point
│   │   ├── vite.config.ts    # Vite configuration
│   │   └── index.html        # HTML entry point
│   └── workers/              # Background job workers (future)
├── tests/
│   ├── backend/              # Backend tests (Bun test + fastify.inject)
│   └── frontend/             # Frontend tests (@testing-library/react)
├── infrastructure/
│   ├── Dockerfile            # Multi-stage Docker build
│   └── helm/                 # Kubernetes Helm charts
├── specs/                    # Feature specifications
├── docs/                     # Documentation
├── .github/workflows/        # CI/CD workflows
└── package.json              # Dependencies and scripts
```

## 🧪 Testing

```bash
# Run all tests
bun test

# Run backend tests only
bun run test:backend

# Run frontend tests only
bun run test:frontend

# Run tests in watch mode
bun test --watch

# Run with coverage
bun test --coverage
```

**Test Coverage:**
- ✅ Database migrations and schema
- ✅ Backend plugins (health, info, db, cors)
- ✅ Database queries (persons, performance events)
- ✅ Frontend component rendering
- ✅ API integration tests

## 🏗️ Development

### Available Scripts

```bash
# Development
bun run dev              # Start both backend and frontend with hot reload
bun run dev:server       # Start backend only with hot reload
bun run dev:client       # Start frontend only with HMR

# Building
bun run build            # Build both backend and frontend
bun run build:server     # Build backend
bun run build:client     # Build frontend

# Database
bun run db:migrate       # Run database migrations
bun run db:seed          # Seed database with sample data
bun run db:reset         # Drop DB, run migrations, and seed
bun run db:generate      # Generate new migration from schema changes
bun run db:studio        # Open Drizzle Studio (database GUI)

# Testing
bun test                 # Run all tests
bun run test:backend     # Run backend tests
bun run test:frontend    # Run frontend tests

# Code Quality
bun run lint             # Lint code with Biome
bun run lint:fix         # Lint and auto-fix
bun run format           # Format code with Biome
bun run typecheck        # TypeScript type checking

# Docker
bun run build:docker     # Build Docker image
bun run smoke:container  # Run container smoke test

# Production
bun run start            # Start production server
```

### Architecture

The application follows a **plugin-based architecture** using Fastify:

- **Database Plugin**: Registers Drizzle client with Effect-wrapped queries
- **Environment Plugin**: Validates environment variables on startup
- **CORS Plugin**: Environment-based origin whitelist
- **Health Plugin**: `/healthz` endpoint with database connection status
- **Info Plugin**: `/infoz` endpoint with server version info
- **Static Plugin**: Serves frontend in production

See [Architecture Documentation](./docs/architecture.md) for detailed diagrams and patterns.

### Error Handling

All asynchronous operations use the **Effect library** for functional error handling:

```typescript
import { Effect } from 'effect'

// Database queries return Effect types
export const getPersonById = (id: string) =>
  Effect.tryPromise({
    try: () => db.query.persons.findFirst({ where: eq(persons.id, id) }),
    catch: (error) => new DatabaseError({ cause: error })
  })
```

### Database Migrations

```bash
# 1. Modify schema in src/backend/database/schema/
# 2. Generate migration
bun run db:generate

# 3. Review migration in src/backend/database/migrations/
# 4. Apply migration
bun run db:migrate
```

Migrations are **idempotent** and can be run multiple times safely.

## 🐳 Docker & Kubernetes

### Build and Run with Docker

```bash
# Build Docker image
bun run build:docker

# Run container
docker run -p 3000:3000 \
  -e DATABASE_PATH=/data/performance-tracker.db \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -v $(pwd)/data:/data \
  performance-tracker:latest

# Or use docker-compose
docker-compose up
```

### Deploy to Kubernetes with Helm

```bash
# Install Helm chart
helm install performance-tracker \
  ./infrastructure/helm/performance-tracker \
  --set image.tag=latest \
  --set env.NODE_ENV=production

# Upgrade release
helm upgrade performance-tracker \
  ./infrastructure/helm/performance-tracker

# Uninstall
helm uninstall performance-tracker
```

## 🔒 Security

- **SQL Injection Prevention**: All queries use Drizzle ORM parameterization
- **CORS Protection**: Environment-based origin whitelist
- **Environment Variables**: No hardcoded secrets, all via `.env`
- **Fail-Fast Validation**: Server won't start with missing/invalid config
- **Type Safety**: End-to-end TypeScript with strict mode

## 🤝 Contributing

1. Follow **Test-Driven Development (TDD)** - write tests first!
2. Use **Effect** for all error handling
3. Add **TSDoc comments** to exported functions
4. Run linting and type checks before committing
5. Ensure all tests pass

Pre-commit hooks will automatically run linting and type checking.

## 📝 License

MIT

## 🙏 Acknowledgements

Built with:
- [Bun](https://bun.sh) - Fast JavaScript runtime
- [Fastify](https://fastify.dev) - Fast web framework
- [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM
- [Effect](https://effect.website) - Functional error handling
- [React](https://react.dev) - UI library
- [Vite](https://vitejs.dev) - Frontend build tool
- [TanStack Query](https://tanstack.com/query) - Server state management
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com) - Re-usable components

---

**Made with ❤️ using Bun**

````
