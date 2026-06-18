import type {
  Kpi, TrendPoint, ActivityItem, Threat, BrandTarget, FakeApp,
  ExecutiveProfile, ExposureFinding, SocialChannel, SocialMessage,
  ForensicsAnalysis, DomainRecord, DorkQuery, DorkResult,
  ReportTemplate, GeneratedReport, ApiKeyEntry,
} from './types';

// ============================================================
// DASHBOARD
// ============================================================
export const dashboardKpis: Kpi[] = [
  { label: 'Total Threats', value: 1284, delta: 12.4, hint: 'vs. semana anterior' },
  { label: 'Critical Alerts', value: 37, delta: -8.1, hint: 'vs. semana anterior' },
  { label: 'Domains Monitored', value: 246, delta: 4.2, hint: '+10 este mes' },
  { label: 'Apps Analyzed', value: 89, delta: 21.0, hint: '+19 este mes' },
  { label: 'Reports Generated', value: 53, delta: 6.0, hint: '+3 esta semana' },
  { label: 'Messages Collected', value: 18492, delta: 18.7, hint: '+2.9k esta semana' },
];

export const trendData: TrendPoint[] = [
  { date: '2026-05-19', threats: 84, scans: 142, mentions: 221 },
  { date: '2026-05-22', threats: 102, scans: 168, mentions: 245 },
  { date: '2026-05-25', threats: 91, scans: 156, mentions: 268 },
  { date: '2026-05-28', threats: 134, scans: 198, mentions: 312 },
  { date: '2026-05-31', threats: 118, scans: 175, mentions: 298 },
  { date: '2026-06-03', threats: 156, scans: 221, mentions: 354 },
  { date: '2026-06-06', threats: 142, scans: 209, mentions: 332 },
  { date: '2026-06-09', threats: 178, scans: 247, mentions: 401 },
  { date: '2026-06-12', threats: 165, scans: 234, mentions: 387 },
  { date: '2026-06-15', threats: 198, scans: 268, mentions: 432 },
  { date: '2026-06-18', threats: 187, scans: 251, mentions: 419 },
];

export const threatDistribution = [
  { name: 'Phishing', value: 412, color: '#ef4444' },
  { name: 'Brand Abuse', value: 287, color: '#f59e0b' },
  { name: 'Malware', value: 234, color: '#a855f7' },
  { name: 'Data Leak', value: 198, color: '#06b6d4' },
  { name: 'Domain', value: 153, color: '#10b981' },
];

export const recentActivity: ActivityItem[] = [
  { id: 'a1', type: 'alert', message: 'Phishing campaign detected targeting "ACME Bank" brand', severity: 'critical', timestamp: '2026-06-19T08:42:00Z', actor: 'System' },
  { id: 'a2', type: 'scan', message: 'Domain scan completed for suspicious-site.com — 14 subdomains found', severity: 'medium', timestamp: '2026-06-19T08:21:00Z', actor: 'scheduler' },
  { id: 'a3', type: 'monitor', message: 'Telegram channel "carding_zone" posted 27 messages with flagged keywords', severity: 'high', timestamp: '2026-06-19T07:55:00Z', actor: 'System' },
  { id: 'a4', type: 'report', message: 'Executive weekly report generated (PDF, 2.4 MB)', severity: 'info', timestamp: '2026-06-19T07:00:00Z', actor: 'admin@datacyber.io' },
  { id: 'a5', type: 'apikey', message: 'VirusTotal API key validated — quota 4/500', severity: 'info', timestamp: '2026-06-19T06:30:00Z', actor: 'admin@datacyber.io' },
  { id: 'a6', type: 'alert', message: 'Fake app detected impersonating "ACME Wallet" on Google Play', severity: 'high', timestamp: '2026-06-18T22:14:00Z', actor: 'System' },
  { id: 'a7', type: 'login', message: 'New login from 181.46.x.x (Bogotá, CO)', severity: 'low', timestamp: '2026-06-18T18:02:00Z', actor: 'admin@datacyber.io' },
  { id: 'a8', type: 'scan', message: 'URL forensic analysis completed for https://login-acme-secure.tk', severity: 'critical', timestamp: '2026-06-18T17:33:00Z', actor: 'analyst@datacyber.io' },
];

// ============================================================
// THREATS
// ============================================================
export const threats: Threat[] = [
  { id: 't1', title: 'Phishing kit detected on login-acme-secure.tk', source: 'URL Forensics', severity: 'critical', status: 'investigating', category: 'phishing', detectedAt: '2026-06-18T17:33:00Z', confidence: 96 },
  { id: 't2', title: 'Fake "ACME Wallet" app on Google Play', source: 'Brand Protection', severity: 'high', status: 'new', category: 'brand_abuse', detectedAt: '2026-06-18T22:14:00Z', confidence: 88 },
  { id: 't3', title: 'Credentials of exec@acmebank.com leaked in darkweb forum', source: 'Executive Protection', severity: 'critical', status: 'new', category: 'data_leak', detectedAt: '2026-06-19T04:02:00Z', confidence: 92 },
  { id: 't4', title: 'Typosquat domain acmebank-login.com registered', source: 'Brand Protection', severity: 'high', status: 'investigating', category: 'domain', detectedAt: '2026-06-19T03:18:00Z', confidence: 81 },
  { id: 't5', title: 'Malware signature match on downloaded APK', source: 'Sandbox', severity: 'high', status: 'investigating', category: 'malware', detectedAt: '2026-06-18T15:20:00Z', confidence: 84 },
  { id: 't6', title: 'Telegram channel selling ACME customer DB', source: 'Social Monitoring', severity: 'critical', status: 'new', category: 'social', detectedAt: '2026-06-19T07:55:00Z', confidence: 79 },
  { id: 't7', title: 'Expired SSL certificate on subdomain api.acmebank.com', source: 'Domain Analysis', severity: 'medium', status: 'resolved', category: 'domain', detectedAt: '2026-06-17T11:00:00Z', confidence: 100 },
  { id: 't8', title: 'Suspicious DNS tunneling pattern detected', source: 'Domain Analysis', severity: 'medium', status: 'investigating', category: 'domain', detectedAt: '2026-06-18T09:42:00Z', confidence: 67 },
  { id: 't9', title: 'Google dork exposed .env file on acmebank staging', source: 'Google Dorking', severity: 'critical', status: 'new', category: 'data_leak', detectedAt: '2026-06-19T05:11:00Z', confidence: 95 },
  { id: 't10', title: 'Fake ACME support account on Twitter', source: 'Brand Protection', severity: 'low', status: 'false_positive', category: 'brand_abuse', detectedAt: '2026-06-16T14:30:00Z', confidence: 42 },
  { id: 't11', title: 'CVE-2026-4421 match in exposed ACME infrastructure', source: 'Domain Analysis', severity: 'high', status: 'investigating', category: 'malware', detectedAt: '2026-06-18T13:09:00Z', confidence: 73 },
  { id: 't12', title: 'Brand impersonation on third-party marketplace', source: 'Brand Protection', severity: 'medium', status: 'new', category: 'brand_abuse', detectedAt: '2026-06-19T02:00:00Z', confidence: 68 },
];

// ============================================================
// BRAND PROTECTION
// ============================================================
export const brandTargets: BrandTarget[] = [
  { id: 'b1', brand: 'ACME Bank', type: 'domain', target: 'acmebank.com', status: 'active', lastScan: '2026-06-19T08:00:00Z', findings: 4 },
  { id: 'b2', brand: 'ACME Bank', type: 'appstore', target: 'ACME Wallet (Google Play)', status: 'flagged', lastScan: '2026-06-18T22:14:00Z', findings: 1 },
  { id: 'b3', brand: 'ACME Bank', type: 'marketplace', target: 'acmebank-login.com', status: 'flagged', lastScan: '2026-06-19T03:18:00Z', findings: 3 },
  { id: 'b4', brand: 'ACME Bank', type: 'social', target: '@acme_support (Twitter)', status: 'active', lastScan: '2026-06-19T07:00:00Z', findings: 0 },
  { id: 'b5', brand: 'ACME Wallet', type: 'appstore', target: 'ACME Wallet Pro (App Store)', status: 'active', lastScan: '2026-06-19T06:30:00Z', findings: 0 },
  { id: 'b6', brand: 'ACME Bank', type: 'domain', target: 'acmebank-secure.com', status: 'active', lastScan: '2026-06-19T05:00:00Z', findings: 2 },
  { id: 'b7', brand: 'ACME Crypto', type: 'marketplace', target: 'acme-crypto.app (3rd party)', status: 'flagged', lastScan: '2026-06-18T19:00:00Z', findings: 5 },
];

export const fakeApps: FakeApp[] = [
  { id: 'f1', appName: 'ACME Wallet - Secure Pay', developer: 'FreeTools2024', platform: 'Google Play', impersonated: 'ACME Wallet', maliciousScore: 87, detectedAt: '2026-06-18T22:14:00Z', status: 'pending' },
  { id: 'f2', appName: 'ACME Mobile Banking', developer: 'DevStudioX', platform: 'Third-party', impersonated: 'ACME Bank', maliciousScore: 94, detectedAt: '2026-06-17T11:08:00Z', status: 'reported' },
  { id: 'f3', appName: 'ACME Crypto Tracker', developer: 'CryptoAppsInc', platform: 'Google Play', impersonated: 'ACME Crypto', maliciousScore: 62, detectedAt: '2026-06-15T16:42:00Z', status: 'removed' },
  { id: 'f4', appName: 'ACME Pay - QR Scanner', developer: 'QRTools', platform: 'Third-party', impersonated: 'ACME Wallet', maliciousScore: 71, detectedAt: '2026-06-14T09:21:00Z', status: 'pending' },
];

// ============================================================
// EXECUTIVE PROTECTION
// ============================================================
export const executiveProfiles: ExecutiveProfile[] = [
  { id: 'e1', name: 'John Doe', role: 'CEO', company: 'ACME Bank', exposedEmails: 3, exposedPhones: 1, leakedCredentials: 2, riskScore: 78, lastCheck: '2026-06-19T04:02:00Z' },
  { id: 'e2', name: 'María Gómez', role: 'CFO', company: 'ACME Bank', exposedEmails: 2, exposedPhones: 0, leakedCredentials: 1, riskScore: 54, lastCheck: '2026-06-19T04:02:00Z' },
  { id: 'e3', name: 'Carlos Ruiz', role: 'CTO', company: 'ACME Bank', exposedEmails: 5, exposedPhones: 2, leakedCredentials: 4, riskScore: 89, lastCheck: '2026-06-19T04:02:00Z' },
  { id: 'e4', name: 'Ana Torres', role: 'COO', company: 'ACME Bank', exposedEmails: 1, exposedPhones: 0, leakedCredentials: 0, riskScore: 32, lastCheck: '2026-06-19T04:02:00Z' },
  { id: 'e5', name: 'Pedro Martín', role: 'CISO', company: 'ACME Bank', exposedEmails: 2, exposedPhones: 1, leakedCredentials: 1, riskScore: 61, lastCheck: '2026-06-19T04:02:00Z' },
];

export const exposureFindings: ExposureFinding[] = [
  { id: 'x1', profileId: 'e1', type: 'email', value: 'john.doe@acmebank.com', source: 'Pastebin leak 2026-04', severity: 'high', detectedAt: '2026-06-19T04:02:00Z' },
  { id: 'x2', profileId: 'e1', type: 'credential', value: 'LinkedIn (bcrypt hash)', source: 'Combolist 2026-Q1', severity: 'critical', detectedAt: '2026-06-19T04:02:00Z' },
  { id: 'x3', profileId: 'e3', type: 'phone', value: '+57 310 555 0142', source: 'Public directory scrape', severity: 'medium', detectedAt: '2026-06-19T04:02:00Z' },
  { id: 'x4', profileId: 'e3', type: 'credential', value: 'GitHub PAT (revoked)', source: 'Darkweb forum', severity: 'critical', detectedAt: '2026-06-19T04:02:00Z' },
  { id: 'x5', profileId: 'e3', type: 'document', value: 'Board memo Q1-2026.pdf', source: 'Public S3 bucket', severity: 'high', detectedAt: '2026-06-19T04:02:00Z' },
  { id: 'x6', profileId: 'e2', type: 'email', value: 'm.gomez@acmebank.com', source: 'Marketing vendor breach', severity: 'medium', detectedAt: '2026-06-19T04:02:00Z' },
  { id: 'x7', profileId: 'e5', type: 'address', value: 'Calle 100 #45-67, Bogotá', source: 'Corporate registry', severity: 'low', detectedAt: '2026-06-19T04:02:00Z' },
];

// ============================================================
// SOCIAL MONITORING
// ============================================================
export const socialChannels: SocialChannel[] = [
  { id: 's1', platform: 'Telegram', name: 'Carding Zone', identifier: '@carding_zone', members: 4821, messages: 8421, alerts: 27, status: 'flagged', lastActivity: '2026-06-19T07:55:00Z' },
  { id: 's2', platform: 'Telegram', name: 'ACME Leaks', identifier: '@acme_leaks_official', members: 1209, messages: 3127, alerts: 14, status: 'monitoring', lastActivity: '2026-06-19T06:42:00Z' },
  { id: 's3', platform: 'Discord', name: 'DB Marketplace', identifier: 'db-marketplace', members: 2188, messages: 5402, alerts: 9, status: 'monitoring', lastActivity: '2026-06-19T05:18:00Z' },
  { id: 's4', platform: 'Twitter', name: 'ACME Impersonators', identifier: 'search:ACME + support', members: 0, messages: 1429, alerts: 6, status: 'monitoring', lastActivity: '2026-06-19T04:00:00Z' },
  { id: 's5', platform: 'Reddit', name: 'r/acmebank', identifier: 'r/acmebank', members: 3412, messages: 2103, alerts: 2, status: 'monitoring', lastActivity: '2026-06-19T02:21:00Z' },
  { id: 's6', platform: 'Telegram', name: 'Phishing Kit Sellers', identifier: '@phishkits_2026', members: 894, messages: 410, alerts: 31, status: 'paused', lastActivity: '2026-06-18T22:11:00Z' },
];

export const socialMessages: SocialMessage[] = [
  { id: 'm1', channelId: 's1', author: 'anon_4421', content: 'Selling fresh ACME Bank logs, 1.2k accounts, DM for price', timestamp: '2026-06-19T07:55:00Z', sentiment: 'negative', flagged: true, keywords: ['selling', 'logs', 'accounts'] },
  { id: 'm2', channelId: 's1', author: 'carder_x', content: 'New phishing kit for ACME Wallet just dropped, includes 2FA bypass', timestamp: '2026-06-19T07:42:00Z', sentiment: 'negative', flagged: true, keywords: ['phishing kit', '2FA bypass'] },
  { id: 'm3', channelId: 's2', author: 'leaker_99', content: 'ACME internal docs dropped, 4.2GB, link in bio', timestamp: '2026-06-19T06:42:00Z', sentiment: 'negative', flagged: true, keywords: ['internal docs', 'leak'] },
  { id: 'm4', channelId: 's3', author: 'db_seller', content: 'ACME customer DB 2026-Q1, 80k rows, sample available', timestamp: '2026-06-19T05:18:00Z', sentiment: 'negative', flagged: true, keywords: ['customer DB', 'sample'] },
  { id: 'm5', channelId: 's4', author: 'acme_support_real', content: 'DM me your credentials to reset your ACME account', timestamp: '2026-06-19T04:00:00Z', sentiment: 'negative', flagged: true, keywords: ['credentials', 'reset'] },
  { id: 'm6', channelId: 's5', author: 'user_2811', content: 'Anyone else got a phishing SMS from ACME Bank today?', timestamp: '2026-06-19T02:21:00Z', sentiment: 'neutral', flagged: false, keywords: ['phishing', 'SMS'] },
  { id: 'm7', channelId: 's2', author: 'leaker_99', content: 'Updating the ACME leak with CTO emails and hashes', timestamp: '2026-06-18T22:30:00Z', sentiment: 'negative', flagged: true, keywords: ['emails', 'hashes'] },
  { id: 'm8', channelId: 's1', author: 'anon_4421', content: 'Bulk discount on ACME logs this weekend only', timestamp: '2026-06-18T20:11:00Z', sentiment: 'negative', flagged: true, keywords: ['bulk', 'discount', 'logs'] },
];

// ============================================================
// URL FORENSICS
// ============================================================
export const forensicsAnalyses: ForensicsAnalysis[] = [
  {
    id: 'u1',
    url: 'https://login-acme-secure.tk/signin',
    submittedAt: '2026-06-18T17:30:00Z',
    status: 'completed',
    threatScore: 94,
    redirects: 3,
    finalUrl: 'https://198.51.100.42/capture.php',
    ipAddress: '198.51.100.42',
    ssl: { valid: false, issuer: 'Let\'s Encrypt (suspicious)', validFrom: '2026-06-15', validTo: '2026-09-13' },
    detections: [
      { engine: 'VirusTotal', verdict: 'malicious (12/90)' },
      { engine: 'AbuseIPDB', verdict: 'reported 47 times' },
      { engine: 'Google Safe Browsing', verdict: 'phishing' },
      { engine: 'PhishTank', verdict: 'verified phishing' },
    ],
  },
  {
    id: 'u2',
    url: 'https://acmebank-reset-password.com',
    submittedAt: '2026-06-19T03:18:00Z',
    status: 'completed',
    threatScore: 87,
    redirects: 2,
    finalUrl: 'https://203.0.113.5/auth',
    ipAddress: '203.0.113.5',
    ssl: { valid: true, issuer: 'DigiCert', validFrom: '2026-05-01', validTo: '2027-05-01' },
    detections: [
      { engine: 'VirusTotal', verdict: 'suspicious (5/90)' },
      { engine: 'Google Safe Browsing', verdict: 'deceptive' },
    ],
  },
  {
    id: 'u3',
    url: 'https://bit.ly/3xY7z9k',
    submittedAt: '2026-06-19T08:15:00Z',
    status: 'processing',
    threatScore: 0,
    redirects: 0,
    finalUrl: '',
    ipAddress: '',
    ssl: { valid: false, issuer: '', validFrom: '', validTo: '' },
    detections: [],
  },
];

// ============================================================
// DOMAIN ANALYSIS
// ============================================================
export const domainRecords: DomainRecord[] = [
  {
    id: 'd1',
    domain: 'login-acme-secure.tk',
    registered: '2026-06-12',
    expires: '2027-06-12',
    registrar: 'Dot TK',
    dnsSec: false,
    reputation: 8,
    openPorts: [
      { port: 80, service: 'HTTP', risk: 'high' },
      { port: 443, service: 'HTTPS', risk: 'medium' },
      { port: 22, service: 'SSH', risk: 'medium' },
      { port: 8080, service: 'HTTP-Proxy', risk: 'high' },
    ],
    subdomains: ['www.login-acme-secure.tk', 'api.login-acme-secure.tk'],
    securityHeaders: [
      { header: 'Strict-Transport-Security', status: 'fail', value: 'missing' },
      { header: 'Content-Security-Policy', status: 'fail', value: 'missing' },
      { header: 'X-Frame-Options', status: 'warn', value: 'SAMEORIGIN' },
      { header: 'X-Content-Type-Options', status: 'pass', value: 'nosniff' },
    ],
    lastScan: '2026-06-18T17:33:00Z',
  },
  {
    id: 'd2',
    domain: 'acmebank.com',
    registered: '1998-03-15',
    expires: '2028-03-15',
    registrar: 'MarkMonitor',
    dnsSec: true,
    reputation: 92,
    openPorts: [
      { port: 443, service: 'HTTPS', risk: 'low' },
      { port: 25, service: 'SMTP', risk: 'low' },
    ],
    subdomains: ['www.acmebank.com', 'api.acmebank.com', 'app.acmebank.com', 'support.acmebank.com', 'cdn.acmebank.com'],
    securityHeaders: [
      { header: 'Strict-Transport-Security', status: 'pass', value: 'max-age=31536000; includeSubDomains' },
      { header: 'Content-Security-Policy', status: 'pass', value: 'default-src https:' },
      { header: 'X-Frame-Options', status: 'pass', value: 'DENY' },
      { header: 'X-Content-Type-Options', status: 'pass', value: 'nosniff' },
    ],
    lastScan: '2026-06-19T08:00:00Z',
  },
  {
    id: 'd3',
    domain: 'acmebank-login.com',
    registered: '2026-06-18',
    expires: '2027-06-18',
    registrar: 'NameCheap',
    dnsSec: false,
    reputation: 22,
    openPorts: [
      { port: 80, service: 'HTTP', risk: 'high' },
      { port: 443, service: 'HTTPS', risk: 'medium' },
    ],
    subdomains: [],
    securityHeaders: [
      { header: 'Strict-Transport-Security', status: 'fail', value: 'missing' },
      { header: 'Content-Security-Policy', status: 'fail', value: 'missing' },
      { header: 'X-Frame-Options', status: 'fail', value: 'missing' },
      { header: 'X-Content-Type-Options', status: 'fail', value: 'missing' },
    ],
    lastScan: '2026-06-19T03:18:00Z',
  },
];

// ============================================================
// GOOGLE DORKING
// ============================================================
export const dorkQueries: DorkQuery[] = [
  { id: 'k1', query: 'site:pastebin.com "acmebank.com" password', category: 'leaks', results: 14, lastRun: '2026-06-19T05:11:00Z', status: 'active' },
  { id: 'k2', query: 'site:github.com "ACME_BANK_API_KEY"', category: 'exposure', results: 3, lastRun: '2026-06-19T05:11:00Z', status: 'active' },
  { id: 'k3', query: 'intitle:"index of" "acmebank" .env', category: 'exposure', results: 1, lastRun: '2026-06-19T05:11:00Z', status: 'active' },
  { id: 'k4', query: 'inurl:"/admin" site:acmebank.com', category: 'infrastructure', results: 0, lastRun: '2026-06-19T05:11:00Z', status: 'active' },
  { id: 'k5', query: '"acme wallet" phishing template', category: 'phishing', results: 27, lastRun: '2026-06-18T22:00:00Z', status: 'active' },
  { id: 'k6', query: 'filetype:sql "acmebank" leaked', category: 'leaks', results: 2, lastRun: '2026-06-18T22:00:00Z', status: 'paused' },
];

export const dorkResults: DorkResult[] = [
  { id: 'r1', queryId: 'k1', title: 'ACME Bank credentials dump - Pastebin', url: 'https://pastebin.com/abc123', snippet: '...john.doe@acmebank.com:Password2024!...', severity: 'critical', detectedAt: '2026-06-19T05:11:00Z' },
  { id: 'r2', queryId: 'k2', title: 'acme-integration/config.json at main · devuser', url: 'https://github.com/devuser/acme-integration/blob/main/config.json', snippet: '"ACME_BANK_API_KEY": "sk_live_51H8..."', severity: 'critical', detectedAt: '2026-06-19T05:11:00Z' },
  { id: 'r3', queryId: 'k3', title: 'Index of /acmebank-staging', url: 'https://staging.acmebank.com/', snippet: '.env .git/ config/ backup.sql', severity: 'critical', detectedAt: '2026-06-19T05:11:00Z' },
  { id: 'r4', queryId: 'k5', title: 'ACME Wallet phishing kit - Download', url: 'https://example-phish.com/acme-kit.zip', snippet: 'Full ACME Wallet phishing template with 2FA bypass...', severity: 'high', detectedAt: '2026-06-18T22:00:00Z' },
  { id: 'r5', queryId: 'k1', title: 'ACME customer list 2026 - Pastebin', url: 'https://pastebin.com/def456', snippet: '...80,000 customer records from ACME Bank...', severity: 'high', detectedAt: '2026-06-18T22:00:00Z' },
];

// ============================================================
// REPORTS
// ============================================================
export const reportTemplates: ReportTemplate[] = [
  { id: 'rt1', name: 'Executive Summary', type: 'executive', description: 'High-level overview for C-suite with KPIs and risk trends', lastGenerated: '2026-06-19T07:00:00Z', sections: ['Overview', 'Critical Risks', 'Trends', 'Recommendations'] },
  { id: 'rt2', name: 'Technical Threat Report', type: 'technical', description: 'Detailed technical findings with IOCs and remediation steps', lastGenerated: '2026-06-18T16:30:00Z', sections: ['Threats', 'IOCs', 'Forensics', 'Remediation'] },
  { id: 'rt3', name: 'Compliance Report (ISO 27001)', type: 'compliance', description: 'Compliance mapping against ISO 27001 controls', lastGenerated: '2026-06-15T10:00:00Z', sections: ['Scope', 'Controls', 'Gaps', 'Action Plan'] },
  { id: 'rt4', name: 'Daily Digest', type: 'daily', description: 'Automated daily summary of new threats and scans', lastGenerated: '2026-06-19T06:00:00Z', sections: ['New Threats', 'Scans', 'Activity'] },
];

export const generatedReports: GeneratedReport[] = [
  { id: 'g1', title: 'Executive Summary — Week 25', template: 'Executive Summary', period: '2026-06-13 to 2026-06-19', generatedAt: '2026-06-19T07:00:00Z', status: 'ready', size: '2.4 MB' },
  { id: 'g2', title: 'Technical Threat Report — June', template: 'Technical Threat Report', period: '2026-06-01 to 2026-06-19', generatedAt: '2026-06-18T16:30:00Z', status: 'ready', size: '8.1 MB' },
  { id: 'g3', title: 'Daily Digest — 2026-06-19', template: 'Daily Digest', period: '2026-06-19', generatedAt: '2026-06-19T06:00:00Z', status: 'ready', size: '0.8 MB' },
  { id: 'g4', title: 'Compliance Report Q2 2026', template: 'Compliance Report (ISO 27001)', period: '2026-04-01 to 2026-06-30', generatedAt: '2026-06-19T08:30:00Z', status: 'processing', size: '—' },
];

// ============================================================
// API KEYS
// ============================================================
export const apiKeys: ApiKeyEntry[] = [
  { id: 'k1', provider: 'VirusTotal', label: 'VT Production', maskedKey: 'sk_live_51H8••••••••••••••••4a9c', status: 'active', lastUsed: '2026-06-19T08:00:00Z', quotaUsed: 4123, quotaTotal: 500000 },
  { id: 'k2', provider: 'AbuseIPDB', label: 'AbuseIPDB Default', maskedKey: 'abc123••••••••••••••••7f02', status: 'active', lastUsed: '2026-06-19T07:55:00Z', quotaUsed: 142, quotaTotal: 10000 },
  { id: 'k3', provider: 'Shodan', label: 'Shodan Main', maskedKey: 'SHO••••••••••••••••••2d8e', status: 'active', lastUsed: '2026-06-19T08:00:00Z', quotaUsed: 89, quotaTotal: 1000 },
  { id: 'k4', provider: 'Censys', label: 'Censys API', maskedKey: 'CEN••••••••••••••••••b1a4', status: 'unconfigured', lastUsed: '—' },
  { id: 'k5', provider: 'MobSF', label: 'MobSF Sandbox', maskedKey: 'MSF••••••••••••••••••9c3f', status: 'active', lastUsed: '2026-06-18T22:14:00Z' },
  { id: 'k6', provider: 'ScreenshotMachine', label: 'SM Default', maskedKey: 'SCR••••••••••••••••••0e2b', status: 'active', lastUsed: '2026-06-18T17:33:00Z' },
  { id: 'k7', provider: 'Telegram', label: 'Telegram Bot', maskedKey: '7424••••••••:AAE•••••••••••••••••', status: 'active', lastUsed: '2026-06-19T07:55:00Z' },
  { id: 'k8', provider: 'Discord', label: 'Discord Bot', maskedKey: 'MTA•••••••••••••••••••••••', status: 'invalid', lastUsed: '2026-06-15T11:00:00Z' },
];
