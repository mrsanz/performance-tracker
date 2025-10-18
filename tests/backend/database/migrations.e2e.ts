import { describe, expect, test } from 'bun:test'
import { db } from '@/backend/database/client'
import { runMigrations } from '@/backend/database/migrate'

describe('Migrations', () => {
	test('are idempotent when run multiple times', async () => {
		await runMigrations()
		const before = await db.all('SELECT * FROM __drizzle_migrations')
		await runMigrations()
		const after = await db.all('SELECT * FROM __drizzle_migrations')
		expect(after.length).toBe(before.length)
		expect(after).toEqual(before)
	})
})
