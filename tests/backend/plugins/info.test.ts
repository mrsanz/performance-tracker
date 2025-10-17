import { describe, test, expect } from 'bun:test'
import { buildServer } from '@/backend/index'

describe('Info Plugin Integration Tests', () => {
  test('GET /infoz returns server status and version', async () => {
    const app = await buildServer()
    const response = await app.inject({ method: 'GET', url: '/infoz' })
    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.environment).toBeDefined()
    expect(body.name).toBe('performance-tracker')
    expect(body.status).toBe('running')
    expect(body.uptime).toBeGreaterThanOrEqual(0)
    expect(body.version).toMatch(/^\d+\.\d+\.\d+/)
    await app.close()
  })
})
