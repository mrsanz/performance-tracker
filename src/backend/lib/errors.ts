import { Data, Effect } from 'effect'

export class DatabaseError extends Data.TaggedError('DatabaseError')<{
	cause: unknown
}> {}

export const attempt = <A>(thunk: () => Promise<A>) =>
	Effect.tryPromise({
		try: thunk,
		catch: (cause) => new DatabaseError({ cause }),
	})
