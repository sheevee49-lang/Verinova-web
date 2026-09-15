import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import { errorResponse } from '@/lib/api-utils';

export async function GET() {
  const userId = await getCurrentUserId();

  const communities = await prisma.community.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { members: true } } },
  });

  let joinedIds = new Set<number>();
  if (userId) {
    const memberships = await prisma.communityMember.findMany({ where: { userId }, select: { communityId: true } });
    joinedIds = new Set(memberships.map((m) => m.communityId));
  }

  return NextResponse.json({
    communities: communities.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      category: c.category,
      county: c.county,
      creator_id: c.creatorId,
      member_count: c._count.members,
      is_member: joinedIds.has(c.id),
    })),
  });
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return errorResponse('Not authenticated. Please log in.', 401);

  const body = await req.json().catch(() => ({}));
  const { name, description, category, county } = body;
  if (!name || !String(name).trim()) {
    return errorResponse('Community name is required.');
  }

  const community = await prisma.community.create({
    data: {
      name: String(name).trim(),
      description: description || '',
      category: category || '',
      county: county || '',
      creatorId: userId,
      members: { create: { userId } },
    },
  });

  return NextResponse.json({ community }, { status: 201 });
}
