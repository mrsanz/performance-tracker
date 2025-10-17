import fp from 'fastify-plugin'
import fastifyEnv from '@fastify/env'

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      DATABASE_PATH: string
      PORT: number
      HOST: string
      NODE_ENV: 'development' | 'test' | 'production'
      CORS_ORIGIN?: string
    }
  }
}

const schema = {
  type: 'object',
  required: ['DATABASE_PATH', 'PORT', 'HOST', 'NODE_ENV'],
  properties: {
    DATABASE_PATH: { type: 'string' },
    PORT: { type: 'number', default: 3000 },
    HOST: { type: 'string', default: '0.0.0.0' },
    NODE_ENV: { type: 'string', enum: ['development', 'test', 'production'], default: 'development' },
    CORS_ORIGIN: { type: 'string' }
  }
} as const

export default fp(async (fastify) => {
  await fastify.register(fastifyEnv, {
    dotenv: true,
    schema,
    data: process.env,
    confKey: 'config'
  })
})
