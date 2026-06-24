const REQUIRED_VARS = ['DATABASE_URL', 'JWT_SECRET'];

const REQUIRED_PRODUCTION_VARS = ['KAFKA_BROKERS', 'REDIS_HOST', 'REDIS_PASSWORD'];

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const missing = REQUIRED_VARS.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }

  if (config.NODE_ENV === 'production') {
    const missingProd = REQUIRED_PRODUCTION_VARS.filter((key) => !config[key]);
    if (missingProd.length > 0) {
      throw new Error(
        `Missing required production environment variable(s): ${missingProd.join(', ')}`,
      );
    }
  }

  return config;
}
