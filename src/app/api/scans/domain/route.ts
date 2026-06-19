import { NextResponse, type NextRequest } from 'next/server';
import { db, getAuthUser, logActivity } from '@/lib/api-helpers';
import dns from 'dns/promises';
import net from 'net';
import https from 'https';
import { URL } from 'url';

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { domain } = await req.json();
    if (!domain) return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    const clean = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    if (!/^[\w.-]+$/.test(clean)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }
    const scan = await db.domainScan.create({
      data: { domain: clean, submittedBy: user.username, status: 'processing' },
    });
    analyzeDomain(scan.id, clean).catch(console.error);
    return NextResponse.json({ id: scan.id, status: 'processing', domain: clean });
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
    const scan = await db.domainScan.findUnique({ where: { id } });
    if (!scan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(scan);
  }
  const scans = await db.domainScan.findMany({ orderBy: { scannedAt: 'desc' }, take: 50 });
  return NextResponse.json(scans);
}

async function analyzeDomain(scanId: string, domain: string) {
  const openPorts: { port: number; service: string; risk: string }[] = [];
  const subdomains: string[] = [];
  const securityHeaders: { header: string; status: string; value: string }[] = [];
  const ipAddresses: string[] = [];
  const nameServers: string[] = [];
  let registered = '', expires = '', registrar = '', dnsSec = false;
  let reputation = 50;

  try {
    // 1. Resolver A records
    try {
      const addrs = await dns.resolve4(domain);
      ipAddresses.push(...addrs);
    } catch {}

    // 2. Resolver NS records
    try {
      const ns = await dns.resolveNs(domain);
      nameServers.push(...ns);
    } catch {}

    // 3. Resolver MX records (info extra)
    try {
      await dns.resolveMx(domain);
    } catch {}

    // 4. Resolver TXT (SPF, DKIM, etc.)
    try {
      await dns.resolveTxt(domain);
    } catch {}

    // 5. Verificar DNSSEC
    try {
      const resolver = new dns.Resolver();
      resolver.setServers(['1.1.1.1']);
      // Si el dominio tiene DNSSEC configurado, las queries con DO flag pueden validar
      // Asumimos false por defecto — requiere librería más avanzada para verificar correctamente
      dnsSec = false;
    } catch {}

    // 6. Subdomain enumeration (lista común)
    const commonSubs = ['www', 'api', 'app', 'mail', 'smtp', 'pop', 'imap', 'ftp', 'admin', 'portal', 'soporte', 'blog', 'shop', 'store', 'login', 'signin', 'secure', 'm', 'dev', 'staging', 'test', 'beta', 'cdn', 'static', 'assets', 'img', 'images', 'docs', 'help', 'support', 'account', 'dashboard', 'panel', 'crm', 'erp', 'intranet'];
    const found: string[] = [];
    await Promise.all(commonSubs.map(async (s) => {
      try {
        const addrs = await dns.resolve4(`${s}.${domain}`);
        if (addrs.length > 0) found.push(`${s}.${domain}`);
      } catch {}
    }));
    subdomains.push(...found);

    // 7. Port scan (puertos comunes)
    const portsToCheck = [
      { port: 21, service: 'FTP',  risk: 'high' },
      { port: 22, service: 'SSH',  risk: 'medium' },
      { port: 25, service: 'SMTP', risk: 'low' },
      { port: 53, service: 'DNS',  risk: 'low' },
      { port: 80, service: 'HTTP', risk: 'low' },
      { port: 110, service: 'POP3', risk: 'medium' },
      { port: 143, service: 'IMAP', risk: 'medium' },
      { port: 443, service: 'HTTPS', risk: 'low' },
      { port: 465, service: 'SMTPS', risk: 'low' },
      { port: 587, service: 'SMTP-Submission', risk: 'low' },
      { port: 993, service: 'IMAPS', risk: 'low' },
      { port: 995, service: 'POP3S', risk: 'low' },
      { port: 3306, service: 'MySQL', risk: 'high' },
      { port: 3389, service: 'RDP', risk: 'high' },
      { port: 5432, service: 'PostgreSQL', risk: 'high' },
      { port: 6379, service: 'Redis', risk: 'high' },
      { port: 8080, service: 'HTTP-Alt', risk: 'medium' },
      { port: 8443, service: 'HTTPS-Alt', risk: 'medium' },
      { port: 9200, service: 'Elasticsearch', risk: 'high' },
      { port: 27017, service: 'MongoDB', risk: 'high' },
    ];
    await Promise.all(portsToCheck.map(async ({ port, service, risk }) => {
      const open = await checkPort(domain, port, 2000);
      if (open) openPorts.push({ port, service, risk });
    }));

    // 8. Security headers via HTTPS HEAD request
    try {
      const headers = await getHeaders(`https://${domain}`);
      const headerMap: Record<string, string> = {};
      headers.forEach(h => headerMap[h.name.toLowerCase()] = h.value);

      const checks = [
        { header: 'strict-transport-security', expected: 'max-age=' },
        { header: 'content-security-policy', expected: 'default-src' },
        { header: 'x-frame-options', expected: 'deny' },
        { header: 'x-content-type-options', expected: 'nosniff' },
        { header: 'referrer-policy', expected: 'no-referrer' },
        { header: 'permissions-policy', expected: 'geolocation' },
      ];
      for (const c of checks) {
        const val = headerMap[c.header];
        if (val) {
          securityHeaders.push({ header: c.header, status: 'pass', value: val.slice(0, 80) });
        } else {
          securityHeaders.push({ header: c.header, status: 'fail', value: 'missing' });
          reputation -= 5;
        }
      }
    } catch (e: any) {
      securityHeaders.push({ header: 'All', status: 'fail', value: `Could not fetch headers: ${e.message}` });
      reputation -= 15;
    }

    // 9. Reputation scoring
    if (openPorts.some(p => ['21', '3306', '3389', '5432', '6379', '9200', '27017'].includes(String(p.port)))) {
      reputation -= 15;
    }
    if (subdomains.length > 8) reputation += 5;
    if (ipAddresses.length > 0) reputation += 10;
    reputation = Math.max(0, Math.min(100, reputation));

    // 10. RDAP / WHOIS lookup (sin API key, usando rdap.org)
    try {
      const rdapRes = await fetch(`https://rdap.org/domain/${domain}`, {
        signal: AbortSignal.timeout(5000),
        headers: { accept: 'application/rdap+json' },
      });
      if (rdapRes.ok) {
        const rdap: any = await rdapRes.json();
        if (rdap.events) {
          for (const ev of rdap.events) {
            if (ev.eventAction === 'registration') registered = ev.eventDate;
            if (ev.eventAction === 'expiration') expires = ev.eventDate;
          }
        }
        if (rdap.entities) {
          for (const e of rdap.entities) {
            if (e.roles?.includes('registrar')) {
              registrar = e.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3] || '';
            }
          }
        }
        if (rdap.secureDNS) dnsSec = rdap.secureDNS.delegationSigned || false;
      }
    } catch {}

    await db.domainScan.update({
      where: { id: scanId },
      data: {
        status: 'completed',
        registered,
        expires,
        registrar,
        dnsSec,
        reputation,
        openPorts: JSON.stringify(openPorts),
        subdomains: JSON.stringify(subdomains),
        securityHeaders: JSON.stringify(securityHeaders),
        ipAddresses: JSON.stringify(ipAddresses),
        nameServers: JSON.stringify(nameServers),
      },
    });

    await logActivity('scan', `Domain scan completed: ${domain} (reputation: ${reputation})`,
      reputation < 30 ? 'critical' : reputation < 60 ? 'medium' : 'low', 'System');
  } catch (e: any) {
    await db.domainScan.update({
      where: { id: scanId },
      data: { status: 'failed', error: e.message },
    });
  }
}

function checkPort(host: string, port: number, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => { resolve(false); });
    socket.connect(port, host);
  });
}

function getHeaders(url: string): Promise<{ name: string; value: string }[]> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'HEAD', timeout: 8000 }, (res) => {
      const headers: { name: string; value: string }[] = [];
      for (const [name, value] of Object.entries(res.headers)) {
        if (typeof value === 'string') headers.push({ name, value });
      }
      resolve(headers);
      req.destroy();
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}
