'use client';

import { useState, useEffect, useCallback } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { authFetch } from '@/lib/store';
import { formatDateTime, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Link2, ScanLine, Globe, Shield, AlertTriangle, CheckCircle2, XCircle,
  Lock, Server, Activity, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface UrlScan {
  id: string;
  url: string;
  submittedAt: string;
  status: string;
  threatScore: number;
  finalUrl: string | null;
  ipAddress: string | null;
  redirects: number;
  sslValid: boolean | null;
  sslIssuer: string | null;
  sslValidFrom: string | null;
  sslValidTo: string | null;
  detections: string | null;
  error?: string | null;
}

export function UrlForensicsModule() {
  const [url, setUrl] = useState('');
  const [scans, setScans] = useState<UrlScan[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadScans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/scans/url');
      if (res.ok) {
        const data = await res.json();
        setScans(data);
        if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { loadScans(); }, [loadScans]);

  // Poll cada 3s si hay scans en proceso
  useEffect(() => {
    const hasProcessing = scans.some(s => s.status === 'processing');
    if (!hasProcessing) return;
    const interval = setInterval(loadScans, 3000);
    return () => clearInterval(interval);
  }, [scans, loadScans]);

  async function analyze() {
    if (!url) {
      toast.error('Ingresá una URL para analizar');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authFetch('/api/scans/url', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Error al analizar URL');
        return;
      }
      const data = await res.json();
      toast.success('Análisis iniciado', { description: `Escaneando ${url}…` });
      setUrl('');
      // Recargar inmediatamente y seleccionar el nuevo
      setTimeout(async () => {
        await loadScans();
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
        title="URL Forensics"
        description="Análisis forense REAL de URLs: DNS lookup, validación SSL, cadena de redirects, heurísticas y Google Safe Browsing. Los resultados se guardan en base de datos."
        actions={<Button size="sm" onClick={() => toast.info('Bulk submit', { description: 'Próximamente: subir lista CSV de URLs.' })}><ScanLine className="h-3.5 w-3.5 mr-1.5" />Bulk Submit</Button>}
      />

      <Card className="bg-card/60 mb-6 p-5">
        <Label className="text-xs mb-2 block">Analizar URL</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="https://suspicious-url.example.com/path"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && analyze()}
              className="pl-9 h-10 font-mono text-sm"
            />
          </div>
          <Button onClick={analyze} disabled={submitting} className="h-10 px-5">
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Analizando…</>
            ) : (
              <><ScanLine className="h-4 w-4 mr-1.5" />Analyze URL</>
            )}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          El análisis incluye: resolución DNS, validación SSL real (TLS handshake), traza de redirects, heurísticas y Google Safe Browsing si hay API key configurada.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card/60 lg:col-span-1">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Análisis realizados</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{scans.length} en base de datos</p>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={loadScans} disabled={loading}>
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Refresh'}
            </Button>
          </div>
          <div className="p-2 space-y-1 max-h-[640px] overflow-y-auto dc-scroll">
            {scans.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No hay análisis todavía.<br/>Escribí una URL arriba y hacé clic en Analyze.
              </div>
            )}
            {scans.map((s) => {
              const active = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={classNames(
                    'w-full flex items-start gap-3 p-3 rounded-md transition text-left',
                    active ? 'bg-primary/10 border border-primary/30' : 'border border-transparent hover:bg-muted/30'
                  )}
                >
                  <div className={classNames(
                    'h-9 w-9 rounded-md flex items-center justify-center shrink-0',
                    s.status === 'completed' && s.threatScore >= 70 ? 'bg-red-500/15 text-red-400' :
                    s.status === 'completed' && s.threatScore >= 40 ? 'bg-orange-500/15 text-orange-400' :
                    s.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                    s.status === 'failed' ? 'bg-red-500/15 text-red-400' :
                    'bg-amber-500/15 text-amber-400'
                  )}>
                    {s.status === 'processing' ? <Loader2 className="h-4 w-4 animate-spin" /> :
                     s.status === 'failed' ? <XCircle className="h-4 w-4" /> :
                     <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono truncate">{s.url}</div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className={classNames('text-[10px] px-1.5 py-0',
                        s.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                        s.status === 'failed' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                        'bg-amber-500/15 text-amber-400 border-amber-500/30')}>
                        {s.status}
                      </Badge>
                      {s.status === 'completed' && <span>Score: {s.threatScore}</span>}
                      <span>{formatDateTime(s.submittedAt)}</span>
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
              <ScanLine className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Seleccioná un análisis de la izquierda o ejecutá uno nuevo arriba.
              </p>
            </Card>
          ) : (
            <>
              <Card className="bg-card/60 p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">URL analizada</div>
                      <div className="text-sm font-mono break-all">{selected.url}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={classNames('text-[10px]',
                    selected.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                    selected.status === 'failed' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                    'bg-amber-500/15 text-amber-400 border-amber-500/30')}>
                    {selected.status === 'processing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                    {selected.status}
                  </Badge>
                </div>

                {selected.status === 'processing' && (
                  <div className="mt-5 p-4 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                    <Activity className="h-5 w-5 text-amber-400 animate-pulse" />
                    <div>
                      <div className="text-sm font-medium text-amber-400">Analizando URL en tiempo real…</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Resolviendo DNS, validando SSL, traceando redirects y corriendo heurísticas.
                      </div>
                    </div>
                  </div>
                )}

                {selected.status === 'failed' && (
                  <div className="mt-5 p-4 rounded-md bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-red-400">Análisis falló</div>
                      <div className="text-xs text-muted-foreground mt-0.5 font-mono">{selected.error}</div>
                    </div>
                  </div>
                )}

                {selected.status === 'completed' && (
                  <>
                    <div className="mt-5 flex items-center gap-5">
                      <div className="relative h-24 w-24 shrink-0">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="8" />
                          <circle
                            cx="50" cy="50" r="42" fill="none"
                            stroke={selected.threatScore >= 70 ? '#ef4444' : selected.threatScore >= 40 ? '#f59e0b' : '#10b981'}
                            strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={`${(selected.threatScore / 100) * 264} 264`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={classNames('text-2xl font-bold dc-mono',
                            selected.threatScore >= 70 ? 'text-red-400' : selected.threatScore >= 40 ? 'text-orange-400' : 'text-emerald-400')}>
                            {selected.threatScore}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">threat</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold">
                          {selected.threatScore >= 70 ? 'MALICIOSO — alta confianza' :
                           selected.threatScore >= 40 ? 'SOSPECHOSO — revisar' : 'PROBABLEMENTE SEGURO'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Final URL: <span className="font-mono break-all">{selected.finalUrl}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          IP: <span className="font-mono">{selected.ipAddress || '—'}</span> · Redirects: {selected.redirects}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-5 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-semibold">Certificado SSL</h4>
                        {selected.sslValid === true ? (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Válido
                          </Badge>
                        ) : selected.sslValid === false ? (
                          <Badge variant="outline" className="text-[10px] bg-red-500/15 text-red-400 border-red-500/30">
                            <XCircle className="h-3 w-3 mr-1" /> Inválido
                          </Badge>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div><span className="text-muted-foreground">Issuer: </span>{selected.sslIssuer || '—'}</div>
                        <div><span className="text-muted-foreground">Valid from: </span>{selected.sslValidFrom || '—'}</div>
                        <div><span className="text-muted-foreground">Valid to: </span>{selected.sslValidTo || '—'}</div>
                      </div>
                    </div>
                  </>
                )}
              </Card>

              {selected.status === 'completed' && selected.detections && (
                <SectionCard title="Detecciones" description="Motores de análisis y veredictos reales">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(() => {
                      try {
                        const d = JSON.parse(selected.detections);
                        return d.map((det: any, i: number) => (
                          <div key={i} className="flex items-center justify-between gap-2 p-3 rounded-md border border-border bg-muted/20">
                            <div className="flex items-center gap-2 min-w-0">
                              <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                              <div className="min-w-0">
                                <div className="text-sm font-medium">{det.engine}</div>
                                <div className="text-xs text-muted-foreground truncate">{det.verdict}</div>
                              </div>
                            </div>
                            {(det.verdict?.toLowerCase().includes('malicious') ||
                              det.verdict?.toLowerCase().includes('phishing') ||
                              det.verdict?.toLowerCase().includes('invalid') ||
                              det.verdict?.toLowerCase().includes('failed') ||
                              det.verdict?.toLowerCase().includes('suspicious')) && (
                              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                            )}
                          </div>
                        ));
                      } catch { return null; }
                    })()}
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
