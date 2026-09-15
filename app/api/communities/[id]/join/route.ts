import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import { errorResponse } from '@/lib/api-utils';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return errorResponse('Not authenticated. Please log in.', 401);

  const { id } = await params;
  const communityId = Number(id);

  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) return errorResponse('Community not found.', 404);

  const already = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId, userId } },
  });
  if (already) return errorResponse('You already belong to this community.', 409);

  await prisma.communityMember.create({ data: { communityId, userId } });

  if (community.creatorId && community.creatorId !== userId) {
    const joiner = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.notification.create({
      data: {
        userId: community.creatorId,
        type: 'new_member',
        message: `${joiner?.fullName ?? 'Someone'} joined your community "${community.name}".`,
      },
    });
  }

  return NextResponse.json({ joined: true });
}
