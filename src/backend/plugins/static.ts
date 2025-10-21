/**
 * Static file serving plugin for frontend assets
 * Serves the built frontend from src/frontend/dist
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fastifyStatic from '@fastify/static'
import type { FastifyPluginAsync } from 'fastify'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const staticPlugin: FastifyPluginAsync = async (fastify) => {
	// Only serve static files in production
	// In development, Vite dev server handles the frontend
	if (fastify.config.NODE_ENV === 'development') {
		fastify.log.info('Skipping static file serving in development mode')
		return
	}

	const distPath = path.join(__dirname, '../../frontend/dist')

	// Serve static files from frontend/dist
	await fastify.register(fastifyStatic, {
		root: distPath,
		prefix: '/',
		// Don't serve index.html automatically for API routes
		constraints: {
			host: /.*/,
		},
	})

	// SPA fallback: serve index.html for all non-API routes
	fastify.setNotFoundHandler((request, reply) => {
		// If it's an API route or file request, return 404
		if (
			request.url.startsWith('/api') ||
			request.url.startsWith('/healthz') ||
			request.url.startsWith('/infoz') ||
			request.url.includes('.')
		) {
			reply.code(404).send({ error: 'Not Found' })
			return
		}

		// Otherwise serve index.html for SPA routing
		reply.sendFile('index.html')
	})
}
