
import type { IronSessionOptions } from 'iron-session';
import type { User } from '@/lib/types';

export interface SessionData {
  user: User;
  isLoggedIn: boolean;
}

export const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'kreatask-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};
