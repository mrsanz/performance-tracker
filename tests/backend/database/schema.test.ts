import { describe, test, expect } from 'bun:test'
import { db } from '@/backend/database/client'

describe('Database Schema', () => {
  test('Person and PerformanceEvent tables exist with FK', async () => {
    // Check tables exist
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'")
    const tableNames = tables.map(t => t.name)
    expect(tableNames).toContain('persons')
    expect(tableNames).toContain('performance_events')
    // Check FK
    const fks = await db.all("PRAGMA foreign_key_list('performance_events')") as Array<{ table: string }>
    expect(fks.length).toBeGreaterThan(0)
    expect(fks[0]?.table).toBe('persons')
  })
})
