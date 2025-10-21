import { randomUUID } from 'node:crypto'
import { db } from './client'
import { performanceEvents, persons } from './schema'

const FIRST_NAMES = ['Alice', 'Bob', 'Carol', 'David', 'Eve']
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones']
const TITLES = ['Engineer', 'Manager', 'Analyst', 'Designer', 'QA']
const EVENT_TYPES = [
	'author-pr',
	'review-pr',
	'create-issue',
	'scope-issue',
	'contribute-pr',
	'complete-issue',
]

function randomDate(start: Date, end: Date) {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	)
}

async function seed() {
	// Clear tables (for idempotency in dev)
	await db.delete(performanceEvents)
	await db.delete(persons)

	// Insert 5 persons
	const personRows = []

	for (let i = 0; i < 5; i++) {
		personRows.push({
			id: randomUUID(),
			email: `user${i + 1}@example.com`,
			firstName: FIRST_NAMES[i % FIRST_NAMES.length] ?? '',
			lastName: LAST_NAMES[i % LAST_NAMES.length] ?? '',
			title: TITLES[i % TITLES.length] ?? '',
			startDate: new Date(2022, 0, 1 + i * 30),
			createdAt: new Date(),
			updatedAt: new Date(),
		})
	}
	await db.insert(persons).values(personRows)

	// Insert 60 performance events (randomly distributed)
	const eventRows = []

	for (let i = 0; i < 60; i++) {
		const person = personRows[i % personRows.length]
		if (person == null) continue
		eventRows.push({
			id: randomUUID(),
			personId: person.id,
			timestamp: randomDate(new Date(2023, 0, 1), new Date()),
			type: EVENT_TYPES[i % EVENT_TYPES.length] ?? 'event',
			payload: { detail: `Event ${i + 1}` },
			createdAt: new Date(),
			updatedAt: new Date(),
		})
	}
	await db.insert(performanceEvents).values(eventRows)

	console.log('Seeded 5 persons and 60 performance events.')
}

seed().catch((err) => {
	console.error('Seeding failed:', err)
	process.exit(1)
})
