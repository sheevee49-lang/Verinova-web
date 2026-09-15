import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import { errorResponse } from '@/lib/api-utils';

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return errorResponse('Not authenticated. Please log in.', 401);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { interests: { include: { interest: true } } },
  });
  if (!user) return errorResponse('User not found.', 404);

  return NextResponse.json({
    user: {
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      user_type: user.userType,
      location: user.location,
      bio: user.bio,
      profession: user.profession,
      skills: user.skills,
      interests: user.interests.map((ui) => ({ id: ui.interest.id, name: ui.interest.name })),
    },
  });
}
