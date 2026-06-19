import { NextResponse, type NextRequest } from 'next/server';
import { db, getAuthUser, logActivity } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const u = getAuthUser(req);
  if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await db.apiKey.findMany({ orderBy: { provider: 'asc' } }));
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id, provider, label, apiKey } = await req.json();
    if (!provider || !apiKey) return NextResponse.json({ error: 'provider and apiKey required' }, { status: 400 });
    const maskedKey = apiKey.slice(0, 4) + '••••••••••••••••' + apiKey.slice(-4);
    if (id) {
      const updated = await db.apiKey.update({
        where: { id },
        data: { provider, label: label || provider, maskedKey, status: 'active', lastUsed: new Date() },
      });
      await logActivity('apikey', `API key actualizada: ${provider}`, 'info', user.username);
      return NextResponse.json(updated);
    }
    const created = await db.apiKey.create({
      data: { provider, label: label || provider, maskedKey, status: 'active' },
    });
    await logActivity('apikey', `API key agregada: ${provider}`, 'info', user.username);
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
