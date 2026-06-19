import { NextResponse, type NextRequest } from 'next/server';
import { db, getAuthUser } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const u = getAuthUser(req);
  if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await db.executive.findMany({ orderBy: { riskScore: 'desc' } }));
}
