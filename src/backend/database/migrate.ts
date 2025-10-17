import { sqlite } from './client'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

// Directory containing migration SQL files (ESM-safe)
const currentDir = fileURLToPath(new URL('.', import.meta.url))
const migrationsDir = join(currentDir, 'migrations')

function getMigrationFiles(down = false): string[] {
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'))
  if (!down) {
    // Apply numbered files (e.g., 0000_*) but skip any drop_* files
    return files
      .filter((f) => /\d{4,}_/.test(f) && !f.includes('drop_'))
      .sort()
  }
  // For down: try to find drop_* files and apply in reverse order
  const dropFiles = files.filter((f) => f.includes('drop_'))
  return dropFiles.sort().reverse()
}

export async function runMigrations(down = false) {
  const migrationFiles = getMigrationFiles(down)
  if (migrationFiles.length === 0) {
    console.log('No migration files found to apply.')
    return
  }
  for (const file of migrationFiles) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8')
    try {
      sqlite.exec(sql)
      console.log(`${down ? 'Reverted' : 'Applied'} migration: ${file}`)
    } catch (err) {
      console.error(`Error ${down ? 'reverting' : 'applying'} migration ${file}:`, err)
      throw err
    }
  }
}

const down = process.argv.includes('--down')
runMigrations(down)
  .then(() => {
    console.log(down ? 'All migrations reverted.' : 'All migrations applied.')
  })
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })