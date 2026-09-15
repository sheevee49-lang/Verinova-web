import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, signSession, SESSION_COOKIE } from '@/lib/auth';
import { errorResponse } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body;

  if (!email || !password) {
    return errorResponse('Email and password are required.');
  }

  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return errorResponse('Incorrect email or password.', 401);
  }

  const token = await signSession(user.id);
  const res = NextResponse.json({
    user: {
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      user_type: user.userType,
      location: user.location,
      bio: user.bio,
      profession: user.profession,
      skills: user.skills,
    },
  });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
