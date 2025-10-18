import cors from '@fastify/cors'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

export default fp(async (fastify: FastifyInstance) => {
	const origins = fastify.config?.CORS_ORIGIN?.split(',')
		.map((s) => s.trim())
		.filter(Boolean)

	await fastify.register(cors, {
		origin: (origin, cb) => {
			if (!origin) return cb(null, true)
			if (origins == null || origins.length === 0) return cb(null, false)
			cb(null, origins.includes(origin))
		},
		credentials: true,
	})
})
