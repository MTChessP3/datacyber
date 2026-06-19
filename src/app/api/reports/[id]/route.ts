import { NextResponse, type NextRequest } from 'next/server';
import { db, getAuthUser } from '@/lib/api-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const u = getAuthUser(req);
  if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const report = await db.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const download = new URL(req.url).searchParams.get('download');
  if (download !== null && report.pdfBase64) {
    const buffer = Buffer.from(report.pdfBase64, 'base64');
    const safeName = report.title.replace(/[^a-z0-9-_]+/gi, '_').toLowerCase();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="${safeName}.pdf"`,
        'content-length': String(buffer.length),
      },
    });
  }
  return NextResponse.json(report);
}
