
import '@/env'; // Import environment variables
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (session.isLoggedIn !== true || !session.user) {
    return NextResponse.json({ isLoggedIn: false, user: null });
  }

  return NextResponse.json({
    isLoggedIn: true,
    user: session.user,
  });
}
