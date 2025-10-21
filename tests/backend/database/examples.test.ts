import { describe, expect, test } from 'bun:test'
import { Effect } from 'effect'
import { db } from '@/backend/database/client'
import { listPersonsWithLatestEvent } from '@/backend/database/queries/examples'
import { persons } from '@/backend/database/schema'

describe('Example Queries', () => {
	test('listPersonsWithLatestEvent returns rows with expected fields', async () => {
		// Ensure we have data
		const personCount = await db.select().from(persons)
		if (personCount.length === 0) {
			throw new Error('No persons in database. Run `bun run db:seed` first.')
		}

		const rows = await Effect.runPromise(listPersonsWithLatestEvent())

		expect(Array.isArray(rows)).toBe(true)
		if (rows.length > 0) {
			const r = rows[0]
			expect(r).toHaveProperty('personId')
			expect(r).toHaveProperty('firstName')
			expect(r).toHaveProperty('lastName')
			expect(r).toHaveProperty('email')
			// latestEventType / latestEventTimestamp may be null when person has no events
		}
	})
})
