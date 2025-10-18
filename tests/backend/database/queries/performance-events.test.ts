import { describe, expect, test } from 'bun:test'
import { db } from '@/backend/database/client'
import { getEventsByPersonAndTimeRange } from '@/backend/database/queries/performance-events'
import { persons } from '@/backend/database/schema'

describe('Performance Events Queries', () => {
	describe('getEventsByPersonAndTimeRange', () => {
		test('returns events within time range for existing person', async () => {
			// Get a real person from DB
			const person = await db.select().from(persons).limit(1)
			if (person.length === 0) {
				throw new Error('No persons in database. Run `bun run db:seed` first.')
			}

			const testPersonId = person[0]!.id
			const startTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
			const endTime = new Date()

			const events = await getEventsByPersonAndTimeRange(
				testPersonId,
				startTime,
				endTime,
			)

			// Should return an array
			expect(Array.isArray(events)).toBe(true)

			// All events should be for the correct person
			events.forEach((event) => {
				expect(event.personId).toBe(testPersonId)
			})

			// All events should be within the time range
			events.forEach((event) => {
				const eventTime = new Date(event.timestamp)
				expect(eventTime.getTime()).toBeGreaterThanOrEqual(startTime.getTime())
				expect(eventTime.getTime()).toBeLessThanOrEqual(endTime.getTime())
			})
		})

		test('returns empty array when no events match criteria', async () => {
			const testPersonId = 'non-existent-person-id'
			const startTime = new Date('2025-01-01')
			const endTime = new Date('2025-01-31')

			const events = await getEventsByPersonAndTimeRange(
				testPersonId,
				startTime,
				endTime,
			)

			expect(events).toHaveLength(0)
		})

		test('returns events in chronological order', async () => {
			const person = await db.select().from(persons).limit(1)
			if (person.length === 0) {
				throw new Error('No persons in database. Run `bun run db:seed` first.')
			}

			const testPersonId = person[0]!.id
			const startTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
			const endTime = new Date()

			const events = await getEventsByPersonAndTimeRange(
				testPersonId,
				startTime,
				endTime,
			)

			if (events.length > 1) {
				for (let i = 0; i < events.length - 1; i++) {
					const current = new Date(events[i]!.timestamp).getTime()
					const next = new Date(events[i + 1]!.timestamp).getTime()
					expect(current).toBeLessThanOrEqual(next)
				}
			}
		})

		test('handles edge case of future date range', async () => {
			const person = await db.select().from(persons).limit(1)
			if (person.length === 0) {
				throw new Error('No persons in database. Run `bun run db:seed` first.')
			}

			const testPersonId = person[0]!.id
			const startTime = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
			const endTime = new Date(Date.now() + 366 * 24 * 60 * 60 * 1000)

			const events = await getEventsByPersonAndTimeRange(
				testPersonId,
				startTime,
				endTime,
			)

			expect(events).toHaveLength(0)
		})
	})
})
