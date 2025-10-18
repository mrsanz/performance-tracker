import { and, eq, gte, lte } from 'drizzle-orm'
import { db } from '@/backend/database/client'
import { performanceEvents } from '@/backend/database/schema'
import { attempt } from '@/backend/lib/errors'

/**
 * Example query: Get performance events for a person within a time range
 */
export async function getEventsByPersonAndTimeRange(
	personId: string,
	startTime: Date,
	endTime: Date,
) {
	return await db
		.select()
		.from(performanceEvents)
		.where(
			and(
				eq(performanceEvents.personId, personId),
				gte(performanceEvents.timestamp, startTime),
				lte(performanceEvents.timestamp, endTime),
			),
		)
		.orderBy(performanceEvents.timestamp)
}

/**
 * Effect-wrapped variant for getting performance events by person and time range
 * Composable with other Effect operations for functional error handling
 * @param personId - UUID of the person whose events to retrieve
 * @param startTime - Start of time range (inclusive)
 * @param endTime - End of time range (inclusive)
 * @returns Effect that resolves to array of events sorted by timestamp
 * @example
 * ```typescript
 * const events = await Effect.runPromise(
 *   getEventsByPersonAndTimeRangeE(
 *     'person-id',
 *     new Date('2025-01-01'),
 *     new Date('2025-12-31')
 *   )
 * )
 * ```
 */
export const getEventsByPersonAndTimeRangeE = (
	personId: string,
	startTime: Date,
	endTime: Date,
) =>
	attempt(
		async () =>
			await db
				.select()
				.from(performanceEvents)
				.where(
					and(
						eq(performanceEvents.personId, personId),
						gte(performanceEvents.timestamp, startTime),
						lte(performanceEvents.timestamp, endTime),
					),
				)
				.orderBy(performanceEvents.timestamp),
	)
