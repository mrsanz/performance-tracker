import { QueryClient } from '@tanstack/react-query'

/**
 * Configured TanStack Query client for server state management
 * - Caches data for 1 minute before considering it stale
 * - Disables refetch on window focus to reduce unnecessary requests
 * - Retries failed requests once before throwing error
 * @example
 * ```typescript
 * import { QueryClientProvider } from '@tanstack/react-query'
 * import { queryClient } from './lib/query-client'
 *
 * function App() {
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <YourApp />
 *     </QueryClientProvider>
 *   )
 * }
 * ```
 */
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60, // 1 minute
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
})
