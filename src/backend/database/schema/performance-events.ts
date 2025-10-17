import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { persons } from './persons'

export const performanceEvents = sqliteTable(
  'performance_events',
  {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
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
  },
  (t) => ({
    timestampIdx: index('idx_performance_events_timestamp').on(t.timestamp),
    typeIdx: index('idx_performance_events_type').on(t.type),
    typeTimestampIdx: index('idx_performance_events_type_timestamp').on(
      t.type,
      t.timestamp
    )
  })
)
