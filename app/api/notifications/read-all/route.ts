import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import { errorResponse } from '@/lib/api-utils';

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return errorResponse('Not authenticated. Please log in.', 401);

  await prisma.notification.updateMany({ where: { userId }, data: { isRead: true } });
  return NextResponse.json({ ok: true });
}
