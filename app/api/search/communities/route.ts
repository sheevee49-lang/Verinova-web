import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  const communities = await prisma.community.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { category: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { _count: { select: { members: true } } },
  });

  return NextResponse.json({
    communities: communities.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      category: c.category,
      county: c.county,
      member_count: c._count.members,
    })),
  });
}
