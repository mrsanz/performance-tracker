import { randomUUID } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const persons = sqliteTable(
	'persons',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		email: text('email').notNull().unique(),
		firstName: text('first_name').notNull(),
		lastName: text('last_name').notNull(),
		title: text('title'),
		startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(t) => ({
		emailIdx: index('idx_persons_email').on(t.email),
	}),
)
