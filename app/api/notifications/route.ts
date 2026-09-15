import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import { errorResponse } from '@/lib/api-utils';

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return errorResponse('Not authenticated. Please log in.', 401);

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({ where: { userId, isRead: false } });

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      message: n.message,
      is_read: n.isRead,
      created_at: n.createdAt,
    })),
    unread_count: unreadCount,
  });
}
