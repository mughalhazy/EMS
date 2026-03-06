import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

export type RuntimeEnvironment = 'development' | 'staging' | 'production';

export type EnvironmentConfig = {
  environment: RuntimeEnvironment;
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
  get(key: string): string | undefined;
  getOrDefault(key: string, fallback: string): string;
  getBoolean(key: string, fallback?: boolean): boolean;
};

const VALID_ENVIRONMENTS: ReadonlySet<string> = new Set(['development', 'staging', 'production']);

const parseDotEnv = (rawFileContents: string): Record<string, string> => {
  const values: Record<string, string> = {};

  for (const line of rawFileContents.split(/\r?\n/)) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const delimiterPosition = trimmedLine.indexOf('=');
    if (delimiterPosition <= 0) {
      continue;
    }

    const key = trimmedLine.slice(0, delimiterPosition).trim();
    const rawValue = trimmedLine.slice(delimiterPosition + 1).trim();
    const unwrappedValue =
      (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'"))
        ? rawValue.slice(1, -1)
        : rawValue;

    values[key] = unwrappedValue;
  }

  return values;
};

const normalizeEnvironment = (input: string | undefined): RuntimeEnvironment => {
  if (input && VALID_ENVIRONMENTS.has(input)) {
    return input as RuntimeEnvironment;
  }

  return 'development';
};

const loadDotEnvForEnvironment = (environment: RuntimeEnvironment): void => {
  const rootDirectory = resolve(__dirname, '../../..');
  const genericDotEnvPath = resolve(rootDirectory, '.env');
  const environmentDotEnvPath = resolve(rootDirectory, `.env.${environment}`);

  for (const dotEnvPath of [genericDotEnvPath, environmentDotEnvPath]) {
    if (!existsSync(dotEnvPath)) {
      continue;
    }

    const fileValues = parseDotEnv(readFileSync(dotEnvPath, 'utf-8'));
    for (const [key, value] of Object.entries(fileValues)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
};

const createEnvironmentConfig = (): EnvironmentConfig => {
  const environment = normalizeEnvironment(process.env.APP_ENV ?? process.env.NODE_ENV);

  loadDotEnvForEnvironment(environment);
  process.env.APP_ENV = environment;
  process.env.NODE_ENV = environment;

  const get = (key: string): string | undefined => process.env[key];

  return {
    environment,
    isDevelopment: environment === 'development',
    isStaging: environment === 'staging',
    isProduction: environment === 'production',
    get,
    getOrDefault: (key: string, fallback: string): string => get(key) ?? fallback,
    getBoolean: (key: string, fallback = false): boolean => {
      const value = get(key);
      if (value === undefined) {
        return fallback;
      }

      return value.toLowerCase() === 'true';
    },
  };
};

export const environmentConfig = createEnvironmentConfig();
