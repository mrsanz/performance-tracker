
# Feature Specification: Project Setup – Database, Infrastructure, and Folder Structure

**Feature Branch**: `001-project-setup-database`  
**Created**: 2025-10-16  
**Status**: Draft  
**Input**: Project setup: database, infrastructure, and folder structure for initial development environment. Server must run locally, connect to SQLite with initial schema for a generic performance event, and have Drizzle ORM and all constitution-mandated defaults for an empty starter project.

## Clarifications

### Session 2025-10-16

- Q: What happens if the database file is missing or locked? → A: App should NOT start; error should be clear and prevent application load.
- Q: How does the system handle invalid or missing environment variables? → A: App should NOT start; provide clear error messages.
- Q: What if the migration script is run multiple times? → A: Should be idempotent, always bringing DB to proper version.
- Q: What should the health check endpoint include? → A: DB connection info and latest successful migration run for the DB.
- Q: Should there be additional status endpoints? → A: Yes, add `/infoz` endpoint showing server up/running status and version info.
- Q: What CORS configuration should be used? → A: Environment-based origin whitelist for all environments (localhost for dev, specific domains for prod).
- Q: Should a basic frontend be included in project setup? → A: Yes, React with Vite and TanStack Query (react-query).
- Q: How should SQL injection be prevented? → A: Use parameterized queries through Drizzle ORM; validate at database layer.

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Developer boots project locally (Priority: P1)

A developer can clone the repository, install dependencies, and start the server locally in development mode. The server connects to a local SQLite database, applies the initial schema, and exposes a health endpoint.

**Why this priority**: This is the foundation for all further development and enables rapid onboarding and iteration.

**Independent Test**: Can be fully tested by cloning the repo, running setup commands, and verifying the server starts and connects to the database.

**Acceptance Scenarios**:
1. **Given** a clean clone, **When** the developer runs the setup script, **Then** dependencies are installed and the server starts without error.
2. **Given** the server is running, **When** a health check endpoint is called, **Then** it returns success response with database connection info and version of the application and the latest version of the migration run.
3. **Given** the database is empty, **When** the migration script is run, **Then** the initial schema for a generic performance event is created.
4. **Given** the server is running, **When** the `/infoz` endpoint is called, **Then** it returns server status and version information.

---

### User Story 2 – Infrastructure and configuration are ready for deployment (Priority: P2)

The project includes a Dockerfile and infrastructure folder with Helm chart templates, enabling deployment to Kubernetes in any environment. Environment variables are managed via dotenv and fastify-env.

**Why this priority**: Ensures the project is ready for both local and cloud deployment from day one.

**Independent Test**: Can be fully tested by building the Docker image and inspecting the infrastructure folder for required files.

**Acceptance Scenarios**:
1. **Given** the repo, **When** the developer builds the Docker image, **Then** the build completes and the image runs the server successfully.
2. **Given** the infrastructure folder, **When** Helm is used to render the chart, **Then** manifests are generated for the app and database.
3. **Given** a .env file, **When** the server starts, **Then** environment variables are loaded and available in the app.
4. **Given** missing environment variables, **When** the server attempts to start, **Then** it MUST NOT start and displays clear error messages.

---

### User Story 3 – Database and ORM are ready for use (Priority: P3)

The project includes Drizzle ORM configured for Bun's native SQLite, with migration scripts for up/down and a starter schema for a generic performance event.

**Why this priority**: Ensures a robust, type-safe foundation for all future data features.

**Independent Test**: Can be fully tested by running migration scripts and inspecting the database for the expected schema.

**Acceptance Scenarios**:
1. **Given** the repo, **When** the migration script is run, **Then** the database schema is created as specified.
2. **Given** the ORM config, **When** a test query is run, **Then** it executes successfully against the SQLite database.
3. **Given** migrations already run, **When** the migration script is run again, **Then** it is idempotent and brings DB to proper version.

---

### User Story 4 – Development tooling and CI/CD are configured (Priority: P3)

The project includes linting/formatting rules (ts-standard), recommended VSCode extensions, and GitHub Actions workflows for automated testing, building, and Docker image compilation.

**Why this priority**: Ensures code quality and automated validation from the start.

**Independent Test**: Can be fully tested by running linters, opening project in VSCode with recommendations, and triggering GitHub Actions.

**Acceptance Scenarios**:
1. **Given** the repo, **When** linting is run, **Then** code is validated according to ts-standard rules.
2. **Given** the repo opened in VSCode, **When** extensions are checked, **Then** recommended extensions for testing and workflow troubleshooting are suggested.
3. **Given** a push to the repo, **When** GitHub Actions runs, **Then** tests, build, and Docker compilation execute in parallel.

---

### User Story 5 – Frontend foundation is configured (Priority: P2)

The project includes a basic React application using Vite for build tooling and TanStack Query (react-query) for server state management. The frontend can connect to the backend API.

**Why this priority**: Establishes the frontend foundation early, enabling full-stack development from the start.

**Independent Test**: Can be fully tested by running the frontend dev server and verifying it can make API calls to the backend.

**Acceptance Scenarios**:
1. **Given** the repo, **When** the frontend dev server is started, **Then** the React application loads successfully.
2. **Given** the frontend is running, **When** an API call is made using TanStack Query, **Then** it successfully communicates with the backend.
3. **Given** CORS is configured, **When** the frontend makes a cross-origin request, **Then** it is allowed based on environment-specific whitelist.

---

[Add more user stories as needed, each with an assigned priority]


### Edge Cases

- **Database file missing or locked**: Application MUST NOT start; MUST display clear error message preventing application load.
- **Invalid or missing environment variables**: Application MUST NOT start; MUST provide clear error messages identifying missing/invalid variables.
- **Migration script run multiple times**: MUST be idempotent, always bringing database to the proper version without errors.
- **CORS request from unauthorized origin**: Request MUST be blocked; only whitelisted origins allowed based on environment configuration.
- **SQL injection attempt**: MUST be prevented through parameterized queries; Drizzle ORM MUST sanitize all inputs.


## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a setup script or documented steps to install dependencies and start the server locally.
- **FR-002**: System MUST connect to a local SQLite database using Bun's native SQLite API and Drizzle ORM.
- **FR-003**: System MUST include idempotent migration scripts that always bring database to proper version; support both up and down migrations for the initial schema.
- **FR-004**: System MUST provide a health check endpoint that verifies server status, database connection info, and latest successful migration run.
- **FR-004a**: System MUST provide an `/infoz` endpoint that shows server up/running status and version information.
- **FR-005**: System MUST include a Dockerfile and infrastructure folder with Helm chart templates for Kubernetes deployment.
- **FR-006**: System MUST use dotenv and fastify-env for environment variable management.
- **FR-007**: System MUST NOT start and MUST display clear error messages if configuration or database setup fails.
- **FR-008**: System MUST include a folder structure separating infrastructure, backend, and (future) frontend code.
- **FR-009**: System MUST configure Drizzle ORM for Bun SQLite and provide a working example query.
- **FR-010**: System MUST include linting and formatting rules (ts-standard) with documented setup for pre-commit hooks.
- **FR-011**: System MUST provide recommended VSCode extensions for running test suites, troubleshooting workflows, and system tools.
- **FR-012**: System MUST include GitHub Actions workflow with separate parallel jobs for: tests, build, and Docker image compilation.
- **FR-013**: System MUST configure CORS with environment-based origin whitelist (localhost for dev, specific domains for prod) following OWASP standards.
- **FR-014**: System MUST prevent SQL injection through parameterized queries enforced by Drizzle ORM at the database layer.
- **FR-015**: System MUST include a basic React frontend using Vite for build tooling and TanStack Query for server state management.
- **FR-016**: System MUST configure the frontend to communicate with the backend API with proper CORS handling.

### Key Entities

- **PerformanceEvent**: Represents a generic event to be tracked for performance analysis. Attributes: id, timestamp, type, payload (JSON or text, to be refined in future specs).


## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developer can clone the repo, run setup, and start the server locally in under 10 minutes.
- **SC-002**: Health check endpoint `/healthz` returns success with app version, database connection info and latest migration run after setup.
- **SC-002a**: `/infoz` endpoint returns server status and version information.
- **SC-003**: Migration script creates the initial schema for PerformanceEvent with no errors and is idempotent.
- **SC-004**: Docker image builds and runs the server successfully.
- **SC-005**: Helm chart renders manifests for app and database.
- **SC-006**: All configuration is managed via dotenv and fastify-env; no hardcoded secrets.
- **SC-007**: Application fails to start with clear error messages when environment variables are missing or database is unavailable.
- **SC-008**: GitHub Actions workflows execute tests, build, and Docker compilation in parallel successfully.
- **SC-009**: CORS blocks unauthorized origins and allows whitelisted origins based on environment configuration.
- **SC-010**: All database queries use parameterized inputs through Drizzle ORM, preventing SQL injection.
- **SC-011**: Frontend dev server starts successfully and can make API calls to the backend using TanStack Query.
