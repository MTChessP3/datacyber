'use client';

import { useState } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { forensicsAnalyses } from '@/lib/data';
import { formatDateTime, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Link2, ScanLine, Globe, Shield, AlertTriangle, CheckCircle2, XCircle,
  ArrowRight, Lock, Server, Activity,
} from 'lucide-react';

import { toast } from 'sonner';

const statusStyles = {
  completed:  { label: 'Completed',  badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  processing: { label: 'Processing', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  queued:     { label: 'Queued',     badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

export function UrlForensicsModule() {
  const [url, setUrl] = useState('');
  const [selectedId, setSelectedId] = useState(forensicsAnalyses[0].id);
  const selected = forensicsAnalyses.find((a) => a.id === selectedId)!;

  function analyze() {
    if (!url) {
      toast.error('Ingresá una URL para analizar');
      return;
    }
    toast.success('Análisis iniciado', { description: `URL: ${url.slice(0, 60)}…` });
    setSelectedId(forensicsAnalyses[0].id);
  }

  return (
    <div>
      <ModuleHeader
        title="URL Forensics"
        description="Análisis forense profundo de URLs sospechosas: cadena de redirects, validación SSL, detonación en sandbox y reputación multi-engine. Detecta phishing contra las 11 marcas."
        actions={<Button size="sm" onClick={() => toast.info('Bulk submit', { description: 'Subir lista CSV de URLs para análisis masivo.' })}><ScanLine className="h-3.5 w-3.5 mr-1.5" />Bulk Submit</Button>}
      />

      {/* Submission box */}
      <Card className="bg-card/60 mb-6 p-5">
        <Label className="text-xs mb-2 block">Analyze URL for threats</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="https://suspicious-url.example.com/path"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-9 h-10 font-mono text-sm"
            />
          </div>
          <Button onClick={analyze} className="h-10 px-5">
            <ScanLine className="h-4 w-4 mr-1.5" />
            Analyze URL
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          The URL will be analyzed in a sandboxed environment. Redirect chains, SSL cert, IP reputation and 4+ detection engines will be checked.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* History list */}
        <Card className="bg-card/60 lg:col-span-1">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Analysis History</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{forensicsAnalyses.length} recent</p>
          </div>
          <div className="p-2 space-y-1 max-h-[640px] overflow-y-auto dc-scroll">
            {forensicsAnalyses.map((a) => {
              const active = a.id === selectedId;
              const st = statusStyles[a.status];
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={classNames(
                    'w-full flex items-start gap-3 p-3 rounded-md transition text-left',
                    active ? 'bg-primary/10 border border-primary/30' : 'border border-transparent hover:bg-muted/30'
                  )}
                >
                  <div className={classNames(
                    'h-9 w-9 rounded-md flex items-center justify-center shrink-0',
                    a.threatScore >= 80 ? 'bg-red-500/15 text-red-400' :
                    a.threatScore >= 50 ? 'bg-orange-500/15 text-orange-400' :
                    a.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                  )}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono truncate">{a.url}</div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className={classNames('text-[10px] px-1.5 py-0', st.badge)}>{st.label}</Badge>
                      <span>{formatDateTime(a.submittedAt)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Analysis details */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card/60 p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Analyzed URL</div>
                  <div className="text-sm font-mono break-all">{selected.url}</div>
                </div>
              </div>
              <Badge variant="outline" className={classNames('text-[10px]', statusStyles[selected.status].badge)}>
                {statusStyles[selected.status].label}
              </Badge>
            </div>

            {selected.status === 'completed' && (
              <>
                {/* Threat score gauge */}
                <div className="mt-5 flex items-center gap-5">
                  <div className="relative h-24 w-24 shrink-0">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke={selected.threatScore >= 80 ? '#ef4444' : selected.threatScore >= 50 ? '#f59e0b' : '#10b981'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(selected.threatScore / 100) * 264} 264`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={classNames('text-2xl font-bold dc-mono',
                        selected.threatScore >= 80 ? 'text-red-400' : selected.threatScore >= 50 ? 'text-orange-400' : 'text-emerald-400')}>
                        {selected.threatScore}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">threat</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold">
                      {selected.threatScore >= 80 ? 'Malicious — high confidence' :
                       selected.threatScore >= 50 ? 'Suspicious — review recommended' : 'Likely benign'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Final URL: <span className="font-mono break-all">{selected.finalUrl}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      IP: <span className="font-mono">{selected.ipAddress}</span> · Redirects: {selected.redirects}
                    </p>
                  </div>
                </div>

                {/* SSL */}
                <div className="mt-5 pt-5 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold">SSL Certificate</h4>
                    {selected.ssl.valid ? (
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Valid
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-red-500/15 text-red-400 border-red-500/30">
                        <XCircle className="h-3 w-3 mr-1" /> Invalid
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div><span className="text-muted-foreground">Issuer: </span>{selected.ssl.issuer || '—'}</div>
                    <div><span className="text-muted-foreground">Valid from: </span>{selected.ssl.validFrom || '—'}</div>
                    <div><span className="text-muted-foreground">Valid to: </span>{selected.ssl.validTo || '—'}</div>
                  </div>
                </div>
              </>
            )}
          </Card>

          {selected.status === 'completed' && selected.detections.length > 0 && (
            <SectionCard title="Detection engines" description="Multi-engine reputation and threat verdicts">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selected.detections.map((d) => (
                  <div key={d.engine} className="flex items-center justify-between gap-2 p-3 rounded-md border border-border bg-muted/20">
                    <div className="flex items-center gap-2 min-w-0">
                      <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{d.engine}</div>
                        <div className="text-xs text-muted-foreground truncate">{d.verdict}</div>
                      </div>
                    </div>
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {selected.status === 'processing' && (
            <Card className="bg-card/60 p-8 text-center">
              <div className="inline-flex items-center gap-2 text-amber-400">
                <Activity className="h-5 w-5 animate-pulse" />
                <span className="text-sm font-medium">Analysis in progress…</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Sandbox is detonating the URL. Expected completion in ~30 seconds.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
