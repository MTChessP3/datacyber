'use client';

import { useState, useEffect, useCallback } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { useAppStore } from '@/lib/store';
import { loadDb, saveDb, genId } from '@/lib/local-db';
import { classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Server, FileLock2, Network, CalendarDays, Building2, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DomainScanResult {
  id: string;
  domain: string;
  scannedAt: string;
  status: 'completed' | 'failed' | 'processing';
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

export function DomainAnalysisModule() {
  const user = useAppStore((s) => s.user);
  const [query, setQuery] = useState('');
  const [scans, setScans] = useState<DomainScanResult[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    const db = loadDb();
    const sorted = [...db.domainScans].sort((a, b) => b.scannedAt.localeCompare(a.scannedAt));
    setScans(sorted as any);
    if (sorted.length > 0 && !selectedId) setSelectedId(sorted[0].id);
  }, [selectedId]);

  useEffect(() => { load(); }, [load]);

  async function scan() {
    if (!query) {
      toast.error('Ingresá un dominio para escanear');
      return;
    }
    setSubmitting(true);

    const tempId = genId('d');
    const tempScan: DomainScanResult = {
      id: tempId,
      domain: query.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
      scannedAt: new Date().toISOString(),
      status: 'processing',
      registered: '', expires: '', registrar: '', dnsSec: false,
      reputation: 0,
      openPorts: [], subdomains: [], securityHeaders: [], ipAddresses: [], nameServers: [],
    };
    const db = loadDb();
    db.domainScans.push(tempScan as any);
    saveDb(db);
    setScans(prev => [tempScan, ...prev]);
    setSelectedId(tempId);
    setQuery('');

    try {
      const res = await fetch('/api/scans/domain', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ domain: tempScan.domain }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Error al escanear');
        const db2 = loadDb();
        const idx = db2.domainScans.findIndex((s: any) => s.id === tempId);
        if (idx >= 0) {
          db2.domainScans[idx] = { ...db2.domainScans[idx], status: 'failed', error: err.error } as any;
          saveDb(db2);
        }
        setScans(prev => prev.map(s => s.id === tempId ? { ...s, status: 'failed', error: err.error } : s));
        return;
      }
      const result = await res.json();
      const db2 = loadDb();
      const idx = db2.domainScans.findIndex((s: any) => s.id === tempId);
      if (idx >= 0) {
        db2.domainScans[idx] = { ...db2.domainScans[idx], ...result, id: tempId, domain: tempScan.domain } as any;
        saveDb(db2);
      }
      db2.activity.unshift({
        id: genId('a'),
        type: 'scan',
        message: `Análisis dominio completado: ${tempScan.domain} (reputation: ${result.reputation})`,
        severity: result.reputation < 30 ? 'critical' : result.reputation < 60 ? 'medium' : 'low',
        actor: user?.username || 'system',
        timestamp: new Date().toISOString(),
      });
      saveDb(db2);
      setScans(prev => prev.map(s => s.id === tempId ? { ...s, ...result, status: 'completed' } : s));
      toast.success('Escaneo completado', { description: `${tempScan.domain} — reputation ${result.reputation}/100` });
    } catch (e: any) {
      toast.error('Error: ' + e.message);
      const db2 = loadDb();
      const idx = db2.domainScans.findIndex((s: any) => s.id === tempId);
      if (idx >= 0) {
        db2.domainScans[idx] = { ...db2.domainScans[idx], status: 'failed', error: e.message } as any;
        saveDb(db2);
      }
      setScans(prev => prev.map(s => s.id === tempId ? { ...s, status: 'failed', error: e.message } : s));
    } finally {
      setSubmitting(false);
    }
  }

  const selected = scans.find(s => s.id === selectedId);

  return (
    <div>
      <ModuleHeader
        title="Domain Analysis"
        description="Análisis REAL: DNS lookup (A/NS/MX/TXT), enumeración de 40 subdominios, port scan (20 puertos), security headers audit y WHOIS vía RDAP. Persistido en tu navegador."
      />

      <Card className="bg-card/60 mb-6 p-5">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="example.com"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && scan()}
              className="pl-9 h-10 font-mono"
            />
          </div>
          <Button onClick={scan} disabled={submitting} className="h-10 px-5">
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Escaneando…</>
            ) : (
              <><Network className="h-4 w-4 mr-1.5" />Run full scan</>
            )}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card/60 lg:col-span-1">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Dominios escaneados</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{scans.length} en tu navegador</p>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={load}>Refresh</Button>
          </div>
          <div className="p-2 space-y-1 max-h-[680px] overflow-y-auto dc-scroll">
            {scans.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No hay dominios escaneados. Escribí un dominio arriba.
              </div>
            )}
            {scans.map((d) => {
              const active = d.id === selectedId;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={classNames(
                    'w-full flex items-start gap-3 p-3 rounded-md transition text-left',
                    active ? 'bg-primary/10 border border-primary/30' : 'border border-transparent hover:bg-muted/30'
                  )}
                >
                  <div className={classNames('h-9 w-9 rounded-md flex items-center justify-center shrink-0',
                    d.status === 'completed' && d.reputation >= 70 ? 'bg-emerald-500/15 text-emerald-400' :
                    d.status === 'completed' && d.reputation >= 40 ? 'bg-orange-500/15 text-orange-400' :
                    d.status === 'completed' ? 'bg-red-500/15 text-red-400' :
                    d.status === 'failed' ? 'bg-red-500/15 text-red-400' :
                    'bg-amber-500/15 text-amber-400')}>
                    {d.status === 'processing' ? <Loader2 className="h-4 w-4 animate-spin" /> :
                     d.status === 'failed' ? <XCircle className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono truncate">{d.domain}</div>
                    {d.status === 'completed' && (
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <span>Reputation: {d.reputation}/100</span>
                        <span>· {d.subdomains.length} subdominios</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <Card className="bg-card/60 p-12 text-center">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Seleccioná un dominio o ejecutá un escaneo nuevo.</p>
            </Card>
          ) : (
            <>
              <Card className="bg-card/60 p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    <Globe className="h-6 w-6 text-primary mt-1 shrink-0" />
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold font-mono break-all">{selected.domain}</h2>
                      <div className="text-xs text-muted-foreground mt-1">Escaneado: {new Date(selected.scannedAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Reputación</div>
                    <div className={classNames('text-2xl font-bold dc-mono',
                      selected.reputation >= 70 ? 'text-emerald-400' : selected.reputation >= 40 ? 'text-orange-400' : 'text-red-400')}>
                      {selected.status === 'completed' ? selected.reputation : '—'}
                    </div>
                  </div>
                </div>

                {selected.status === 'processing' && (
                  <div className="mt-5 p-4 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
                    <div>
                      <div className="text-sm font-medium text-amber-400">Escaneando dominio…</div>
                      <div className="text-xs text-muted-foreground mt-0.5">DNS, subdominios, puertos y headers. Puede tardar 15-30 segundos.</div>
                    </div>
                  </div>
                )}

                {selected.status === 'failed' && (
                  <div className="mt-5 p-4 rounded-md bg-red-500/10 border border-red-500/30">
                    <div className="text-sm font-medium text-red-400">Escaneo falló</div>
                    <div className="text-xs text-muted-foreground mt-0.5 font-mono">{selected.error}</div>
                  </div>
                )}

                {selected.status === 'completed' && (
                  <>
                    <div className="mt-5 pt-5 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <FileLock2 className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-semibold">WHOIS / RDAP</h4>
                        {selected.dnsSec && <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">DNSSEC</Badge>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Registrar:</span> {selected.registrar || '—'}</div>
                        <div className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Registrado:</span> {selected.registered || '—'}</div>
                        <div className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Expira:</span> {selected.expires || '—'}</div>
                      </div>
                    </div>
                    <div className="mt-5 pt-5 border-t border-border">
                      <h4 className="text-sm font-semibold mb-3">DNS</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-muted-foreground mb-1">Direcciones IP (A)</div>
                          <div className="font-mono">{selected.ipAddresses.join(', ') || '—'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Name Servers (NS)</div>
                          <div className="font-mono text-[11px]">{selected.nameServers.join(', ') || '—'}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Card>

              {selected.status === 'completed' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SectionCard title="Puertos abiertos" description={`${selected.openPorts.length} detectados`}>
                    {selected.openPorts.length === 0 ? (
                      <div className="text-center py-6 text-sm text-muted-foreground">No se detectaron puertos abiertos</div>
                    ) : (
                      <div className="space-y-2">
                        {selected.openPorts.map((p) => {
                          const sv = p.risk === 'high' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                                     p.risk === 'medium' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                                     'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
                          return (
                            <div key={p.port} className="flex items-center justify-between gap-2 p-2.5 rounded-md border border-border bg-muted/20">
                              <div className="flex items-center gap-2.5">
                                <Server className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono text-sm">:{p.port}</span>
                                <span className="text-xs text-muted-foreground">{p.service}</span>
                              </div>
                              <Badge variant="outline" className={classNames('text-[10px] capitalize', sv)}>{p.risk}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </SectionCard>

                  <SectionCard title="Subdominios" description={`${selected.subdomains.length} encontrados`}>
                    {selected.subdomains.length === 0 ? (
                      <div className="text-center py-6 text-sm text-muted-foreground">No se encontraron subdominios</div>
                    ) : (
                      <div className="space-y-1 max-h-[280px] overflow-y-auto dc-scroll">
                        {selected.subdomains.map((s) => (
                          <div key={s} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/40 transition">
                            <Network className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-mono text-xs break-all">{s}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>
                </div>
              )}

              {selected.status === 'completed' && selected.securityHeaders.length > 0 && (
                <SectionCard title="Security headers" description="Auditoría HTTP real">
                  <div className="space-y-1.5">
                    {selected.securityHeaders.map((h) => {
                      const Icon = h.status === 'pass' ? CheckCircle2 : h.status === 'warn' ? AlertTriangle : XCircle;
                      const color = h.status === 'pass' ? 'text-emerald-400' : h.status === 'warn' ? 'text-yellow-400' : 'text-red-400';
                      return (
                        <div key={h.header} className="flex items-center justify-between gap-3 p-2.5 rounded-md border border-border bg-muted/20">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className={classNames('h-4 w-4 shrink-0', color)} />
                            <div className="min-w-0">
                              <div className="text-sm font-mono truncate">{h.header}</div>
                              <div className="text-[11px] text-muted-foreground font-mono truncate">{h.value}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className={classNames('text-[10px] capitalize shrink-0',
                            h.status === 'pass' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                            'bg-red-500/15 text-red-400 border-red-500/30')}>{h.status}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
