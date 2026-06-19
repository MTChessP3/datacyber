import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'DataCyber API',
    endpoints: {
      scanUrl: 'POST /api/scans/url',
      scanDomain: 'POST /api/scans/domain',
    },
  });
}
