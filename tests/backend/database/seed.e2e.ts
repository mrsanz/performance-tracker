import { describe, test, expect } from 'bun:test'
import { db } from '@/backend/database/client'
import { persons, performanceEvents } from '@/backend/database/schema'
import { execSync } from 'child_process'

describe('Database Seeding', () => {
  test('creates 5 Persons and at least 20 PerformanceEvents', async () => {
    execSync('bun run db:seed')
    const personCount = await db.select().from(persons)
    const eventCount = await db.select().from(performanceEvents)
    expect(personCount.length).toBeGreaterThanOrEqual(5)
    expect(eventCount.length).toBeGreaterThanOrEqual(20)
  })
})
