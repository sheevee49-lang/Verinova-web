import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const members = await prisma.communityMember.findMany({
    where: { communityId: Number(id) },
    include: { user: true },
  });

  return NextResponse.json({
    members: members.map((m) => ({
      id: m.user.id,
      full_name: m.user.fullName,
      user_type: m.user.userType,
      location: m.user.location,
      profession: m.user.profession,
    })),
  });
}
