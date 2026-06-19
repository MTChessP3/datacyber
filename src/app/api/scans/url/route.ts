import { NextResponse, type NextRequest } from 'next/server';
import tls from 'tls';
import { URL as NodeURL } from 'url';

// Análisis REAL de URL — serverless, no escribe en DB
// El frontend persiste el resultado en localStorage

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    let parsed: NodeURL.URL;
    try {
      parsed = new NodeURL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    if (!parsed.protocol.startsWith('http')) {
      return NextResponse.json({ error: 'Only http/https URLs are supported' }, { status: 400 });
    }

    const result = await analyzeUrl(url);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

interface AnalysisResult {
  url: string;
  status: 'completed' | 'failed';
  threatScore: number;
  finalUrl: string;
  ipAddress: string;
  redirects: number;
  sslValid: boolean | null;
  sslIssuer: string;
  sslValidFrom: string;
  sslValidTo: string;
  detections: { engine: string; verdict: string }[];
  error?: string;
}

async function analyzeUrl(urlStr: string): Promise<AnalysisResult> {
  const detections: { engine: string; verdict: string }[] = [];
  let threatScore = 0;
  let finalUrl = urlStr;
  let redirects = 0;
  let ipAddress = '';
  let sslValid: boolean | null = null;
  let sslIssuer = '';
  let sslValidFrom = '';
  let sslValidTo = '';

  const parsed = new NodeURL(urlStr);

  try {
    // 1. Resolver DNS vía Cloudflare DoH
    const dohUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(parsed.hostname)}&type=A`;
    const dohRes = await fetch(dohUrl, { headers: { accept: 'application/dns-json' } });
    const dohData: any = await dohRes.json();
    if (dohData.Answer) {
      const aRecords = dohData.Answer.filter((a: any) => a.type === 1);
      if (aRecords.length > 0) ipAddress = aRecords[0].data;
    }

    // 2. Trace redirects
    let currentUrl = urlStr;
    for (let i = 0; i < 10; i++) {
      try {
        const res = await fetch(currentUrl, {
          redirect: 'manual',
          signal: AbortSignal.timeout(8000),
          headers: { 'user-agent': 'DataCyber/1.0' },
        });
        if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
          const loc = res.headers.get('location')!;
          currentUrl = new NodeURL(loc, currentUrl).href;
          redirects++;
        } else {
          finalUrl = currentUrl;
          break;
        }
      } catch (e: any) {
        detections.push({ engine: 'DataCyber Internal', verdict: `Connection failed: ${e.message}` });
        threatScore += 20;
        break;
      }
    }
    finalUrl = currentUrl;

    // 3. SSL info real con tls.connect
    if (parsed.protocol === 'https:') {
      try {
        await new Promise<void>((resolve) => {
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
          socket.on('error', () => {
            detections.push({ engine: 'SSL Validator', verdict: 'SSL connection failed' });
            threatScore += 30;
            resolve();
          });
          setTimeout(() => { socket.destroy(); resolve(); }, 5000);
        });
      } catch {
        sslValid = false;
        detections.push({ engine: 'SSL Validator', verdict: 'SSL error' });
        threatScore += 25;
      }
    } else {
      detections.push({ engine: 'SSL Validator', verdict: 'No HTTPS — credentials can be intercepted' });
      threatScore += 15;
    }

    // 4. Heurísticas
    const hostname = parsed.hostname.toLowerCase();
    const suspiciousTld = ['.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.xyz', '.click', '.work'];
    if (suspiciousTld.some(tld => hostname.endsWith(tld))) {
      threatScore += 20;
      detections.push({ engine: 'Heuristics', verdict: `Suspicious TLD: .${hostname.split('.').pop()}` });
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

    return {
      url: urlStr,
      status: 'completed',
      threatScore,
      finalUrl,
      ipAddress,
      redirects,
      sslValid,
      sslIssuer,
      sslValidFrom,
      sslValidTo,
      detections,
    };
  } catch (e: any) {
    return {
      url: urlStr,
      status: 'failed',
      threatScore: 0,
      finalUrl: '',
      ipAddress: '',
      redirects: 0,
      sslValid: null,
      sslIssuer: '',
      sslValidFrom: '',
      sslValidTo: '',
      detections,
      error: e.message,
    };
  }
}
