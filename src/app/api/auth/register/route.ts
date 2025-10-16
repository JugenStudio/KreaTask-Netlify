
import '@/env'; // Import environment variables
import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/db/client';
import * as schema from '@/db/schema';

export const dynamic = 'force-dynamic';

const SALT_ROUNDS = 10;
const db = getDb();

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }
    
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = uuidv4();

    await db.insert(schema.users).values({
      id: userId,
      name,
      email: email.toLowerCase(),
      hashedPassword,
      avatarUrl: `https://picsum.photos/seed/${userId}/100/100`,
      role: UserRole.UNASSIGNED,
      jabatan: 'Unassigned',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.message?.includes('unique constraint')) {
       return NextResponse.json({ message: 'Email already in use' }, { status: 409 });
    }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
