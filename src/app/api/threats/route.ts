import { NextResponse, type NextRequest } from 'next/server';
import { db, getAuthUser } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const threats = await db.threat.findMany({ orderBy: { detectedAt: 'desc' }, take: 200 });
  return NextResponse.json(threats);
}
