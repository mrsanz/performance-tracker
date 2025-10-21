import { describe, expect, test } from 'bun:test'
import { execSync } from 'node:child_process'
import { db } from '@/backend/database/client'
import { performanceEvents, persons } from '@/backend/database/schema'

describe('Database Seeding', () => {
	test('creates 5 Persons and at least 20 PerformanceEvents', async () => {
		execSync('bun run db:seed')
		const personCount = await db.select().from(persons)
		const eventCount = await db.select().from(performanceEvents)
		expect(personCount.length).toBeGreaterThanOrEqual(5)
		expect(eventCount.length).toBeGreaterThanOrEqual(20)
	})

	test('seed includes variety of event types and timestamps', async () => {
		const rows = await db
			.select({ type: performanceEvents.type, ts: performanceEvents.timestamp })
			.from(performanceEvents)
		const types = new Set(rows.map((r) => r.type))
		expect(types.size).toBeGreaterThanOrEqual(4)

		const times = rows.map((r) => new Date(r.ts).getTime())
		const min = Math.min(...times)
		const max = Math.max(...times)
		expect(max).toBeGreaterThan(min)
	})
})
