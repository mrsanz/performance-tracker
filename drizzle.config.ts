import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

// Drizzle Kit configuration for SQLite migrations generation.
// Paths are relative to the project root when running drizzle-kit.
// We keep this config inside src/backend/database and point to absolute-like paths from repo root.
const dbPath = process.env.DATABASE_PATH ?? 'data/performance-tracker.db'

export default defineConfig({
  dialect: 'sqlite',
  schema: 'src/backend/database/schema',
  out: 'src/backend/database/migrations',
  dbCredentials: { url: dbPath }
})
