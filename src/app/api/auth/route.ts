import { NextResponse, type NextRequest } from 'next/server';
import { db, makeToken, getAuthUser, logActivity } from '@/lib/api-helpers';
import * as bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }
    const user = await db.user.findUnique({ where: { username: username.toLowerCase() } });
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const token = makeToken(user.username, user.role);
    await logActivity('login', `Login de ${user.username} (${user.role})`, 'low', user.email);
    return NextResponse.json({
      token,
      user: { username: user.username, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const u = getAuthUser(req);
  if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.user.findUnique({ where: { username: u.username } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({
    username: user.username, email: user.email, role: user.role, avatar: user.avatar,
  });
}
