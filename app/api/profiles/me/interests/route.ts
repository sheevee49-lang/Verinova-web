import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import { errorResponse } from '@/lib/api-utils';

export async function PUT(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return errorResponse('Not authenticated. Please log in.', 401);

  const body = await req.json().catch(() => ({}));
  const { interest_ids } = body;
  if (!Array.isArray(interest_ids)) {
    return errorResponse('interest_ids must be an array.');
  }

  await prisma.$transaction([
    prisma.userInterest.deleteMany({ where: { userId } }),
    prisma.userInterest.createMany({
      data: interest_ids.map((interestId: number) => ({ userId, interestId })),
    
    }),
  ]);

  const interests = await prisma.userInterest.findMany({
    where: { userId },
    include: { interest: true },
  });

  return NextResponse.json({
    interests: interests.map((ui) => ({ id: ui.interest.id, name: ui.interest.name })),
  });
}
