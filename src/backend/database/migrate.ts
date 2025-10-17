import { db } from './client'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { fileURLToPath } from 'url'
import { join } from 'path'

// Directory containing migration SQL files (ESM-safe)
const currentDir = fileURLToPath(new URL('.', import.meta.url))
const migrationsFolder = join(currentDir, 'migrations')

async function runMigrations() {
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder })
  console.log('Migrations completed successfully')
}

if (import.meta.main) {
  runMigrations()
    .then(() => {
      process.exit(0)
    })
    .catch((err) => {
      console.error('Migration failed:', err)
      process.exit(1)
    })
}

export { runMigrations }