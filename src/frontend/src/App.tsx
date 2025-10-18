import { useHealth } from './hooks/useHealth'

function App() {
	const { data: health, isLoading, error } = useHealth()

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-3xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
						Performance Tracker
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400">
						Backend Health Status
					</p>
				</div>

				<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
					{isLoading && (
						<div className="text-center py-4">
							<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
							<p className="mt-2 text-gray-600 dark:text-gray-400">
								Loading health status...
							</p>
						</div>
					)}

					{error && (
						<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
							<h3 className="text-red-800 dark:text-red-200 font-semibold mb-1">
								Error
							</h3>
							<p className="text-red-600 dark:text-red-300 text-sm">
								{error instanceof Error
									? error.message
									: 'Failed to fetch health status'}
							</p>
						</div>
					)}

					{health && (
						<div className="space-y-4">
							<div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
								<span className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Status
								</span>
								<span
									className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
										health.status === 'healthy'
											? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
											: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
									}`}
								>
									{health.status}
								</span>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
									Application
								</h3>
								<dl className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<dt className="text-gray-500 dark:text-gray-400">Name</dt>
										<dd className="text-gray-900 dark:text-white font-medium mt-1">
											{health.app.name}
										</dd>
									</div>
									<div>
										<dt className="text-gray-500 dark:text-gray-400">
											Version
										</dt>
										<dd className="text-gray-900 dark:text-white font-medium mt-1">
											{health.app.version}
										</dd>
									</div>
									<div>
										<dt className="text-gray-500 dark:text-gray-400">
											Environment
										</dt>
										<dd className="text-gray-900 dark:text-white font-medium mt-1">
											{health.app.environment}
										</dd>
									</div>
									<div>
										<dt className="text-gray-500 dark:text-gray-400">Uptime</dt>
										<dd className="text-gray-900 dark:text-white font-medium mt-1">
											{health.app.uptime}s
										</dd>
									</div>
								</dl>
							</div>

							<div className="pt-4 border-t border-gray-200 dark:border-gray-700">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
									Database
								</h3>
								<dl className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<dt className="text-gray-500 dark:text-gray-400">
											Connected
										</dt>
										<dd className="text-gray-900 dark:text-white font-medium mt-1">
											{health.database.connected ? 'Yes' : 'No'}
										</dd>
									</div>
									<div>
										<dt className="text-gray-500 dark:text-gray-400">
											Latest Migration
										</dt>
										<dd className="text-gray-900 dark:text-white font-medium mt-1 break-all">
											{health.database.latestMigration}
										</dd>
									</div>
								</dl>
							</div>

							<div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
								Last updated: {new Date(health.timestamp).toLocaleString()}
							</div>
						</div>
					)}
				</div>

				<div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
					<p>
						Frontend built with React + Vite + TanStack Query + Tailwind CSS
					</p>
				</div>
			</div>
		</div>
	)
}

export default App
