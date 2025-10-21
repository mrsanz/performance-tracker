import { readPackage } from 'read-pkg'

/**
 * Application information from package.json
 * @property name - Application name
 * @property version - Semantic version string
 */
export interface AppInfo {
	name: string
	version: string
}

let cached: AppInfo | null = null

/**
 * Retrieves application name and version from package.json
 * Results are cached after first call for performance
 * @returns Promise resolving to app name and version
 * @example
 * ```typescript
 * const info = await getAppInfo()
 * console.log(`${info.name} v${info.version}`)
 * ```
 */
export async function getAppInfo(): Promise<AppInfo> {
	if (cached != null) return cached
	const pkg = await readPackage({ cwd: process.cwd() })
	cached = { name: pkg.name ?? 'app', version: pkg.version ?? '0.0.0' }
	return cached
}
