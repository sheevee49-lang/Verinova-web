import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import { errorResponse } from '@/lib/api-utils';

// No role restriction yet — any logged-in user can view this.
// To lock it down later: add an `isAdmin` (or `role`) column to User,
// check it here, and return errorResponse('Not authorized.', 403) if false.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return errorResponse('Not authenticated. Please log in.', 401);

  const [userCount, communityCount, notificationCount, users, communities, recentNotifications] = await Promise.all([
    prisma.user.count(),
    prisma.community.count(),
    prisma.notification.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.community.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { _count: { select: { members: true } }, creator: { select: { fullName: true } } },
    }),
    prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { user: { select: { fullName: true } } },
    }),
  ]);

  return NextResponse.json({
    stats: {
      total_users: userCount,
      total_communities: communityCount,
      total_notifications: notificationCount,
    },
    users: users.map((u) => ({
      id: u.id,
      full_name: u.fullName,
      email: u.email,
      user_type: u.userType,
      location: u.location,
      created_at: u.createdAt,
    })),
    communities: communities.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      county: c.county,
      member_count: c._count.members,
      creator_name: c.creator?.fullName ?? '—',
      created_at: c.createdAt,
    })),
    recent_notifications: recentNotifications.map((n) => ({
      id: n.id,
      recipient_name: n.user.fullName,
      type: n.type,
      message: n.message,
      is_read: n.isRead,
      created_at: n.createdAt,
    })),
  });
}