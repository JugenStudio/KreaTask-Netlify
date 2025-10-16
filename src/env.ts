
import { config } from 'dotenv';
import { z } from 'zod';

config({ path: '.env' });

const envSchema = z.object({
  DATABASE_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
