import { describe, expect, test } from 'bun:test'
import { spawnSync } from 'bun'

// This E2E test simulates the onboarding flow: migrate DB, start server, hit /healthz

describe('Onboarding Flow', () => {
	test('can migrate, start server, and get healthy response from /healthz', async () => {
		// Step 1: Run migrations
		const migrateResult = spawnSync({
			cmd: ['bun', 'run', 'db:migrate'],
			stdout: 'pipe',
			stderr: 'pipe',
			timeout: 10000,
		})
		expect(migrateResult.exitCode).toBe(0)

		// Step 2: Start server in background
		const serverProcess = Bun.spawn({
			cmd: ['bun', 'run', 'dev:server'],
			stdout: 'pipe',
			stderr: 'pipe',
			env: process.env,
		})

		// Wait for server to start
		let started = false
		let output = ''
		const start = Date.now()
		const reader = serverProcess.stdout.getReader()
		while (Date.now() - start < 10000) {
			const { value, done } = await reader.read()
			if (done) break
			output += new TextDecoder().decode(value)
			if (output.includes('listening') || output.includes('Server listening')) {
				started = true
				break
			}
		}
		expect(started).toBe(true)

		// Step 3: Hit /healthz
		const healthResult = spawnSync({
			cmd: ['curl', '-s', 'http://localhost:3000/healthz'],
			stdout: 'pipe',
			stderr: 'pipe',
			timeout: 5000,
		})
		expect(healthResult.exitCode).toBe(0)
		expect(healthResult.stdout.toString()).toMatch(/healthy|version|database/)

		// Cleanup
		serverProcess.kill()
	})
})
