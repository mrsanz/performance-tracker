/**
 * API client utilities for making HTTP requests to the backend
 */

const _API_BASE_URL = 'http://localhost:3000'

/**
 * Response type from GET /healthz endpoint
 * @property status - Overall health status ('healthy' | 'unhealthy')
 * @property app - Application information
 * @property database - Database connection and migration state
 * @property timestamp - Response timestamp
 * @property error - Optional error message when unhealthy
 */
export interface HealthResponse {
	status: string
	app: {
		environment: string
		name: string
		status: string
		uptime: number
		version: string
	}
	database: {
		connected: boolean
		latestMigration: string
		migrationDate: string
	}
	timestamp: string
}

/**
 * Response type from GET /infoz endpoint
 * @property environment - Current environment (development, production)
 * @property name - Application name
 * @property status - Server status
 * @property uptime - Server uptime in seconds
 * @property version - Application version from package.json
 */
export interface InfoResponse {
	environment: string
	name: string
	status: string
	uptime: number
	version: string
}

/**
 * Base fetch wrapper with error handling and JSON parsing
 * @param url - API endpoint URL (relative or absolute)
 * @param options - Optional fetch options (headers, method, body, etc.)
 * @returns Promise resolving to typed JSON response
 * @throws Error if response status is not OK
 */
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
	const response = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			...options?.headers,
		},
		...options,
	})

	if (!response.ok) {
		throw new Error(`API Error: ${response.status} ${response.statusText}`)
	}

	return response.json() as Promise<T>
}

/**
 * Fetches health status from the backend /healthz endpoint
 * Includes server status, database connection, and migration info
 * @returns Promise resolving to health status response
 * @throws Error if backend is unreachable or returns non-OK status
 * @example
 * ```typescript
 * const health = await fetchHealth()
 * console.log(health.status) // 'healthy' | 'unhealthy'
 * ```
 */
export async function fetchHealth(): Promise<HealthResponse> {
	return fetchAPI<HealthResponse>('/healthz')
}

/**
 * Fetches server information from the /infoz endpoint
 * Lightweight endpoint that doesn't check database connection
 * @returns Promise resolving to server info (version, uptime, environment)
 * @throws Error if backend is unreachable
 * @example
 * ```typescript
 * const info = await fetchInfo()
 * console.log(`Version: ${info.version}`)
 * ```
 */
export async function fetchInfo(): Promise<InfoResponse> {
	return fetchAPI<InfoResponse>('/infoz')
}
