import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, signSession, SESSION_COOKIE } from '@/lib/auth';
import { errorResponse } from '@/lib/api-utils';

const USER_TYPES = ['Individual', 'Farmer', 'Skilled Professional', 'Business', 'NGO', 'Government Agency', 'Investor', 'Youth'];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { full_name, email, password, user_type, location } = body;

  if (!full_name || !email || !password) {
    return errorResponse('Full name, email, and password are required.');
  }
  if (password.length < 6) {
    return errorResponse('Password must be at least 6 characters.');
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return errorResponse('An account with this email already exists.', 409);
  }

  const passwordHash = await hashPassword(password);
  const userType = USER_TYPES.includes(user_type) ? user_type : 'Individual';

  const user = await prisma.user.create({
    data: {
      fullName: String(full_name).trim(),
      email: normalizedEmail,
      passwordHash,
      userType,
      location: location || '',
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'welcome',
      message: `Welcome to VeriNova Connect, ${user.fullName.split(' ')[0]}! Complete your profile to start connecting.`,
    },
  });

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
  }, { status: 201 });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
