import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().min(1).default('127.0.0.1'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_PATH: z.string().min(1).default('./data/van-guard.sqlite'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),

  DATA_MODE: z.enum(['demo', 'provider']).default('demo'),

  EARTH_ENGINE_PROJECT: z.string().optional(),
  EARTH_ENGINE_CLIENT_EMAIL: z.string().email().optional(),
  EARTH_ENGINE_PRIVATE_KEY: z.string().optional(),

  REQUEST_TIMEOUT_MS: z.coerce.number()
    .int()
    .min(100)
    .max(120000)
    .default(10000)
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(
  overrides: NodeJS.ProcessEnv = process.env
): Env {
  const parsed = EnvSchema.safeParse(overrides);

  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.message}`
    );
  }

  return parsed.data;
}

export const env = loadEnv();
