/**
 * Test setup for frontend tests
 * Extends jest-dom matchers and cleans up after tests
 * (DOM globals are registered via preload.ts)
 */
import { afterEach, expect } from 'bun:test'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend expect with jest-dom matchers (toBeDisabled, toHaveTextContent, etc.)
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
	cleanup()
})
