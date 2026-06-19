import { NextResponse, type NextRequest } from 'next/server';
import dns from 'dns/promises';
import net from 'net';
import https from 'https';

// Análisis REAL de dominio — serverless, no escribe en DB
// El frontend persiste el resultado en localStorage

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();
    if (!domain) return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    const clean = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    if (!/^[\w.-]+$/.test(clean)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }
    const result = await analyzeDomain(clean);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

interface DomainResult {
  domain: string;
  status: 'completed' | 'failed';
  registered: string;
  expires: string;
  registrar: string;
  dnsSec: boolean;
  reputation: number;
  openPorts: { port: number; service: string; risk: string }[];
  subdomains: string[];
  securityHeaders: { header: string; status: string; value: string }[];
  ipAddresses: string[];
  nameServers: string[];
  error?: string;
}

async function analyzeDomain(domain: string): Promise<DomainResult> {
  const openPorts: { port: number; service: string; risk: string }[] = [];
  const subdomains: string[] = [];
  const securityHeaders: { header: string; status: string; value: string }[] = [];
  const ipAddresses: string[] = [];
  const nameServers: string[] = [];
  let registered = '', expires = '', registrar = '', dnsSec = false;
  let reputation = 50;

  try {
    // 1. A records
    try {
      const addrs = await dns.resolve4(domain);
      ipAddresses.push(...addrs);
    } catch {}

    // 2. NS records
    try {
      const ns = await dns.resolveNs(domain);
      nameServers.push(...ns);
    } catch {}

    // 3. Subdomain enumeration (40 comunes)
    const commonSubs = ['www', 'api', 'app', 'mail', 'smtp', 'pop', 'imap', 'ftp', 'admin', 'portal', 'soporte', 'blog', 'shop', 'store', 'login', 'signin', 'secure', 'm', 'dev', 'staging', 'test', 'beta', 'cdn', 'static', 'assets', 'img', 'images', 'docs', 'help', 'support', 'account', 'dashboard', 'panel', 'crm', 'erp', 'intranet'];
    await Promise.all(commonSubs.map(async (s) => {
      try {
        await dns.resolve4(`${s}.${domain}`);
        subdomains.push(`${s}.${domain}`);
      } catch {}
    }));

    // 4. Port scan
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

    // 5. Security headers
    try {
      const headers = await getHeaders(`https://${domain}`);
      const headerMap: Record<string, string> = {};
      headers.forEach(h => headerMap[h.name.toLowerCase()] = h.value);

      const checks = [
        'strict-transport-security',
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy',
        'permissions-policy',
      ];
      for (const c of checks) {
        const val = headerMap[c];
        if (val) {
          securityHeaders.push({ header: c, status: 'pass', value: val.slice(0, 80) });
        } else {
          securityHeaders.push({ header: c, status: 'fail', value: 'missing' });
          reputation -= 5;
        }
      }
    } catch {
      securityHeaders.push({ header: 'All', status: 'fail', value: 'Could not fetch headers' });
      reputation -= 15;
    }

    // 6. Reputation scoring
    if (openPorts.some(p => [21, 3306, 3389, 5432, 6379, 9200, 27017].includes(p.port))) {
      reputation -= 15;
    }
    if (subdomains.length > 8) reputation += 5;
    if (ipAddresses.length > 0) reputation += 10;
    reputation = Math.max(0, Math.min(100, reputation));

    // 7. RDAP / WHOIS
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

    return {
      domain,
      status: 'completed',
      registered,
      expires,
      registrar,
      dnsSec,
      reputation,
      openPorts,
      subdomains,
      securityHeaders,
      ipAddresses,
      nameServers,
    };
  } catch (e: any) {
    return {
      domain,
      status: 'failed',
      registered: '', expires: '', registrar: '', dnsSec: false,
      reputation: 0,
      openPorts: [], subdomains: [], securityHeaders: [], ipAddresses: [], nameServers: [],
      error: e.message,
    };
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
