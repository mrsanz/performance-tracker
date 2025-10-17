import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { getAppInfo } from '@/backend/lib/app-info'

export default fp(async (fastify: FastifyInstance) => {
  fastify.get('/infoz', async () => {
    const { name, version } = await getAppInfo()
    return {
      environment: fastify.config.NODE_ENV,
      name,
      status: 'running',
      uptime: Math.floor(process.uptime()),
      version
    }
  })
})
