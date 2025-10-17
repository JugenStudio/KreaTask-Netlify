import { z } from 'zod';
// We don't import dotenv/config here anymore. It's imported at the entry points.

const envSchema = z.object({
  DATABASE_URL: z.string(),
  GEMINI_API_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().optional(),
});

// This will throw a build-time error if the environment variables are not set.
// The values are loaded by Vercel/Netlify/Docker/etc. in production.
// In local dev, they are loaded by the `dotenv/config` import in `dev` scripts or API routes.
export const env = envSchema.parse(process.env);
