import { useQuery } from '@tanstack/react-query'
import { fetchHealth, type HealthResponse } from '../lib/api-client'

/**
 * React hook for fetching and caching health status from the backend
 * Automatically refetches every 30 seconds
 */
export function useHealth() {
	return useQuery<HealthResponse>({
		queryKey: ['health'],
		queryFn: fetchHealth,
		refetchInterval: 30000, // Refetch every 30 seconds
		retry: 2,
	})
}
