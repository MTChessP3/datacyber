import { NextResponse, type NextRequest } from 'next/server';
import { db, getAuthUser, logActivity } from '@/lib/api-helpers';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const u = getAuthUser(req);
  if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await db.apiKey.delete({ where: { id } });
  await logActivity('apikey', `API key eliminada`, 'info', u.username);
  return NextResponse.json({ ok: true });
}
