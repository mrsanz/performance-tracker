import { readPackage } from 'read-pkg'

export type AppInfo = {
  name: string
  version: string
}

let cached: AppInfo | null = null

export async function getAppInfo (): Promise<AppInfo> {
  if (cached) return cached
  const pkg = await readPackage({ cwd: process.cwd() })
  cached = { name: pkg.name ?? 'app', version: pkg.version ?? '0.0.0' }
  return cached
}
