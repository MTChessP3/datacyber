import { db } from '../src/lib/db';
import * as bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding complete database...');

  // Users
  await db.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin', email: 'admin@datacyber.io',
      passwordHash: await bcrypt.hash('admin', 10), role: 'Administrator', avatar: 'AD',
    },
  });
  await db.user.upsert({
    where: { username: 'analyst' },
    update: {},
    create: {
      username: 'analyst', email: 'analyst@datacyber.io',
      passwordHash: await bcrypt.hash('analyst', 10), role: 'Threat Analyst', avatar: 'AN',
    },
  });

  // Brands
  const brands = [
    { id: 'bancolombia',         name: 'Bancolombia',         country: 'Colombia',    type: 'Bank',     domain: 'bancolombia.com',   status: 'active',  findings: 7  },
    { id: 'banco-agromercantil', name: 'Banco AgroMercantil', country: 'Guatemala',   type: 'Bank',     domain: 'agromercantil.com', status: 'active',  findings: 3  },
    { id: 'banco-agricola',      name: 'Banco Agrícola',      country: 'El Salvador', type: 'Bank',     domain: 'bancoagricola.com', status: 'active',  findings: 4  },
    { id: 'banistmo',            name: 'Banistmo',            country: 'Panamá',      type: 'Bank',     domain: 'banistmo.com',      status: 'active',  findings: 2  },
    { id: 'nequi',               name: 'Nequi',               country: 'Colombia',    type: 'Fintech',  domain: 'nequi.com',         status: 'flagged', findings: 11 },
    { id: 'zaswin',              name: 'Zaswin',              country: 'Colombia',    type: 'Fintech',  domain: 'zaswin.com',        status: 'active',  findings: 1  },
    { id: 'renting',             name: 'Renting',             country: 'Colombia',    type: 'Services', domain: 'renting.com.co',    status: 'active',  findings: 0  },
    { id: 'suvalor',             name: 'Suvalor',             country: 'Colombia',    type: 'Services', domain: 'suvalor.com',       status: 'active',  findings: 2  },
    { id: 'wompi',               name: 'Wompi',               country: 'Colombia',    type: 'Fintech',  domain: 'wompi.co',          status: 'flagged', findings: 9  },
    { id: 'wenia',               name: 'Wenia',               country: 'Colombia',    type: 'Fintech',  domain: 'wenia.com',         status: 'flagged', findings: 6  },
  ];
  for (const b of brands) {
    await db.brand.upsert({ where: { id: b.id }, update: b, create: b });
  }

  // Threats
  const threats = [
    { brandId: 'nequi',      title: 'Phishing kit en login-nequi-seguro.tk imitando Nequi',           source: 'URL Forensics',        severity: 'critical', status: 'investigating', category: 'phishing',    confidence: 96 },
    { brandId: 'nequi',      title: 'App falsa "Nequi Bolsillos Pro" en Google Play',                 source: 'Brand Protection',     severity: 'high',     status: 'new',           category: 'brand_abuse', confidence: 88 },
    { brandId: 'wenia',      title: 'Credenciales del CTO de Wenia filtradas en darkweb',             source: 'Executive Protection', severity: 'critical', status: 'new',           category: 'data_leak',   confidence: 92 },
    { brandId: 'bancolombia',title: 'Typosquat bancolombia-login.com registrado',                     source: 'Brand Protection',     severity: 'high',     status: 'investigating', category: 'domain',      confidence: 81 },
    { brandId: 'wompi',      title: 'APK de Wompi con malware firmado y distribuido en foros',        source: 'Sandbox',              severity: 'high',     status: 'investigating', category: 'malware',     confidence: 84 },
    { brandId: 'wenia',      title: 'Telegram @wenia_airdrop_scams vendiendo "doble saldo Wenia"',    source: 'Social Monitoring',    severity: 'critical', status: 'new',           category: 'social',      confidence: 79 },
    { brandId: 'banco-agricola', title: 'SSL caducado en api.bancoagricola.com',                     source: 'Domain Analysis',      severity: 'medium',   status: 'resolved',      category: 'domain',      confidence: 100 },
    { brandId: 'banistmo',   title: 'Túnel DNS sospechoso detectado en subdominio de Banistmo',       source: 'Domain Analysis',      severity: 'medium',   status: 'investigating', category: 'domain',      confidence: 67 },
    { brandId: 'wompi',      title: 'Google dork expuso .env con API keys de Wompi en staging',       source: 'Google Dorking',       severity: 'critical', status: 'new',           category: 'data_leak',   confidence: 95 },
    { brandId: 'nequi',      title: 'Falso @soporte_nequi en Twitter pidiendo credenciales',          source: 'Brand Protection',     severity: 'medium',   status: 'investigating', category: 'brand_abuse', confidence: 76 },
    { brandId: 'wenia',      title: 'CVE-2026-4421 detectado en infraestructura expuesta de Wenia',   source: 'Domain Analysis',      severity: 'high',     status: 'investigating', category: 'malware',     confidence: 73 },
    { brandId: 'zaswin',     title: 'Sitio clon de Zaswin en zaswin-inversiones.net',                 source: 'Brand Protection',     severity: 'medium',   status: 'new',           category: 'brand_abuse', confidence: 68 },
    { brandId: 'banco-agromercantil', title: 'Credenciales de empleado de Banco AgroMercantil en combolist', source: 'Executive Protection', severity: 'high', status: 'new', category: 'data_leak', confidence: 85 },
    { brandId: 'renting',    title: 'Dominio typosquat renting-colombia.com registrado',              source: 'Brand Protection',     severity: 'low',      status: 'investigating', category: 'domain',      confidence: 58 },
    { brandId: 'suvalor',    title: 'Canal de Discord vendiendo "cuentas Suvalor verificadas"',       source: 'Social Monitoring',    severity: 'high',     status: 'new',           category: 'social',      confidence: 82 },
  ];
  for (const t of threats) {
    await db.threat.create({ data: t }).catch(() => {});
  }

  // Executives
  const execs = [
    { name: 'Juan Carlos Mora',       role: 'CEO',  company: 'Bancolombia',         exposedEmails: 3, exposedPhones: 1, leakedCredentials: 2, riskScore: 72 },
    { name: 'María Isabel Gutiérrez', role: 'CFO',  company: 'Bancolombia',         exposedEmails: 2, exposedPhones: 0, leakedCredentials: 1, riskScore: 54 },
    { name: 'Carlos Andrés Ruiz',     role: 'CTO',  company: 'Wenia',               exposedEmails: 5, exposedPhones: 2, leakedCredentials: 4, riskScore: 89 },
    { name: 'Ana Lucía Torres',       role: 'COO',  company: 'Nequi',               exposedEmails: 1, exposedPhones: 0, leakedCredentials: 0, riskScore: 32 },
    { name: 'Pedro Martín Herrera',   role: 'CISO', company: 'Wompi',               exposedEmails: 2, exposedPhones: 1, leakedCredentials: 1, riskScore: 61 },
    { name: 'Roberto Aguilar',        role: 'CEO',  company: 'Banco AgroMercantil', exposedEmails: 2, exposedPhones: 1, leakedCredentials: 1, riskScore: 58 },
    { name: 'Sofía Panameño',         role: 'CISO', company: 'Banco Agrícola',      exposedEmails: 1, exposedPhones: 0, leakedCredentials: 0, riskScore: 28 },
    { name: 'Manuel Quintero',        role: 'CEO',  company: 'Banistmo',            exposedEmails: 2, exposedPhones: 1, leakedCredentials: 1, riskScore: 52 },
    { name: 'Daniela Restrepo',       role: 'CEO',  company: 'Zaswin',              exposedEmails: 1, exposedPhones: 0, leakedCredentials: 0, riskScore: 24 },
  ];
  for (const e of execs) {
    await db.executive.create({ data: e }).catch(() => {});
  }

  // Social channels
  const channels = [
    { platform: 'Telegram', name: 'Nequi Scams',               identifier: '@nequi_scams_col',           members: 4821, messages: 8421, alerts: 27, status: 'flagged' },
    { platform: 'Telegram', name: 'Wenia Airdrop Scams',       identifier: '@wenia_airdrop_scams',       members: 1209, messages: 3127, alerts: 14, status: 'flagged' },
    { platform: 'Discord',  name: 'DB Marketplace',            identifier: 'db-marketplace',             members: 2188, messages: 5402, alerts:  9, status: 'monitoring' },
    { platform: 'Twitter',  name: 'Bancolombia Impersonators', identifier: 'search:Bancolombia+soporte', members: 0,    messages: 1429, alerts:  6, status: 'monitoring' },
    { platform: 'Reddit',   name: 'r/Panama — Banistmo',       identifier: 'r/Panama',                   members: 3412, messages: 2103, alerts:  2, status: 'monitoring' },
    { platform: 'Telegram', name: 'Wompi Carding',             identifier: '@wompi_carding_2026',        members:  894, messages:  410, alerts: 31, status: 'paused' },
    { platform: 'Discord',  name: 'Suvalor Verified Sellers',  identifier: 'suvalor-market',             members:  612, messages:  391, alerts: 12, status: 'flagged' },
  ];
  for (const c of channels) {
    await db.socialChannel.create({ data: c }).catch(() => {});
  }

  // API Keys
  const keys = [
    { provider: 'VirusTotal',        label: 'VT Production',     maskedKey: 'sk_live_51H8••••••••••••••••4a9c', status: 'active',       quotaUsed: 4123,  quotaTotal: 500000 },
    { provider: 'AbuseIPDB',         label: 'AbuseIPDB Default', maskedKey: 'abc123••••••••••••••••7f02',       status: 'active',       quotaUsed: 142,   quotaTotal: 10000 },
    { provider: 'Shodan',            label: 'Shodan Main',       maskedKey: 'SHO••••••••••••••••••2d8e',         status: 'active',       quotaUsed: 89,    quotaTotal: 1000 },
    { provider: 'Censys',            label: 'Censys API',        maskedKey: 'CEN••••••••••••••••••b1a4',         status: 'unconfigured' },
    { provider: 'MobSF',             label: 'MobSF Sandbox',     maskedKey: 'MSF••••••••••••••••••9c3f',         status: 'active' },
    { provider: 'Telegram',          label: 'Telegram Bot',      maskedKey: '7424••••••••:AAE•••••••••••••••••', status: 'active' },
  ];
  for (const k of keys) {
    await db.apiKey.create({ data: k }).catch(() => {});
  }

  // Activity log
  const logs = [
    { type: 'alert',   message: 'Phishing kit detectado imitando Nequi en login-nequi-seguro.tk',          severity: 'critical', actor: 'System' },
    { type: 'scan',    message: 'Análisis de dominio completado para wompi-fake-checkout.com',             severity: 'medium',   actor: 'scheduler' },
    { type: 'monitor', message: 'Canal Telegram @wenia_airdrop_scams publicó 47 mensajes flaggeados',     severity: 'high',     actor: 'System' },
    { type: 'report',  message: 'Reporte ejecutivo semanal generado (PDF) — 11 marcas',                    severity: 'info',     actor: 'admin@datacyber.io' },
    { type: 'apikey',  message: 'API key de VirusTotal validada — quota 4123/500000',                      severity: 'info',     actor: 'admin@datacyber.io' },
    { type: 'alert',   message: 'App falsa detectada imitando "Nequi Bolsillos" en Google Play',           severity: 'high',     actor: 'System' },
    { type: 'login',   message: 'Login admin@datacyber.io (Administrator) — 181.46.x.x',                   severity: 'low',      actor: 'admin@datacyber.io' },
    { type: 'scan',    message: 'Análisis forense de URL completado para https://wompi-pagos-seguros.tk', severity: 'critical', actor: 'analyst@datacyber.io' },
  ];
  for (const l of logs) {
    await db.activityLog.create({ data: l }).catch(() => {});
  }

  console.log(`✅ Seed: 2 users + ${brands.length} brands + ${threats.length} threats + ${execs.length} execs + ${channels.length} channels + ${keys.length} keys + ${logs.length} logs`);
}

main().catch((e) => { console.error('❌', e); process.exit(1); }).finally(async () => { await db.$disconnect(); });
