'use client';

import { useState } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { dorkQueries, dorkResults } from '@/lib/data';
import { formatRelative, severityVariant, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search, Plus, Play, Pause, ExternalLink, Code2, Database, Eye, FileSearch,
} from 'lucide-react';
import { toast } from 'sonner';

const categoryStyles = {
  leaks:         { label: 'Leaks',         badge: 'bg-red-500/15 text-red-400 border-red-500/30', icon: Database },
  exposure:      { label: 'Exposure',      badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30', icon: Eye },
  phishing:      { label: 'Phishing',      badge: 'bg-violet-500/15 text-violet-400 border-violet-500/30', icon: FileSearch },
  infrastructure:{ label: 'Infrastructure',badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30', icon: Code2 },
  custom:        { label: 'Custom',        badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30', icon: Code2 },
};

export function GoogleDorkingModule() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(dorkQueries[0].id);
  const selected = dorkQueries.find((q) => q.id === selectedId)!;
  const results = dorkResults.filter((r) => r.queryId === selectedId);

  return (
    <div>
      <ModuleHeader
        title="Google Dorking"
        description="Búsquedas avanzadas (Google dorks) para detectar credenciales filtradas, archivos expuestos, templates de phishing y debilidades de infraestructura de las 11 marcas."
        actions={<Button size="sm" onClick={() => toast.info('Nueva query', { description: 'Definí categoría y query de Google dork.' })}><Plus className="h-3.5 w-3.5 mr-1.5" />Add Dork Query</Button>}
      />

      {/* New query */}
      <Card className="bg-card/60 mb-6 p-5">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder='site:pastebin.com "yourbrand.com" password'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-10 font-mono text-sm"
            />
          </div>
          <Button className="h-10 px-5" onClick={() => { if (!query) { toast.error('Ingresá una query de Google dork'); return; } toast.success('Dork ejecutado', { description: query.slice(0, 60) + '…' }); }}>
            <Play className="h-4 w-4 mr-1.5" />Run dork
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Tip: use operators like <code className="font-mono text-primary">site:</code>, <code className="font-mono text-primary">intitle:</code>, <code className="font-mono text-primary">filetype:</code>, <code className="font-mono text-primary">inurl:</code>.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Queries list */}
        <Card className="bg-card/60 lg:col-span-1">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Saved dork queries</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{dorkQueries.length} active</p>
          </div>
          <div className="p-2 space-y-1 max-h-[680px] overflow-y-auto dc-scroll">
            {dorkQueries.map((q) => {
              const cat = categoryStyles[q.category];
              const Icon = cat.icon;
              const active = q.id === selectedId;
              return (
                <button
                  key={q.id}
                  onClick={() => setSelectedId(q.id)}
                  className={classNames(
                    'w-full flex items-start gap-3 p-3 rounded-md transition text-left',
                    active ? 'bg-primary/10 border border-primary/30' : 'border border-transparent hover:bg-muted/30'
                  )}
                >
                  <div className={classNames('h-8 w-8 rounded-md flex items-center justify-center shrink-0', cat.badge)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs break-all leading-snug">{q.query}</div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground flex-wrap">
                      <Badge variant="outline" className={classNames('text-[10px] px-1.5 py-0', cat.badge)}>{cat.label}</Badge>
                      <span>{q.results} results</span>
                      {q.status === 'active'
                        ? <span className="flex items-center gap-0.5 text-emerald-400"><span className="h-1 w-1 rounded-full bg-emerald-500" />Active</span>
                        : <span className="flex items-center gap-0.5 text-slate-400"><Pause className="h-2.5 w-2.5" />Paused</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card/60 p-5">
            <div className="flex items-start gap-3">
              <div className={classNames('h-10 w-10 rounded-md flex items-center justify-center shrink-0', categoryStyles[selected.category].badge)}>
                {(() => {
                  const Icon = categoryStyles[selected.category].icon;
                  return <Icon className="h-5 w-5" />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Query</div>
                <code className="text-sm font-mono break-all block mt-0.5">{selected.query}</code>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                  <span>Last run: {formatRelative(selected.lastRun)}</span>
                  <span>·</span>
                  <span>{selected.results} results</span>
                  <Button variant="ghost" size="sm" className="h-6 text-xs ml-auto px-2" onClick={() => toast.success('Re-running dork', { description: selected.query.slice(0, 60) + '…' })}>
                    <Play className="h-3 w-3 mr-1" />Re-run
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <SectionCard
            title="Dorking results"
            description={`${results.length} findings from last run`}
          >
            <div className="space-y-2">
              {results.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No results for this query.
                </div>
              ) : results.map((r) => {
                const sev = severityVariant[r.severity];
                return (
                  <div key={r.id} className="p-3 rounded-md border border-border bg-muted/20 hover:bg-muted/40 transition">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className={classNames('text-[10px] shrink-0', sev.badge)}>
                        <span className={classNames('h-1.5 w-1.5 rounded-full mr-1', sev.dot)} />
                        {sev.label}
                      </Badge>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 group">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium group-hover:text-primary truncate">{r.title}</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono truncate">{r.url}</div>
                        <p className="text-xs mt-1.5 text-muted-foreground line-clamp-2">{r.snippet}</p>
                      </a>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-2">{formatRelative(r.detectedAt)}</div>
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
