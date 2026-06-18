'use client';

import { useState } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { domainRecords } from '@/lib/data';
import { formatRelative, severityVariant, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Search, Shield, Server, FileLock2, Network, CalendarDays, Building2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export function DomainAnalysisModule() {
  const [selectedId, setSelectedId] = useState(domainRecords[0].id);
  const [query, setQuery] = useState('');
  const selected = domainRecords.find((d) => d.id === selectedId)!;

  return (
    <div>
      <ModuleHeader
        title="Domain Analysis"
        description="Deep DNS, WHOIS, subdomain enumeration, open port scanning and security header inspection for any domain."
        actions={<Button size="sm"><Globe className="h-3.5 w-3.5 mr-1.5" />Scan New Domain</Button>}
      />

      {/* Search */}
      <Card className="bg-card/60 mb-6 p-5">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="example.com"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-10 font-mono"
            />
          </div>
          <Button className="h-10 px-5">
            <Network className="h-4 w-4 mr-1.5" />Run full scan
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Domains list */}
        <Card className="bg-card/60 lg:col-span-1">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Scanned Domains</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{domainRecords.length} total</p>
          </div>
          <div className="p-2 space-y-1 max-h-[680px] overflow-y-auto dc-scroll">
            {domainRecords.map((d) => {
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
                    d.reputation >= 70 ? 'bg-emerald-500/15 text-emerald-400' :
                    d.reputation >= 40 ? 'bg-orange-500/15 text-orange-400' : 'bg-red-500/15 text-red-400')}>
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium font-mono truncate">{d.domain}</div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span>Reputation: <span className={classNames('font-mono font-semibold',
                        d.reputation >= 70 ? 'text-emerald-400' : d.reputation >= 40 ? 'text-orange-400' : 'text-red-400')}>
                        {d.reputation}/100
                      </span></span>
                      <span>·</span>
                      <span>{d.subdomains.length} subdomains</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Domain detail */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card/60 p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3 min-w-0">
                <Globe className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold font-mono break-all">{selected.domain}</h2>
                  <div className="text-xs text-muted-foreground mt-1">Last scan: {formatRelative(selected.lastScan)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Reputation</div>
                <div className={classNames('text-2xl font-bold dc-mono',
                  selected.reputation >= 70 ? 'text-emerald-400' : selected.reputation >= 40 ? 'text-orange-400' : 'text-red-400')}>
                  {selected.reputation}
                </div>
              </div>
            </div>

            {/* WHOIS */}
            <div className="mt-5 pt-5 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <FileLock2 className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold">WHOIS</h4>
                {selected.dnsSec ? (
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                    DNSSEC enabled
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] bg-red-500/15 text-red-400 border-red-500/30">
                    DNSSEC disabled
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Registrar:</span> {selected.registrar}</div>
                <div className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Registered:</span> {selected.registered}</div>
                <div className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Expires:</span> {selected.expires}</div>
              </div>
            </div>
          </Card>

          {/* Open ports + subdomains */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="Open ports" description={`${selected.openPorts.length} detected`}>
              <div className="space-y-2">
                {selected.openPorts.map((p) => {
                  const sv = severityVariant[p.risk];
                  return (
                    <div key={p.port} className="flex items-center justify-between gap-2 p-2.5 rounded-md border border-border bg-muted/20">
                      <div className="flex items-center gap-2.5">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">:{p.port}</span>
                        <span className="text-xs text-muted-foreground">{p.service}</span>
                      </div>
                      <Badge variant="outline" className={classNames('text-[10px]', sv.badge)}>{sv.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard title="Subdomains" description={`${selected.subdomains.length} found`}>
              {selected.subdomains.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">No subdomains found</div>
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

          {/* Security headers */}
          <SectionCard title="Security headers" description="HTTP response header audit">
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
                      h.status === 'warn' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/15 text-red-400 border-red-500/30')}>
                      {h.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
