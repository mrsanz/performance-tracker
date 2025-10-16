# API Contracts: Project Setup

## Health Check Endpoints

### GET /healthz

**Purpose**: Verify server status, database connection, and migration state, (include infoz)

**Request**: None

**Response**: 200 OK
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
    "latestMigration": "0000_create_performance_events",
    "migrationDate": "2025-10-16T12:00:00Z"
  },
  "timestamp": "2025-10-16T12:00:00Z"
}
```

**Error Response**: 503 Service Unavailable
```json
{
  "app": {
    "environment": "development",
    "name": "performance-tracker",
    "status": "running",
    "uptime": 3600,
    "version": "0.1.0"
  },
  "status": "unhealthy",
  "error": "Database connection failed",
  "timestamp": "2025-10-16T12:00:00Z"
}
```

---

### GET /infoz

**Purpose**: Server version and status information

**Request**: None

**Response**: 200 OK
```json
{
  "environment": "development",
  "name": "performance-tracker",
  "status": "running",
  "uptime": 3600,
  "version": "0.1.0"
}
```

---

## Performance Events API (Example - Full Implementation in Spec 002)

### POST /api/events

**Purpose**: Create a new performance event (example endpoint for testing setup)

**Request**:
```json
{
  "timestamp": "2025-10-16T12:00:00Z",
  "type": "page_load",
  "payload": {
    "url": "/dashboard",
    "duration": 150
  }
}
```

**Validation**: Using Zod schema
```typescript
{
  timestamp: z.string().datetime().or(z.date()),
  type: z.string().min(1).max(100),
  payload: z.record(z.unknown())
}
```

**Response**: 201 Created
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-10-16T12:00:00Z",
  "type": "page_load",
  "payload": {
    "url": "/dashboard",
    "duration": 150
  },
  "createdAt": "2025-10-16T12:00:01Z",
  "updatedAt": "2025-10-16T12:00:01Z"
}
```

**Error Responses**:

400 Bad Request - Invalid input
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "timestamp",
      "message": "Invalid datetime format"
    }
  ]
}
```

500 Internal Server Error - Database error
```json
{
  "error": "Failed to create event",
  "message": "Database error occurred"
}
```

---


### GET /api/events/:id

**Purpose**: Retrieve a single performance event by ID

**Request**: None

**Response**: 200 OK
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "personId": "b1c2d3e4-5678-1234-9abc-1234567890ab",
  "timestamp": "2025-10-16T12:00:00Z",
  "type": "page_load",
  "payload": {
    "url": "/dashboard",
    "duration": 150
  },
  "createdAt": "2025-10-16T12:00:01Z",
  "updatedAt": "2025-10-16T12:00:01Z"
}
```

**Error Response**: 404 Not Found
```json
{
  "error": "Event not found",
  "id": "invalid-uuid"
}
```

### GET /api/events

**Purpose**: List performance events (paginated, cursor-based)

**Query Parameters**:
- `cursor` (optional): string, opaque cursor for pagination
- `limit` (optional): number, max results per page (default: 20, max: 100)

**Response**: 200 OK
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "github-exapmle",
    }
  ],
  "nextCursor": "opaque-cursor-string-or-null"
}
```

---

### GET /api/users/:id

**Purpose**: Retrieve a single user (person) by ID

**Request**: None

**Response**: 200 OK
```json
{
  "id": "b1c2d3e4-5678-1234-9abc-1234567890ab",
  "email": "jane.doe@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "title": "Software Engineer",
  "startDate": "2022-01-15T00:00:00Z",
  "createdAt": "2022-01-15T00:00:00Z",
  "updatedAt": "2025-10-16T12:00:01Z"
}
```

**Error Response**: 404 Not Found
```json
{
  "error": "User not found",
  "id": "invalid-uuid"
}
```

### GET /api/users

**Purpose**: List users (paginated, cursor-based)

**Query Parameters**:
- `cursor` (optional): string, opaque cursor for pagination
- `limit` (optional): number, max results per page (default: 20, max: 100)

**Response**: 200 OK
```json
{
  "data": [
    {
      "id": "b1c2d3e4-5678-1234-9abc-1234567890ab",
      "email": "jane.doe@example.com",
    }
    // ...more users
  ],
  "nextCursor": "opaque-cursor-string-or-null"
}
```

---

## CORS Configuration

**Allowed Origins** (environment-based):
- Development: `http://localhost:5173` (Vite default)
- Production: Configured via `CORS_ORIGIN` environment variable

**Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
**Allowed Headers**: Content-Type, Authorization
**Credentials**: true

---

## Error Response Standard

All errors follow this format:

```json
{
  "error": "Short error title",
  "message": "Detailed error description",
  "timestamp": "2025-10-16T12:00:00Z",
  "path": "/api/events"
}
```

Status codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (future: authentication)
- 403: Forbidden (future: authorization)
- 404: Not Found
- 500: Internal Server Error
- 503: Service Unavailable (database/service down)

---

## Notes

- All timestamps in ISO 8601 format (UTC)
- All IDs are UUIDs
- Responses use implicit typing (no explicit schemas per constitution)
- Input validation uses Zod schemas
- Full CRUD API will be implemented in Spec 002
