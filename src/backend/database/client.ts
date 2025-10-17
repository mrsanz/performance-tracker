import 'dotenv/config'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { Database } from 'bun:sqlite'
import * as schema from './schema'

// Use DATABASE_PATH from environment
const dbPath = process.env.DATABASE_PATH
if (!dbPath) {
  throw new Error('DATABASE_PATH environment variable is required')
}

export const sqlite = new Database(dbPath)
export const db = drizzle(sqlite, { schema })