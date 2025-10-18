import { describe, expect, test } from 'bun:test'
import { db, sqlite } from '@/backend/database/client'

describe('Database Indexes & Foreign Keys', () => {
	test('indexes exist per data model', async () => {
		const evtIndexes = (await db.all(
			"PRAGMA index_list('performance_events')",
		)) as Array<{ name: string }>

		const evtIndexNames = evtIndexes.map((i) => i.name)
		expect(evtIndexNames).toEqual(
			expect.arrayContaining([
				'idx_performance_events_timestamp',
				'idx_performance_events_type',
				'idx_performance_events_type_timestamp',
			]),
		)

		const personIndexes = (await db.all(
			"PRAGMA index_list('persons')",
		)) as Array<{ name: string }>
		const personIndexNames = personIndexes.map((i) => i.name)
		expect(personIndexNames).toEqual(
			expect.arrayContaining(['idx_persons_email']),
		)
	})

	test('foreign key enforcement prevents invalid personId', async () => {
		// Attempt to insert a performance event with a non-existent personId
		let error: unknown = null
		try {
			sqlite.exec(
				`INSERT INTO performance_events (id, person_id, timestamp, type, payload, created_at, updated_at)
         VALUES ('test-evt', 'no-such-person', strftime('%s','now'), 'test', '{}', strftime('%s','now'), strftime('%s','now'))`,
			)
		} catch (e) {
			error = e
		}

		expect(error).not.toBeNull()
	})
})
