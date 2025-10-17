import Fastify from 'fastify'
import envPlugin from './plugins/env'
import dbPlugin from './plugins/db'
import corsPlugin from './plugins/cors'
import healthPlugin from './plugins/health'
import infoPlugin from './plugins/info'
import { persons } from './database/schema'

async function buildServer() {
  const app = Fastify({ logger: true })

  await app.register(envPlugin)
  await app.register(corsPlugin)
  await app.register(dbPlugin)
  await app.register(healthPlugin)
  await app.register(infoPlugin)

  return app
}

if (import.meta.main) {
  const app = await buildServer()
  
  // Startup DB validation
  try {
    await app.db.select().from(persons).limit(1)
    app.log.info('Database connection verified')
  } catch (err) {
    app.log.error(err, 'Failed to connect to database on startup')
    process.exit(1)
  }
  
  const port = app.config.PORT ?? 3000
  const host = app.config.HOST ?? '0.0.0.0'
  await app.listen({ port, host })
}

export { buildServer }
