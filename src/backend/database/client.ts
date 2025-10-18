import 'dotenv/config'
import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from './schema'

// Use DATABASE_PATH from environment
const dbPath = process.env.DATABASE_PATH
if (!dbPath) {
	throw new Error('DATABASE_PATH environment variable is required')
}

export const sqlite = new Database(dbPath)

// Apply recommended SQLite PRAGMAs for app reliability and performance
// - WAL journaling for better concurrency
// - Enforce foreign keys at the database level
// - Synchronous NORMAL for balanced durability/perf
sqlite.exec('PRAGMA journal_mode = WAL;')
sqlite.exec('PRAGMA foreign_keys = ON;')
sqlite.exec('PRAGMA synchronous = NORMAL;')

export const db = drizzle(sqlite, { schema })
