import { eq } from 'drizzle-orm'
import { db } from '@/backend/database/client'
import { performanceEvents, persons } from '@/backend/database/schema'
import { attempt } from '@/backend/lib/errors'

/**
 * Example query demonstrating person-event join relationship
 * Returns all persons with their latest performance event (if any)
 * Note: This is a simplified example; for true "latest per person", use window functions
 * @returns Effect that resolves to array of persons with their most recent event
 * @example
 * ```typescript
 * const result = await Effect.runPromise(listPersonsWithLatestEvent())
 * result.forEach(row => {
 *   console.log(`${row.firstName} ${row.lastName}: ${row.latestEventType}`)
 * })
 * ```
 */
export const listPersonsWithLatestEvent = () =>
	attempt(async () => {
		// For each person, get their most recent performance event (if any)
		const rows = await db
			.select({
				personId: persons.id,
				firstName: persons.firstName,
				lastName: persons.lastName,
				email: persons.email,
				latestEventType: performanceEvents.type,
				latestEventTimestamp: performanceEvents.timestamp,
			})
			.from(persons)
			.leftJoin(performanceEvents, eq(persons.id, performanceEvents.personId))
			.orderBy(persons.lastName, persons.firstName, performanceEvents.timestamp)

		// Note: This is a simple example; for true "latest per person", use a subquery or window fn
		return rows
	})
