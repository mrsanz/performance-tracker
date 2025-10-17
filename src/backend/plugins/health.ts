import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { getAppInfo } from '@/backend/lib/app-info'
import { persons } from '@/backend/database/schema'

export default fp(async (fastify: FastifyInstance) => {
  fastify.get('/healthz', async (request, reply) => {
    const { name, version } = await getAppInfo()
    
    // Check DB connection
    let dbConnected = false
    let latestMigration: string | null = null
    let migrationDate: string | null = null
    
    try {
      // Query Drizzle's migration tracking table
      const migrations = await fastify.db.all<{ hash: string, created_at: number }>(
        'SELECT hash, created_at FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 1'
      )
      
      if (migrations && migrations.length > 0 && migrations[0]) {
        latestMigration = migrations[0].hash
        migrationDate = new Date(migrations[0].created_at).toISOString()
      }
      
      // Test actual DB connection via a simple query
      await fastify.db.select().from(persons).limit(1)
      dbConnected = true
    } catch (err) {
      fastify.log.error(err, 'Health check DB connection failed')
    }
    
    if (!dbConnected) {
      return reply.status(503).send({
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      })
    }
    
    return {
      status: 'healthy',
      app: {
        environment: fastify.config.NODE_ENV,
        name,
        status: 'running',
        uptime: Math.floor(process.uptime()),
        version
      },
      database: {
        connected: dbConnected,
        latestMigration,
        migrationDate
      },
      timestamp: new Date().toISOString()
    }
  })
})
