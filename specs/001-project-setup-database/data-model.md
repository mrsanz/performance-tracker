# Data Model: Project Setup – Database, Infrastructure, and Folder Structure

**Feature**: 001-project-setup-database  
**Date**: 2025-10-16

## Overview

This document defines the initial database schema for the performance tracker application. The schema is intentionally minimal for the setup phase and will be extended in future specifications.

## Design Principles

- **Normalized Structure**: Follow 3NF to eliminate data redundancy
- **Type Safety**: Drizzle ORM schemas generate TypeScript types
- **Flexibility**: JSON payload allows schema evolution without migrations
- **Performance**: Indexes on timestamp and type for efficient queries
- **Audit Trail**: createdAt/updatedAt for all entities


## Entity: Person

### Purpose
Represents an employee or person in the system. Used for associating performance or review events and tracking activity.

### Schema Definition (Drizzle)

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const persons = sqliteTable('persons', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  title: text('title'),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
})
```

### Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID (text) | No | Primary key, auto-generated UUID |
| `email` | String (text) | No | Unique email address |
| `firstName` | String (text) | No | First name |
| `lastName` | String (text) | No | Last name |
| `title` | String (text) | Yes | Job title or role |
| `startDate` | DateTime (integer) | No | Employment start date |
| `createdAt` | DateTime (integer) | No | Record creation timestamp |
| `updatedAt` | DateTime (integer) | No | Record last update timestamp |

### Indexes

```typescript
import { index } from 'drizzle-orm/sqlite-core'

// Email uniqueness
index('idx_persons_email').on(persons.email)
```

### Constraints

- **Primary Key**: `id` (UUID)
- **Unique**: `email`
- **Not Null**: All fields except `title`

### Relationships

None in initial schema. Future specs may link persons to events, teams, etc.

---

## Entity: PerformanceEvent

### Purpose
Generic event entity for tracking performance-related data. Serves as the foundation for future performance analysis features.

### Schema Definition (Drizzle)

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const performanceEvents = sqliteTable('performance_events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text('person_id').notNull().references(() => persons.id),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  type: text('type').notNull(),
  payload: text('payload', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
})
```

### Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID (text) | No | Primary key, auto-generated UUID |
| `personId` | UUID (text) | No | Foreign key to Person (persons.id) |
| `timestamp` | DateTime (integer) | No | When the performance event occurred |
| `type` | String (text) | No | Event type discriminator (e.g., 'page_load', 'api_call') |
| `payload` | JSON (text) | No | Flexible event data (structure varies by type) |
| `createdAt` | DateTime (integer) | No | Record creation timestamp |
| `updatedAt` | DateTime (integer) | No | Record last update timestamp |

### Indexes

```typescript
import { index } from 'drizzle-orm/sqlite-core'

// Time-based queries (most common access pattern)
index('idx_performance_events_timestamp').on(performanceEvents.timestamp)

// Filter by event type
index('idx_performance_events_type').on(performanceEvents.type)

// Composite index for type + time range queries
index('idx_performance_events_type_timestamp').on(
  performanceEvents.type,
  performanceEvents.timestamp
)
```

### Constraints

- **Primary Key**: `id` (UUID)
- **Foreign Key**: `personId` references `persons.id`
- **Not Null**: All fields are required
- **Uniqueness**: None (multiple events can occur at same timestamp)

### Relationships

- Each PerformanceEvent is associated with a Person (employee/actor) via `personId` (foreign key to persons.id).
  - This enables tracking all events for a given user by their database id (preferred) or, if needed, by email (for legacy/external data).
  - Future specs may add team/event aggregations and baselines.

---


## Type Definitions

### Database Types (Generated by Drizzle)

#### Person

Location: `src/types/database/persons.ts`

```typescript
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { persons } from '../../server/database/schema'

// Type for selecting from database
export type Person = InferSelectModel<typeof persons>

// Type for inserting into database
export type NewPerson = InferInsertModel<typeof persons>
```

#### PerformanceEvent

Location: `src/types/database/performance-events.ts`

```typescript
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { performanceEvents } from '../../server/database/schema'

// Type for selecting from database
export type PerformanceEvent = InferSelectModel<typeof performanceEvents>

// Type for inserting into database
export type NewPerformanceEvent = InferInsertModel<typeof performanceEvents>

// Payload type (to be refined in future specs)
export type PerformanceEventPayload = Record<string, unknown>
```

### API Types (Separate from Database)

Location: `src/types/api/performance-events.ts`

```typescript
import { z } from 'zod'

// API input validation schema (Zod)
export const CreatePerformanceEventSchema = z.object({
  timestamp: z.string().datetime().or(z.date()),
  type: z.string().min(1).max(100),
  payload: z.record(z.unknown())
})

export type CreatePerformanceEventInput = z.infer<typeof CreatePerformanceEventSchema>

// API response types (implicit - defined by actual return values)
// No explicit response schemas per constitution
```

---


## Migration Files

### Initial Migration: 0001_create_persons.sql

```sql
-- Create persons table
CREATE TABLE IF NOT EXISTS persons (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  start_date INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Index for email
CREATE INDEX IF NOT EXISTS idx_persons_email ON persons(email);

-- Trigger to update updated_at on record modification
CREATE TRIGGER IF NOT EXISTS update_persons_updated_at
AFTER UPDATE ON persons
FOR EACH ROW
BEGIN
  UPDATE persons 
  SET updated_at = strftime('%s', 'now')
  WHERE id = NEW.id;
END;
```

### Rollback Migration: 0001_drop_persons.sql

```sql
-- Drop trigger
DROP TRIGGER IF EXISTS update_persons_updated_at;

-- Drop index
DROP INDEX IF EXISTS idx_persons_email;

-- Drop table
DROP TABLE IF EXISTS persons;
```

### Initial Migration: 0000_create_performance_events.sql

```sql
-- Create performance_events table
CREATE TABLE IF NOT EXISTS performance_events (
  id TEXT PRIMARY KEY NOT NULL,
  timestamp INTEGER NOT NULL,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_performance_events_timestamp 
ON performance_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_performance_events_type 
ON performance_events(type);

CREATE INDEX IF NOT EXISTS idx_performance_events_type_timestamp 
ON performance_events(type, timestamp);

-- Trigger to update updated_at on record modification
CREATE TRIGGER IF NOT EXISTS update_performance_events_updated_at
AFTER UPDATE ON performance_events
FOR EACH ROW
BEGIN
  UPDATE performance_events 
  SET updated_at = strftime('%s', 'now')
  WHERE id = NEW.id;
END;
```

### Rollback Migration: 0000_drop_performance_events.sql

```sql
-- Drop trigger
DROP TRIGGER IF EXISTS update_performance_events_updated_at;

-- Drop indexes
DROP INDEX IF EXISTS idx_performance_events_type_timestamp;
DROP INDEX IF EXISTS idx_performance_events_type;
DROP INDEX IF EXISTS idx_performance_events_timestamp;

-- Drop table
DROP TABLE IF EXISTS performance_events;
```

---

## Query Patterns

### Example Queries (using Drizzle)

```typescript
import { db } from '../database'
import { performanceEvents } from '../database/schema'
import { eq, gte, lte, and } from 'drizzle-orm'
import { Effect } from 'effect'

// Get event by ID
export const getEventById = (id: string) =>
  Effect.tryPromise({
    try: () => db.query.performanceEvents.findFirst({
      where: eq(performanceEvents.id, id)
    }),
    catch: (error) => new DatabaseError({ cause: error })
  })

// Get events by type in time range
export const getEventsByTypeAndTimeRange = (
  type: string,
  startTime: Date,
  endTime: Date
) =>
  Effect.tryPromise({
    try: () => db.query.performanceEvents.findMany({
      where: and(
        eq(performanceEvents.type, type),
        gte(performanceEvents.timestamp, startTime),
        lte(performanceEvents.timestamp, endTime)
      ),
      orderBy: (events, { desc }) => [desc(events.timestamp)]
    }),
    catch: (error) => new DatabaseError({ cause: error })
  })

// Create new event
export const createEvent = (event: NewPerformanceEvent) =>
  Effect.tryPromise({
    try: () => db.insert(performanceEvents).values(event).returning(),
    catch: (error) => new DatabaseError({ cause: error })
  })
```

---

## Performance Considerations

### SQLite Optimizations

1. **WAL Mode**: Enable Write-Ahead Logging for better concurrency
   ```typescript
   db.run('PRAGMA journal_mode = WAL;')
   ```

2. **Foreign Keys**: Enable foreign key constraints
   ```typescript
   db.run('PRAGMA foreign_keys = ON;')
   ```

3. **Synchronous Mode**: Use NORMAL for balance of safety and speed
   ```typescript
   db.run('PRAGMA synchronous = NORMAL;')
   ```

4. **Cache Size**: Increase cache for better read performance
   ```typescript
   db.run('PRAGMA cache_size = -64000;') // 64MB
   ```

### Query Optimization

- **Indexes**: All common query patterns covered by indexes
- **Limit Results**: Always use LIMIT for large result sets
- **Prepared Statements**: Drizzle uses prepared statements by default
- **Connection Pooling**: Not needed for SQLite (single-writer)

---

## Future Schema Extensions

The following entities will be extended or added in future specifications:

### Users (Spec 002)
- Team membership

### Teams (Spec 002)
- Team aggregations
- Performance baselines per team
- Team-level analytics

### EventAggregations (Spec 003)
- Pre-computed statistics
- Materialized views for dashboard
- Time-series rollups

### DataSources (Spec 003)
- External data source configurations
- Ingestion schedules
- Mapping rules

---

## Testing Strategy

### Unit Tests

Test each query function with in-memory database:

```typescript
import { describe, test, expect } from 'bun:test'
import { createEvent, getEventById } from './queries'
import { Effect } from 'effect'

describe('PerformanceEvent Queries', () => {
  test('should create and retrieve event', async () => {
    const newEvent = {
      timestamp: new Date(),
      type: 'test_event',
      payload: { test: true }
    }
    
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const created = yield* createEvent(newEvent)
        const retrieved = yield* getEventById(created[0].id)
        return retrieved
      })
    )
    
    expect(result).toBeDefined()
    expect(result?.type).toBe('test_event')
  })
})
```

### Integration Tests

Test migrations and schema evolution:

```typescript
test('should run migrations up and down', async () => {
  // Run migration up
  await runMigrations('up')
  
  // Verify table exists
  const tables = await db.run("SELECT name FROM sqlite_master WHERE type='table'")
  expect(tables).toContain('performance_events')
  
  // Run migration down
  await runMigrations('down')
  
  // Verify table removed
  const tablesAfter = await db.run("SELECT name FROM sqlite_master WHERE type='table'")
  expect(tablesAfter).not.toContain('performance_events')
})
```

---

## Summary

- **Entities**: PerformanceEvent (generic, flexible), Person (employee/actor)
- **Type-Safe**: Drizzle generates TypeScript types
- **Performant**: Indexed for time-series, type, and email filtering
- **Evolvable**: JSON payload allows schema flexibility
- **Testable**: Effect-wrapped queries for error handling
- **Separate Concerns**: Database types ≠ API types (constitution requirement)
