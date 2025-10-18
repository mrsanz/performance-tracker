import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/backend/database/client'
import { persons } from '@/backend/database/schema'
import { attempt } from '@/backend/lib/errors'

export type NewPersonInput = {
	id?: string
	email: string
	firstName: string
	lastName: string
	title?: string | null
	startDate: Date
}

export const listPersons = () =>
	attempt(async () => {
		return await db.select().from(persons)
	})

export const getPersonById = (id: string) =>
	attempt(async () => {
		const rows = await db
			.select()
			.from(persons)
			.where(eq(persons.id, id))
			.limit(1)
		return rows[0] ?? null
	})

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
