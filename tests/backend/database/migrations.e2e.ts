import { describe, test, expect } from 'bun:test'
import { runMigrations } from '@/backend/database/migrate'
import { db } from '@/backend/database/client'

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
