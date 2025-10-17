import { db } from '@/backend/database/client'
import { performanceEvents } from '@/backend/database/schema'
import { and, gte, lte, eq } from 'drizzle-orm'

/**
 * Example query: Get performance events for a person within a time range
 */
export async function getEventsByPersonAndTimeRange(
  personId: string,
  startTime: Date,
  endTime: Date
) {
  return db
    .select()
    .from(performanceEvents)
    .where(
      and(
        eq(performanceEvents.personId, personId),
        gte(performanceEvents.timestamp, startTime),
        lte(performanceEvents.timestamp, endTime)
      )
    )
    .orderBy(performanceEvents.timestamp)
}
