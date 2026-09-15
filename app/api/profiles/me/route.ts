import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import { errorResponse } from '@/lib/api-utils';

export async function PUT(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return errorResponse('Not authenticated. Please log in.', 401);

  const body = await req.json().catch(() => ({}));
  const { full_name, bio, location, profession, skills, user_type } = body;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(full_name !== undefined && { fullName: full_name }),
      ...(bio !== undefined && { bio }),
      ...(location !== undefined && { location }),
      ...(profession !== undefined && { profession }),
      ...(skills !== undefined && { skills }),
      ...(user_type !== undefined && { userType: user_type }),
    },
  });

  return NextResponse.json({
    user: {
      id: updated.id,
      full_name: updated.fullName,
      email: updated.email,
      user_type: updated.userType,
      location: updated.location,
      bio: updated.bio,
      profession: updated.profession,
      skills: updated.skills,
    },
  });
}
