import { NextResponse, type NextRequest } from 'next/server';
import { db, getAuthUser } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const u = getAuthUser(req);
  if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [brands, threats, scans, reports, channels, activity] = await Promise.all([
    db.brand.count(),
    db.threat.count(),
    db.urlScan.count(),
    db.report.count(),
    db.socialChannel.count(),
    db.activityLog.findMany({ orderBy: { timestamp: 'desc' }, take: 8 }),
  ]);

  const criticalThreats = await db.threat.count({ where: { severity: 'critical' } });
  const flaggedBrands = await db.brand.count({ where: { status: 'flagged' } });

  return NextResponse.json({
    kpis: {
      totalThreats: threats,
      criticalAlerts: criticalThreats,
      brandsMonitored: brands,
      flaggedBrands,
      totalScans: scans,
      reportsGenerated: reports,
      channelsMonitored: channels,
    },
    activity,
    recentThreats: await db.threat.findMany({ orderBy: { detectedAt: 'desc' }, take: 5 }),
  });
}
