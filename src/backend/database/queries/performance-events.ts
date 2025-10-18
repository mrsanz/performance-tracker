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

// Effect-wrapped variant for composability
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
