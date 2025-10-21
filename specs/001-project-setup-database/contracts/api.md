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

  **Response**: 200 OK
  // Only indexed fields are returned for fast pagination and subsequent queries
  ```json
  {
    "data": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "personId": "b1c2d3e4-5678-1234-9abc-1234567890ab",
        "type": "page_load",
        "timestamp": "2025-10-16T12:00:00Z"
      }
      // ...more events
    ],
    "nextCursor": "YmFzZTY0LWVuY29kZWQtZXZlbnRJRA==" // base64-encoded event ID or null
  }
  ```
  },
  "status": "unhealthy",
  "error": "Database connection failed",
  "timestamp": "2025-10-16T12:00:00Z"

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


  **Response**: 200 OK
  // Only indexed fields are returned for fast pagination and subsequent queries
  ```json
  {
    "data": [
      {
        "id": "b1c2d3e4-5678-1234-9abc-1234567890ab",
        "email": "jane.doe@example.com",
        "startDate": "2022-01-15T00:00:00Z"
      }
      // ...more persons
    ],
    "nextCursor": "YmFzZTY0LWVuY29kZWQtcGVyc29uSUQ=" // base64-encoded person ID or null
  }
  ```

  ---

  ## Indexed Data Only for Paginated APIs

  For all cursor-based (plural) APIs, only indexed fields are returned in the response. This ensures fast pagination and efficient subsequent queries. To fetch full details, use the singular endpoint (e.g., `/api/events/:id` or `/api/persons/:id`).
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
// Only indexed fields are returned for fast pagination and subsequent queries
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "personId": "b1c2d3e4-5678-1234-9abc-1234567890ab",
      "type": "page_load",
      "timestamp": "2025-10-16T12:00:00Z"
    }
    // ...more events
  ],
  "nextCursor": "YmFzZTY0LWVuY29kZWQtZXZlbnRJRA==" // base64-encoded event ID or null
}
```

**Error Response**: 400 Bad Request (invalid cursor)
```json
{
  "error": "Invalid cursor",
  "message": "Cursor format is invalid or expired"
}
```

**Error Response**: 500 Internal Server Error
```json
{
  "error": "Failed to fetch events",
  "message": "Database error occurred"
}
```

---


### GET /api/persons/:id

**Purpose**: Retrieve a single person by ID

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
  "error": "Person not found",
  "id": "invalid-uuid"
}
```


### GET /api/persons

**Purpose**: List persons (paginated, cursor-based)

**Query Parameters**:
- `cursor` (optional): string, opaque cursor for pagination (e.g., base64-encoded person ID)
- `limit` (optional): number, max results per page (default: 20, max: 100)

**Response**: 200 OK
// Only indexed fields are returned for fast pagination and subsequent queries
```json
{
  "data": [
    {
      "id": "b1c2d3e4-5678-1234-9abc-1234567890ab",
      "email": "jane.doe@example.com",
      "startDate": "2022-01-15T00:00:00Z"
    }
    // ...more persons
  ],
  "nextCursor": "YmFzZTY0LWVuY29kZWQtcGVyc29uSUQ=" // base64-encoded person ID or null
}
```

**Error Response**: 400 Bad Request (invalid cursor)
```json
{
  "error": "Invalid cursor",
  "message": "Cursor format is invalid or expired"
}
```

**Error Response**: 500 Internal Server Error
```json
{
  "error": "Failed to fetch persons",
  "message": "Database error occurred"
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
