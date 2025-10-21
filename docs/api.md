# API Documentation

**Performance Tracker API v0.1.0**

Base URL: `http://localhost:3000` (development)

All timestamps are in ISO 8601 format (UTC). All IDs are UUIDs.

---

## Table of Contents

- [Health & Status Endpoints](#health--status-endpoints)
  - [GET /healthz](#get-healthz)
  - [GET /infoz](#get-infoz)
- [Performance Events API](#performance-events-api)
  - [GET /api/events](#get-apievents)
  - [GET /api/events/:id](#get-apieventsid)
  - [POST /api/events](#post-apievents)
- [Persons API](#persons-api)
  - [GET /api/persons](#get-apipersons)
  - [GET /api/persons/:id](#get-apipersonsid)
- [Error Responses](#error-responses)
- [CORS Configuration](#cors-configuration)

---

## Health & Status Endpoints

### GET /healthz

**Purpose**: Comprehensive health check for monitoring and observability. Verifies server status, database connection, and migration state.

**Authentication**: None required

**Request**: No parameters

**Response**: `200 OK` (Healthy)

```json
{
  "status": "healthy",
  "app": {
    "environment": "development",
    "name": "performance-tracker",
    "status": "running",
    "uptime": 3600,
    "version": "0.1.0"
  },
  "database": {
    "connected": true,
    "latestMigration": "0000_sparkling_the_hood",
    "migrationDate": "2025-10-16T12:00:00.000Z"
  },
  "timestamp": "2025-10-16T12:00:00.123Z"
}
```

**Response**: `503 Service Unavailable` (Unhealthy)

```json
{
  "status": "unhealthy",
  "app": {
    "environment": "development",
    "name": "performance-tracker",
    "status": "running",
    "uptime": 10,
    "version": "0.1.0"
  },
  "error": "Database connection failed",
  "timestamp": "2025-10-16T12:00:00.123Z"
}
```

**Use Cases**:
- Kubernetes liveness/readiness probes
- Load balancer health checks
- Monitoring dashboards
- CI/CD smoke tests

**Example**:

```bash
# Check health
curl http://localhost:3000/healthz

# Use in Kubernetes probe
livenessProbe:
  httpGet:
    path: /healthz
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

---

### GET /infoz

**Purpose**: Lightweight server information endpoint. Returns basic server status and version without database checks.

**Authentication**: None required

**Request**: No parameters

**Response**: `200 OK`

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
- Quick server status check (no DB dependency)
- Debugging deployment issues

**Example**:

```bash
# Get server info
curl http://localhost:3000/infoz
```

---

## Performance Events API

> **Note**: Full CRUD implementation planned for Spec 002. Current endpoints are examples for testing the foundation.

### GET /api/events

**Purpose**: List performance events with cursor-based pagination.

**Authentication**: None (authentication planned for Spec 002)

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `cursor` | string | No | - | Opaque cursor for pagination (base64-encoded event ID) |
| `limit` | number | No | 20 | Max results per page (1-100) |

**Response**: `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "personId": "b1c2d3e4-5678-1234-9abc-1234567890ab",
      "type": "pr-commit",
      "timestamp": "2025-10-16T12:00:00.000Z"
    }
  ],
  "nextCursor": "YmFzZTY0LWVuY29kZWQtZXZlbnRJRA=="
}
```

**Note**: Only indexed fields are returned for fast pagination. Use `GET /api/events/:id` for full event details including payload.

**Example**:

```bash
# Get first page
curl http://localhost:3000/api/events?limit=10

# Get next page
curl http://localhost:3000/api/events?cursor=YmFzZTY0...&limit=10
```

---

### GET /api/events/:id

**Purpose**: Retrieve a single performance event by ID with full details.

**Authentication**: None (authentication planned for Spec 002)

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Event ID |

**Response**: `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "personId": "b1c2d3e4-5678-1234-9abc-1234567890ab",
  "timestamp": "2025-10-16T12:00:00.000Z",
  "type": "pr-commit",
  "payload": {
    "repo": "performance-tracker",
    "branch": "main",
    "commit": "abc123"
  },
  "createdAt": "2025-10-16T12:00:01.000Z",
  "updatedAt": "2025-10-16T12:00:01.000Z"
}
```

**Response**: `404 Not Found`

```json
{
  "error": "Event not found",
  "id": "invalid-uuid",
  "timestamp": "2025-10-16T12:00:00.123Z",
  "path": "/api/events/invalid-uuid"
}
```

**Example**:

```bash
# Get event by ID
curl http://localhost:3000/api/events/550e8400-e29b-41d4-a716-446655440000
```

---

### POST /api/events

**Purpose**: Create a new performance event (example endpoint for testing setup).

**Authentication**: None (authentication planned for Spec 002)

**Request Body**:

```json
{
  "personId": "b1c2d3e4-5678-1234-9abc-1234567890ab",
  "timestamp": "2025-10-16T12:00:00Z",
  "type": "pr-commit",
  "payload": {
    "repo": "performance-tracker",
    "branch": "main",
    "commit": "abc123"
  }
}
```

**Validation Schema** (Zod):

```typescript
{
  personId: z.string().uuid(),
  timestamp: z.string().datetime().or(z.date()),
  type: z.string().min(1).max(100),
  payload: z.record(z.unknown())
}
```

**Response**: `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "personId": "b1c2d3e4-5678-1234-9abc-1234567890ab",
  "timestamp": "2025-10-16T12:00:00.000Z",
  "type": "pr-commit",
  "payload": {
    "repo": "performance-tracker",
    "branch": "main",
    "commit": "abc123"
  },
  "createdAt": "2025-10-16T12:00:01.000Z",
  "updatedAt": "2025-10-16T12:00:01.000Z"
}
```

**Response**: `400 Bad Request` (Validation Error)

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "timestamp",
      "message": "Invalid datetime format"
    },
    {
      "field": "personId",
      "message": "Invalid UUID format"
    }
  ],
  "timestamp": "2025-10-16T12:00:00.123Z",
  "path": "/api/events"
}
```

**Response**: `500 Internal Server Error`

```json
{
  "error": "Failed to create event",
  "message": "Database error occurred",
  "timestamp": "2025-10-16T12:00:00.123Z",
  "path": "/api/events"
}
```

**Example**:

```bash
# Create event
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "personId": "b1c2d3e4-5678-1234-9abc-1234567890ab",
    "timestamp": "2025-10-16T12:00:00Z",
    "type": "pr-commit",
    "payload": {"repo": "performance-tracker"}
  }'
```

---

## Persons API

### GET /api/persons

**Purpose**: List persons with cursor-based pagination.

**Authentication**: None (authentication planned for Spec 002)

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `cursor` | string | No | - | Opaque cursor for pagination (base64-encoded person ID) |
| `limit` | number | No | 20 | Max results per page (1-100) |

**Response**: `200 OK`

```json
{
  "data": [
    {
      "id": "b1c2d3e4-5678-1234-9abc-1234567890ab",
      "email": "jane.doe@example.com",
      "startDate": "2022-01-15T00:00:00.000Z"
    }
  ],
  "nextCursor": "YmFzZTY0LWVuY29kZWQtcGVyc29uSUQ="
}
```

**Note**: Only indexed fields are returned. Use `GET /api/persons/:id` for full person details.

**Example**:

```bash
# Get first page
curl http://localhost:3000/api/persons?limit=10
```

---

### GET /api/persons/:id

**Purpose**: Retrieve a single person by ID with full details.

**Authentication**: None (authentication planned for Spec 002)

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Person ID |

**Response**: `200 OK`

```json
{
  "id": "b1c2d3e4-5678-1234-9abc-1234567890ab",
  "email": "jane.doe@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "title": "Software Engineer",
  "startDate": "2022-01-15T00:00:00.000Z",
  "createdAt": "2022-01-15T00:00:00.000Z",
  "updatedAt": "2025-10-16T12:00:01.000Z"
}
```

**Response**: `404 Not Found`

```json
{
  "error": "Person not found",
  "id": "invalid-uuid",
  "timestamp": "2025-10-16T12:00:00.123Z",
  "path": "/api/persons/invalid-uuid"
}
```

**Example**:

```bash
# Get person by ID
curl http://localhost:3000/api/persons/b1c2d3e4-5678-1234-9abc-1234567890ab
```

---

## Error Responses

All API errors follow a consistent format for easier debugging and client handling.

### Standard Error Format

```json
{
  "error": "Short error title",
  "message": "Detailed error description",
  "timestamp": "2025-10-16T12:00:00.123Z",
  "path": "/api/events"
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful GET request |
| `201` | Created | Successful POST request |
| `400` | Bad Request | Validation errors, malformed input |
| `401` | Unauthorized | Missing or invalid authentication (future) |
| `403` | Forbidden | Insufficient permissions (future) |
| `404` | Not Found | Resource doesn't exist |
| `500` | Internal Server Error | Unexpected server error |
| `503` | Service Unavailable | Database down, service unavailable |

### Validation Errors

Validation errors include a `details` array with field-specific errors:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "timestamp",
      "message": "Invalid datetime format"
    },
    {
      "field": "type",
      "message": "Must be between 1 and 100 characters"
    }
  ],
  "timestamp": "2025-10-16T12:00:00.123Z",
  "path": "/api/events"
}
```

---

## CORS Configuration

The API uses environment-based CORS configuration for security.

### Allowed Origins

- **Development**: `http://localhost:5173` (Vite default)
- **Production**: Configured via `CORS_ORIGIN` environment variable

### Allowed Methods

- `GET`
- `POST`
- `PUT`
- `DELETE`
- `OPTIONS`

### Allowed Headers

- `Content-Type`
- `Authorization`

### Credentials

- Enabled (`Access-Control-Allow-Credentials: true`)

### Preflight Requests

All `OPTIONS` requests are handled automatically by the CORS plugin.

**Example Preflight**:

```bash
curl -X OPTIONS http://localhost:3000/api/events \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST"
```

---

## Security

### SQL Injection Prevention

All database queries use **Drizzle ORM** with parameterized queries. User input is never directly concatenated into SQL strings.

**Safe Query Example**:

```typescript
// ✅ Safe - Drizzle uses parameterized queries
await db.query.performanceEvents.findMany({
  where: eq(performanceEvents.personId, userInput)
})

// ❌ Unsafe - Raw SQL with concatenation (NOT USED)
await db.execute(`SELECT * FROM events WHERE personId = '${userInput}'`)
```

### Environment Variables

All sensitive configuration is managed via environment variables. No secrets are hardcoded.

**Required Environment Variables**:

- `DATABASE_PATH` - Path to SQLite database file
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: localhost)
- `CORS_ORIGIN` - Allowed CORS origin
- `NODE_ENV` - Environment (development/production)

### Fail-Fast Validation

The server validates all environment variables on startup using `fastify-env`. If any required variable is missing or invalid, the server will **not start** and will display clear error messages.

---

## Rate Limiting

> **Note**: Rate limiting not implemented in v0.1.0. Planned for future release.

---

## Pagination

All list endpoints use **cursor-based pagination** for better performance at scale.

### Cursor Format

Cursors are opaque, base64-encoded strings. Clients should treat them as opaque values and not attempt to parse or modify them.

### Pagination Flow

1. Request first page without cursor
2. Response includes `nextCursor` if more results exist
3. Request next page using `nextCursor` value
4. Repeat until `nextCursor` is `null`

**Example**:

```bash
# Page 1
GET /api/events?limit=20
Response: { "data": [...], "nextCursor": "abc123" }

# Page 2
GET /api/events?limit=20&cursor=abc123
Response: { "data": [...], "nextCursor": "def456" }

# Last page
GET /api/events?limit=20&cursor=def456
Response: { "data": [...], "nextCursor": null }
```

### Why Cursor-Based?

- **Better performance**: No OFFSET queries that scan entire table
- **Consistent results**: No duplicate/missing items during pagination
- **Scalable**: Works efficiently with millions of records

---

## Future Enhancements (Spec 002+)

- Authentication (JWT tokens)
- Authorization (role-based access control)
- Rate limiting
- Webhooks for event notifications
- Bulk operations
- Advanced filtering and sorting
- Real-time updates (WebSockets)
- API versioning

---

## Support

For issues, questions, or feature requests:

1. Check the [Quickstart Guide](../specs/001-project-setup-database/quickstart.md)
2. Review the [Specification](../specs/001-project-setup-database/spec.md)
3. Open a GitHub issue

---

**Version**: 0.1.0  
**Last Updated**: 2025-10-18
