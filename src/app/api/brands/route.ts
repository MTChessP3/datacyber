import { NextResponse, type NextRequest } from 'next/server';
import { db, getAuthUser, logActivity } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const brands = await db.brand.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(brands);
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { name, country, type, domain } = body;
    if (!name || !country || !type || !domain) {
      return NextResponse.json({ error: 'name, country, type, domain are required' }, { status: 400 });
    }
    const brand = await db.brand.create({
      data: { name, country, type, domain, status: 'active', findings: 0 },
    });
    await logActivity('monitor', `Marca agregada: ${name} (${country}, ${domain})`, 'info', user.username);
    return NextResponse.json(brand, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
