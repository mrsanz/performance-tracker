import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/backend/database/client'
import { persons } from '@/backend/database/schema'
import { attempt } from '@/backend/lib/errors'

/**
 * Input type for creating a new person
 * @property id - Optional UUID (auto-generated if not provided)
 * @property email - Unique email address
 * @property firstName - Person's first name
 * @property lastName - Person's last name
 * @property title - Optional job title
 * @property startDate - Employment start date
 */
export type NewPersonInput = {
	id?: string
	email: string
	firstName: string
	lastName: string
	title?: string | null
	startDate: Date
}

/**
 * Lists all persons in the database
 * @returns Effect that resolves to array of all persons
 * @example
 * ```typescript
 * const result = await Effect.runPromise(listPersons())
 * console.log(result) // [{ id: '...', email: '...', ... }]
 * ```
 */
export const listPersons = () =>
	attempt(async () => {
		return await db.select().from(persons)
	})

/**
 * Retrieves a single person by their unique ID
 * @param id - UUID of the person to retrieve
 * @returns Effect that resolves to person object or null if not found
 * @example
 * ```typescript
 * const result = await Effect.runPromise(getPersonById('abc-123'))
 * if (result) console.log(result.email)
 * ```
 */
export const getPersonById = (id: string) =>
	attempt(async () => {
		const rows = await db
			.select()
			.from(persons)
			.where(eq(persons.id, id))
			.limit(1)
		return rows[0] ?? null
	})

/**
 * Creates a new person in the database
 * @param input - Person data (email, firstName, lastName, optional title and startDate)
 * @returns Effect that resolves to the created person with generated ID
 * @throws DatabaseError if email already exists (unique constraint)
 * @example
 * ```typescript
 * const newPerson = await Effect.runPromise(
 *   createPerson({
 *     email: 'jane@example.com',
 *     firstName: 'Jane',
 *     lastName: 'Doe',
 *     startDate: new Date('2025-01-01')
 *   })
 * )
 * ```
 */
export const createPerson = (input: NewPersonInput) =>
	attempt(async () => {
		const values = {
			id: input.id ?? randomUUID(),
			email: input.email,
			firstName: input.firstName,
			lastName: input.lastName,
			title: input.title ?? null,
			startDate: input.startDate,
			// createdAt/updatedAt have defaults in schema
		}
		await db.insert(persons).values(values)
		return values
	})
