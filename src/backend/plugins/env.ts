import fp from 'fastify-plugin'
import fastifyEnv from '@fastify/env'
import { environmentValidationSchema as schema } from '../lib/environment-validation-schema'

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

export default fp(async (fastify) => {
  await fastify.register(fastifyEnv, {
    dotenv: true,
    schema,
    data: process.env,
    confKey: 'config'
  })
})
