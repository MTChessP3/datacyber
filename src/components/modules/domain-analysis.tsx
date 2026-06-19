'use client';

import { useState, useEffect, useCallback } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { authFetch } from '@/lib/store';
import { classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Search, Server, FileLock2, Network, CalendarDays, Building2, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DomainScan {
  id: string;
  domain: string;
  scannedAt: string;
  status: string;
  registered: string | null;
  expires: string | null;
  registrar: string | null;
  dnsSec: boolean | null;
  reputation: number;
  openPorts: string | null;
  subdomains: string | null;
  securityHeaders: string | null;
  ipAddresses: string | null;
  nameServers: string | null;
  error?: string | null;
}

export function DomainAnalysisModule() {
  const [query, setQuery] = useState('');
  const [scans, setScans] = useState<DomainScan[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/scans/domain');
      if (res.ok) {
        const data = await res.json();
        setScans(data);
        if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
      }
    } finally { setLoading(false); }
  }, [selectedId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const hasProcessing = scans.some(s => s.status === 'processing');
    if (!hasProcessing) return;
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [scans, load]);

  async function scan() {
    if (!query) {
      toast.error('Ingresá un dominio para escanear');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authFetch('/api/scans/domain', {
        method: 'POST',
        body: JSON.stringify({ domain: query }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Error al escanear dominio');
        return;
      }
      const data = await res.json();
      toast.success('Escaneo iniciado', { description: `Dominio: ${data.domain}` });
      setQuery('');
      setTimeout(async () => {
        await load();
        setSelectedId(data.id);
      }, 500);
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const selected = scans.find(s => s.id === selectedId);

  return (
    <div>
      <ModuleHeader
        title="Domain Analysis"
        description="Análisis REAL de dominio: DNS lookup (A, NS, MX, TXT), enumeración de subdominios, escaneo de puertos, auditoría de security headers y WHOIS vía RDAP."
        actions={null}
      />

      <Card className="bg-card/60 mb-6 p-5">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              <p className="text-xs text-muted-foreground mt-0.5">{scans.length} en base de datos</p>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Refresh'}
            </Button>
          </div>
          <div className="p-2 space-y-1 max-h-[680px] overflow-y-auto dc-scroll">
            {scans.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No hay dominios escaneados todavía.
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
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      {d.status === 'completed' && <span>Reputation: {d.reputation}/100</span>}
                      {d.status === 'completed' && <span>· {(() => { try { return JSON.parse(d.subdomains || '[]').length; } catch { return 0; } })()} subdominios</span>}
                    </div>
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
              <p className="text-sm text-muted-foreground">
                Seleccioná un dominio o ejecutá un escaneo nuevo.
              </p>
            </Card>
          ) : (
            <>
              <Card className="bg-card/60 p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    <Globe className="h-6 w-6 text-primary mt-1 shrink-0" />
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold font-mono break-all">{selected.domain}</h2>
                      <div className="text-xs text-muted-foreground mt-1">
                        Escaneado: {new Date(selected.scannedAt).toLocaleString()}
                      </div>
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
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Resolviendo DNS, enumerando subdominios, escaneando puertos y verificando headers.
                      </div>
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
                        {selected.dnsSec && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">DNSSEC</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Registrar:</span> {selected.registrar || '—'}</div>
                        <div className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Registrado:</span> {selected.registered || '—'}</div>
                        <div className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Expira:</span> {selected.expires || '—'}</div>
                      </div>
                    </div>

                    <div className="mt-5 pt-5 border-t border-border">
                      <h4 className="text-sm font-semibold mb-3">DNS Resolución</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-muted-foreground mb-1">Direcciones IP (A)</div>
                          <div className="font-mono">{(() => { try { return JSON.parse(selected.ipAddresses || '[]').join(', ') || '—'; } catch { return '—'; } })()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Name Servers (NS)</div>
                          <div className="font-mono text-[11px]">{(() => { try { return JSON.parse(selected.nameServers || '[]').join(', ') || '—'; } catch { return '—'; } })()}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Card>

              {selected.status === 'completed' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SectionCard title="Puertos abiertos" description={`${(() => { try { return JSON.parse(selected.openPorts || '[]').length; } catch { return 0; } })()} detectados`}>
                    {(() => {
                      try {
                        const ports = JSON.parse(selected.openPorts || '[]');
                        if (ports.length === 0) return <div className="text-center py-6 text-sm text-muted-foreground">No se detectaron puertos abiertos</div>;
                        return (
                          <div className="space-y-2">
                            {ports.map((p: any) => {
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
                        );
                      } catch { return null; }
                    })()}
                  </SectionCard>

                  <SectionCard title="Subdominios" description={`${(() => { try { return JSON.parse(selected.subdomains || '[]').length; } catch { return 0; } })()} encontrados`}>
                    {(() => {
                      try {
                        const subs = JSON.parse(selected.subdomains || '[]');
                        if (subs.length === 0) return <div className="text-center py-6 text-sm text-muted-foreground">No se encontraron subdominios</div>;
                        return (
                          <div className="space-y-1 max-h-[280px] overflow-y-auto dc-scroll">
                            {subs.map((s: string) => (
                              <div key={s} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/40 transition">
                                <Network className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="font-mono text-xs break-all">{s}</span>
                              </div>
                            ))}
                          </div>
                        );
                      } catch { return null; }
                    })()}
                  </SectionCard>
                </div>
              )}

              {selected.status === 'completed' && selected.securityHeaders && (
                <SectionCard title="Security headers" description="Auditoría HTTP real">
                  {(() => {
                    try {
                      const headers = JSON.parse(selected.securityHeaders);
                      return (
                        <div className="space-y-1.5">
                          {headers.map((h: any) => {
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
                                  h.status === 'warn' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                                  'bg-red-500/15 text-red-400 border-red-500/30')}>
                                  {h.status}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } catch { return null; }
                    })()}
                </SectionCard>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
