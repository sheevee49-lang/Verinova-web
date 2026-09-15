import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const userType = searchParams.get('user_type');
  const location = searchParams.get('location');
  const interestId = searchParams.get('interest_id');

  const where: any = { AND: [] as any[] };
  if (q) {
    where.AND.push({
      OR: [
        { fullName: { contains: q } },
        { profession: { contains: q } },
        { skills: { contains: q } },
        { bio: { contains: q } },
      ],
    });
  }
  if (userType) where.AND.push({ userType });
  if (location) where.AND.push({ location: { contains: location } });
  if (interestId) where.AND.push({ interests: { some: { interestId: Number(interestId) } } });
  if (userId) where.AND.push({ id: { not: userId } });

  const members = await prisma.user.findMany({
    where: where.AND.length ? where : undefined,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({
    members: members.map((m) => ({
      id: m.id,
      full_name: m.fullName,
      user_type: m.userType,
      location: m.location,
      profession: m.profession,
      skills: m.skills,
      bio: m.bio,
    })),
  });
}
