/**
 * API client utilities for making HTTP requests to the backend
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

export interface InfoResponse {
	environment: string
	name: string
	status: string
	uptime: number
	version: string
}

/**
 * Base fetch wrapper with error handling
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
 * Fetch health status from /healthz endpoint
 */
export async function fetchHealth(): Promise<HealthResponse> {
	return fetchAPI<HealthResponse>('/healthz')
}

/**
 * Fetch server info from /infoz endpoint
 */
export async function fetchInfo(): Promise<InfoResponse> {
	return fetchAPI<InfoResponse>('/infoz')
}
