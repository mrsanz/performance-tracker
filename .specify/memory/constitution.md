<!--
SYNC IMPACT REPORT:
- Version change: 1.0.0 Initial constitution
- Added sections: Enhanced TDD methodology, database/API type separation, standards
- Technology Stack: Added specific testing tools (@testing-library, fastify.inject), separated database schemas from API types
- Development Standards: Added TDD strategy, type boundaries, testing methodology
- Templates requiring updates: ✅ All templates validated for compatibility
- Follow-up TODOs: None
-->

# Performance Tracker Constitution


## Core Principles

### IX. Indexed Data for Paginated APIs
All cursor-based (plural) API endpoints MUST only return indexed fields in their responses. This ensures fast pagination and efficient subsequent queries. To fetch full details, clients MUST use the singular endpoint (e.g., `/api/events/:id`, `/api/persons/:id`).

**Rationale**: Guarantees scalable, performant API pagination and prevents unnecessary data transfer for list views.

### I. Data-First Architecture
All data MUST be normalized and stored in SQLite for instant UI retrieval. No data transformation occurs in the frontend. APIs MUST serve materialized views only. Every database schema change requires migration scripts and backwards compatibility consideration during transition periods.

**Rationale**: Ensures predictable UI performance and separates data processing from presentation concerns.

### VIII. Effectful Error Handling (NON-NEGOTIABLE)
All error handling throughout the codebase MUST use the Effect library (https://effect.website/docs) to avoid happy path coding. All errors MUST be handled explicitly using Effect's error management patterns. No unhandled promise rejections or silent failures are permitted. Code style and error boundaries MUST follow Effect guidelines (https://effect.website/docs/code-style/guidelines/).

**Rationale**: Ensures robust, explicit error management and prevents hidden failures.

### II. Type Safety with Clear Boundaries
Database schemas MUST be separate from API types to prevent conflation. Zod schemas MUST define API input validation only. API response types SHOULD be implicit unless consumed by external systems. Fastify routes MUST use Zod for request validation with proper TypeScript integration. Runtime type validation is mandatory at API boundaries only.

**Rationale**: Separates data storage concerns from API contracts, prevents over-specification, and maintains clean type boundaries.

### III. Test-Driven Development (NON-NEGOTIABLE)
TDD MUST be strictly followed: write tests first, see them fail, then implement to make them pass. Use Bun's built-in test runner exclusively with @testing-library for React components. Fastify routes MUST be tested using fastify.inject() for isolated testing. All database operations MUST use test transactions with rollback. Integration tests MUST verify end-to-end API contracts. No Jest or external testing frameworks permitted.

**Rationale**: Ensures code quality, prevents regressions, and maintains consistency with the Bun ecosystem while providing comprehensive test coverage.

### IV. Background Job Isolation
Long-running workflows MUST use SideQuest for job processing. Background jobs MUST be isolated from the main Fastify server. Job state MUST be persisted to SQLite. All jobs MUST be resumable and idempotent. Job failures MUST be logged with structured error information.

**Rationale**: Prevents blocking the main API server and ensures reliable processing of long-running tasks.

### V. Single Responsibility Services
The Fastify server handles API requests only. The React frontend handles UI presentation only. Data ingestion services handle external data source integration only. Background jobs handle workflow processing only. Each service MUST have clear boundaries and communication contracts. Cross-service communication occurs through defined APIs only.

**Rationale**: Maintains clear separation of concerns and enables independent scaling and maintenance.

### VI. Type-Safe API Communication
All client-server communication MUST use generated TypeScript types from shared Zod schemas. A dedicated API client layer MUST abstract fetch calls with full type safety. The same server serves both frontend and backend but MUST maintain clear separation to enable future service splitting. API routes MUST be organized separately from static file serving.  Types should be in a desginated folder like types/database or types/server-api based on where they are primarily used based on seperation.

**Rationale**: Ensures type safety across the network boundary and maintains architectural flexibility for future scaling.

### VII. Data Ingestion Isolation
Long-lived data ingestion tasks MUST be isolated from the main API server with clearly defined interfaces. Data source integration MUST use standardized contracts for fetching and transforming external data into the normalized database schema. Ingestion services MUST be independently deployable and scalable. All data transformations MUST be idempotent and resumable.

**Rationale**: Separates data ingestion concerns from API serving and enables independent scaling of data processing workloads.

## Technology Stack Requirements


**Runtime**: Bun (latest stable version)
**Server Framework**: Fastify (latest stable version) with TypeScript (plugin-based architecture for service separation)
**API Server**: Fastify instance handling API endpoints only
**Data Ingestion**: Separate Fastify plugin/service with standardized interfaces for external data sources
**Frontend**: Single-page React application with Tailwind CSS
**Database**: SQLite with normalized schema design (separate from API types), accessed via Bun's native SQLite API and Drizzle ORM
**Type System**: Zod for API input validation, TypeScript for compile-time safety, implicit response types
**Background Jobs**: SideQuest library with workflow queue injest.
**Testing**: Bun built-in test runner with @testing-library, fastify.inject() for API testing
**UI Components**: Flexible component library (e.g., Shadcn/ui) optimized for displaying time series data via charts and beautiful graphs.
**API Client**: Generated TypeScript client from implicit API response types
**Error Handling**: Effect TypeScript library for all error management
**Environment/Config**: dotenv with fastify-env for environment variable management
**Deployment**: Docker image as the deployment artifact; all infrastructure (Kubernetes, Helm, etc.) in root `infrastructure/` folder
**Database Migrations**: Drizzle migrations with up/down scripts

**FORBIDDEN**: Jest, runtime for new code, client-side data transformation, denormalized data storage for UI optimization, direct API fetch calls without type safety, CSS frameworks other than Tailwind, mixing data ingestion logic with API serving, conflating database schemas types with API Zod types, unhandled errors outside Effect TS, configuration outside dotenv/fastify-env, infrastructure outside `infrastructure/`, application code outside of `src/`.

## Development Standards

**Code Organization**: Monorepo structure with clear API server/data ingestion/client separation and shared type definitions
**Server Architecture**: Fastify plugin-based design enabling easy deconstruction into separate servers
**API Design**: RESTful endpoints with Zod input validation, implicit response types, tested via fastify.inject()
**Data Ingestion**: Standardized interfaces for external data sources, idempotent transformations, resumable operations
**Frontend Architecture**: Type-safe API client layer, Tailwind for styling, component library for data visualization
**Testing Strategy**: TDD mandatory, Bun test runner with @testing-library, database test transactions with rollback
**Type Boundaries**: Database schemas separate from API types, Zod for input validation only
**Error Handling**: All error handling MUST use the Effect library; no happy path coding; follow Effect guidelines for error boundaries and management
**Logging**: Structured JSON logging for all services
**Database**: Migration-driven schema evolution with rollback capability, Drizzle ORM for all queries, Bun's native SQLite API for connections, atomic commit model
**Performance**: Sub-100ms API response times for data retrieval, efficient data table rendering for large datasets
**Security**: Input validation at all boundaries, SQL injection prevention through parameterized queries
**Environment/Config**: All environment variables managed via dotenv and fastify-env; no hardcoded secrets
**Deployment**: All deployments via Docker image; infrastructure as code in `infrastructure/` (Kubernetes, Helm, etc.)
**Documentation**: All exported functions MUST have TSDoc headers with summary, purpose, and usage examples if consumed elsewhere
**Linting/Formatting**: Use ts-standard for linting and formatting; pre-commit hooks recommended
**Service Organization**: Fastify plugins MUST be designed for independent deployment to enable monorepo deconstruction

## Governance

This constitution supersedes all other development practices. All code changes MUST comply with the core principles. Non-compliance blocks deployment. Constitution amendments require documentation of impact analysis and migration path.

**Version**: 1.0.0 | **Ratified**: 2025-10-16 | **Last Amended**: 2025-10-16