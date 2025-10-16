
import { config } from 'dotenv';
import { z } from 'zod';

config({ path: '.env' });

const envSchema = z.object({
  DATABASE_URL: z.string(),
  SECRET_COOKIE_PASSWORD: z.string().min(32, 'Secret cookie password must be at least 32 characters long'),
});

export const env = envSchema.parse(process.env);
