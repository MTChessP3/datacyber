import { NextResponse, type NextRequest } from 'next/server';
import { db, getAuthUser } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const u = getAuthUser(req);
  if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const logs = await db.activityLog.findMany({ orderBy: { timestamp: 'desc' }, take: 50 });
  return NextResponse.json(logs);
}
