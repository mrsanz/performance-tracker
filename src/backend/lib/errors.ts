import { Data, Effect } from 'effect'

/**
 * Tagged error for database operation failures
 * Used with Effect for type-safe error handling
 * @property _tag - 'DatabaseError' discriminant
 * @property cause - Optional underlying error cause
 */
export class DatabaseError extends Data.TaggedError('DatabaseError')<{
	cause?: unknown
}> {}

/**
 * Wraps a Promise-returning function in an Effect with error handling
 * Automatically catches errors and wraps them in DatabaseError
 * @param thunk - Async function to execute
 * @returns Effect that resolves to the function's result or fails with DatabaseError
 * @example
 * ```typescript
 * const query = attempt(async () => {
 *   return await db.select().from(users)
 * })
 * const result = await Effect.runPromise(query)
 * ```
 */
export const attempt = <A>(thunk: () => Promise<A>) =>
	Effect.tryPromise({
		try: thunk,
		catch: (cause) => new DatabaseError({ cause }),
	})
