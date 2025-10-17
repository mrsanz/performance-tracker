import { db } from './client'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { fileURLToPath } from 'url'
import { join } from 'path'
import envSchema from 'env-schema'
import { environmentValidationSchema as schema } from '../lib/environment-validation-schema'
import { readFileSync } from 'fs'

// Load .env file manually (simple dotenv implementation)
const envPath = join(process.cwd(), '.env')
let env = { ...process.env }
try {
  const envContent = readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) env[key.trim()] = value.trim()
  })
} catch {}

// Validate environment
const config = envSchema({
  schema,
  data: env,
})

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