
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  session.destroy();
  return NextResponse.json({ message: 'Logged out' });
}
