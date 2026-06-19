import { NextResponse, type NextRequest } from 'next/server';
import { db, getAuthUser, logActivity } from '@/lib/api-helpers';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const brand = await db.brand.findUnique({ where: { id } });
  if (!brand) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await db.brand.delete({ where: { id } });
  await logActivity('monitor', `Marca eliminada: ${brand.name}`, 'info', user.username);
  return NextResponse.json({ ok: true });
}
