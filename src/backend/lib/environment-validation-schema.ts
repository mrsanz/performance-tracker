// Shared environment validation schema for server and scripts
export const environmentValidationSchema = {
	type: 'object',
	required: ['DATABASE_PATH', 'PORT', 'HOST', 'NODE_ENV'],
	properties: {
		DATABASE_PATH: { type: 'string' },
		PORT: { type: 'number', default: 3000 },
		HOST: { type: 'string', default: '0.0.0.0' },
		NODE_ENV: {
			type: 'string',
			enum: ['development', 'test', 'production'],
			default: 'development',
		},
		CORS_ORIGIN: { type: 'string' },
	},
} as const
