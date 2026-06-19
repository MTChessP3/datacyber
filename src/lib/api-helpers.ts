import { db } from '@/lib/db';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Helper: extrae el username del header Authorization (JWT simplificado)
export function getAuthUser(req: NextRequest): { username: string; role: string } | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  try {
    // El token es base64(username:role:timestamp)
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username, role] = decoded.split(':');
    if (!username || !role) return null;
    return { username, role };
  } catch {
    return null;
  }
}

export function makeToken(username: string, role: string): string {
  const raw = `${username}:${role}:${Date.now()}`;
  return Buffer.from(raw).toString('base64');
}

export async function logActivity(type: string, message: string, severity: string, actor: string) {
  try {
    await db.activityLog.create({ data: { type, message, severity, actor } });
  } catch {}
}

export { db, NextResponse };
export type { NextRequest };
