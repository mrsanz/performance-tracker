import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import type { FastifyInstance } from 'fastify'

export default fp(async (fastify: FastifyInstance) => {
  const origins = fastify.config?.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean)

  await fastify.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (!origins || origins.length === 0) return cb(null, false)
      cb(null, origins.includes(origin))
    },
    credentials: true
  })
})
