import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { errorResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    include: {
      interests: { include: { interest: true } },
      communityMemberships: { include: { community: true } },
    },
  });
  if (!user) return errorResponse('Profile not found.', 404);

  return NextResponse.json({
    user: {
      id: user.id,
      full_name: user.fullName,
      user_type: user.userType,
      location: user.location,
      bio: user.bio,
      profession: user.profession,
      skills: user.skills,
      interests: user.interests.map((ui) => ({ id: ui.interest.id, name: ui.interest.name })),
      communities: user.communityMemberships.map((cm) => ({ id: cm.community.id, name: cm.community.name, category: cm.community.category })),
    },
  });
}

