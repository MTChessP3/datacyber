import { NextResponse, type NextRequest } from 'next/server';
import { db, getAuthUser, logActivity } from '@/lib/api-helpers';
import https from 'https';
import tls from 'tls';
import { URL } from 'url';

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    if (!parsed.protocol.startsWith('http')) {
      return NextResponse.json({ error: 'Only http/https URLs are supported' }, { status: 400 });
    }

    // Crear registro inicial
    const scan = await db.urlScan.create({
      data: { url, submittedBy: user.username, status: 'processing' },
    });

    // Ejecutar análisis asíncrono
    analyzeUrl(scan.id, url).catch(console.error);

    return NextResponse.json({ id: scan.id, status: 'processing', url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    const scan = await db.urlScan.findUnique({ where: { id } });
    if (!scan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(scan);
  }
  const scans = await db.urlScan.findMany({ orderBy: { submittedAt: 'desc' }, take: 50 });
  return NextResponse.json(scans);
}

async function analyzeUrl(scanId: string, urlStr: string) {
  const detections: { engine: string; verdict: string }[] = [];
  let threatScore = 0;
  let finalUrl = urlStr;
  let redirects = 0;
  let ipAddress = '';
  let sslValid = false;
  let sslIssuer = '';
  let sslValidFrom = '';
  let sslValidTo = '';

  try {
    // 1. Resolver DNS vía Cloudflare DoH
    const parsed = new URL(urlStr);
    const dohUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(parsed.hostname)}&type=A`;
    const dohRes = await fetch(dohUrl, { headers: { accept: 'application/dns-json' } });
    const dohData: any = await dohRes.json();
    if (dohData.Answer) {
      const aRecords = dohData.Answer.filter((a: any) => a.type === 1);
      if (aRecords.length > 0) {
        ipAddress = aRecords[0].data;
      }
    }

    // 2. Trace redirects con fetch nativo
    const redirectChain: string[] = [];
    let currentUrl = urlStr;
    for (let i = 0; i < 10; i++) {
      redirectChain.push(currentUrl);
      try {
        const res = await fetch(currentUrl, {
          redirect: 'manual',
          signal: AbortSignal.timeout(8000),
          headers: { 'user-agent': 'DataCyber/1.0' },
        });
        if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
          const loc = res.headers.get('location')!;
          currentUrl = new URL(loc, currentUrl).href;
          redirects++;
        } else {
          finalUrl = currentUrl;
          break;
        }
      } catch (e: any) {
        // Timeout o connection refused → sospechoso
        detections.push({ engine: 'DataCyber Internal', verdict: `Connection failed: ${e.message}` });
        threatScore += 20;
        break;
      }
    }
    finalUrl = currentUrl;

    // 3. SSL info real con tls.connect
    if (parsed.protocol === 'https:') {
      try {
        await new Promise<void>((resolve, reject) => {
          const socket = tls.connect({
            host: parsed.hostname,
            port: 443,
            servername: parsed.hostname,
            rejectUnauthorized: false,
          }, () => {
            const cert = socket.getPeerCertificate();
            if (cert && cert.raw) {
              sslValid = socket.authorized;
              sslIssuer = cert.issuer?.O || cert.issuer?.CN || 'unknown';
              sslValidFrom = cert.valid_from || '';
              sslValidTo = cert.valid_to || '';
              if (!socket.authorized) {
                threatScore += 25;
                detections.push({ engine: 'SSL Validator', verdict: 'Invalid or self-signed certificate' });
              }
            }
            socket.end();
            resolve();
          });
          socket.on('error', (e) => {
            detections.push({ engine: 'SSL Validator', verdict: `SSL connection failed: ${e.message}` });
            threatScore += 30;
            resolve();
          });
          setTimeout(() => { socket.destroy(); resolve(); }, 5000);
        });
      } catch (e: any) {
        sslValid = false;
        detections.push({ engine: 'SSL Validator', verdict: `SSL error: ${e.message}` });
        threatScore += 25;
      }
    } else {
      detections.push({ engine: 'SSL Validator', verdict: 'No HTTPS — credentials can be intercepted' });
      threatScore += 15;
    }

    // 4. Google Safe Browsing Lookup API (v4) — requiere API key, sin key marcamos como N/A
    // Si el usuario configura SAFE_BROWSING_API_KEY en settings, lo usamos
    const sbKey = process.env.SAFE_BROWSING_API_KEY;
    if (sbKey) {
      try {
        const sbRes = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${sbKey}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            client: { clientId: 'datacyber', clientVersion: '1.0' },
            threatInfo: {
              threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: [{ url: urlStr }],
            },
          }),
        });
        const sbData: any = await sbRes.json();
        if (sbData.matches && sbData.matches.length > 0) {
          threatScore += 60;
          for (const m of sbData.matches) {
            detections.push({ engine: 'Google Safe Browsing', verdict: m.threatType });
          }
        } else {
          detections.push({ engine: 'Google Safe Browsing', verdict: 'Clean' });
        }
      } catch (e: any) {
        detections.push({ engine: 'Google Safe Browsing', verdict: `Lookup error: ${e.message}` });
      }
    } else {
      detections.push({ engine: 'Google Safe Browsing', verdict: 'API key not configured — enable in Settings' });
    }

    // 5. Heurísticas adicionales
    const hostname = parsed.hostname.toLowerCase();
    const suspiciousTld = ['.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.xyz', '.click', '.work'];
    if (suspiciousTld.some(tld => hostname.endsWith(tld))) {
      threatScore += 20;
      detections.push({ engine: 'Heuristics', verdict: `Suspicious TLD: ${hostname.split('.').pop()}` });
    }
    if (/\d+\.\d+\.\d+\.\d+/.test(hostname)) {
      threatScore += 15;
      detections.push({ engine: 'Heuristics', verdict: 'URL uses raw IP instead of hostname' });
    }
    if (hostname.includes('-') && hostname.split('-').length > 3) {
      threatScore += 10;
      detections.push({ engine: 'Heuristics', verdict: 'Excessive hyphens in hostname — common in phishing' });
    }
    if (parsed.username || parsed.password) {
      threatScore += 25;
      detections.push({ engine: 'Heuristics', verdict: 'URL contains embedded credentials' });
    }
    if (urlStr.length > 100) {
      threatScore += 5;
      detections.push({ engine: 'Heuristics', verdict: 'Excessively long URL' });
    }

    threatScore = Math.min(100, threatScore);

    await db.urlScan.update({
      where: { id: scanId },
      data: {
        status: 'completed',
        threatScore,
        finalUrl,
        ipAddress,
        redirects,
        sslValid,
        sslIssuer,
        sslValidFrom,
        sslValidTo,
        detections: JSON.stringify(detections),
      },
    });

    await logActivity('scan', `URL scan completed: ${urlStr} (score: ${threatScore})`,
      threatScore >= 70 ? 'critical' : threatScore >= 40 ? 'high' : 'medium',
      'System');
  } catch (e: any) {
    await db.urlScan.update({
      where: { id: scanId },
      data: { status: 'failed', error: e.message, detections: JSON.stringify(detections) },
    });
  }
}
