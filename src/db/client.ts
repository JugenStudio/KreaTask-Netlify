
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@/db/schema';
import '@/env';

// Create a single connection instance
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

/**
 * Returns a reusable database instance.
 * @returns The Drizzle ORM instance.
 */
export const getDb = () => db;
