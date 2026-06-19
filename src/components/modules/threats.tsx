'use client';

import { useState, useEffect, useCallback } from 'react';
import { ModuleHeader } from '@/components/ui-blocks';
import { authFetch } from '@/lib/store';
import { severityVariant, statusVariant, formatRelative, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Search, Download, Loader2 } from 'lucide-react';
import type { Severity, ThreatStatus } from '@/lib/types';
import { toast } from 'sonner';

interface ThreatRow {
  id: string;
  title: string;
  source: string;
  severity: string;
  status: string;
  category: string;
  confidence: number;
  detectedAt: string;
}

export function ThreatsModule() {
  const [search, setSearch] = useState('');
  const [sev, setSev] = useState<Severity | 'all'>('all');
  const [status, setStatus] = useState<ThreatStatus | 'all'>('all');
  const [threats, setThreats] = useState<ThreatRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/threats');
      if (res.ok) setThreats(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = threats.filter((t) => {
    if (sev !== 'all' && t.severity !== sev) return false;
    if (status !== 'all' && t.status !== status) return false;
    if (search && !`${t.title} ${t.source} ${t.category}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function exportCsv() {
    const rows = [
      ['ID', 'Title', 'Source', 'Severity', 'Status', 'Category', 'Confidence', 'Detected'],
      ...filtered.map(t => [t.id, t.title, t.source, t.severity, t.status, t.category, t.confidence, t.detectedAt]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `threats-${Date.now()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exportadas ${filtered.length} amenazas a CSV`);
  }

  return (
    <div>
      <ModuleHeader
        title="Threats"
        description={`${threats.length} amenazas persistidas en base de datos. Filtros y export CSV real.`}
        actions={<Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-3.5 w-3.5 mr-1.5" />Export CSV</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {['critical', 'high', 'medium', 'low'].map(s => {
          const count = threats.filter(t => t.severity === s).length;
          const sev = severityVariant[s as Severity];
          return (
            <Card key={s} className={classNames('p-4', sev.badge)}>
              <div className="text-[11px] uppercase tracking-wider opacity-80">{sev.label}</div>
              <div className="text-3xl font-semibold dc-mono mt-1">{count}</div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-card/60 mb-4 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={sev} onValueChange={(v) => setSev(v as any)}>
          <SelectTrigger className="w-full sm:w-[160px] h-9"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
          <SelectTrigger className="w-full sm:w-[170px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="false_positive">False Positive</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="bg-card/60 overflow-hidden">
        <div className="overflow-x-auto dc-scroll">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Threat</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Confidence</th>
                <th className="px-4 py-3 font-medium">Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr><td colSpan={6} className="px-4 py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No threats match your filters.</td></tr>
              )}
              {filtered.map((t) => {
                const sv = severityVariant[t.severity as Severity] || severityVariant.info;
                const stv = statusVariant[t.status as ThreatStatus] || statusVariant.new;
                return (
                  <tr key={t.id} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <div className={classNames('h-7 w-7 rounded-md flex items-center justify-center shrink-0 mt-0.5', sv.badge)}>
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[13px] leading-snug">{t.title}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 capitalize">{t.category.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.source}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={classNames('text-[10px]', sv.badge)}>
                        <span className={classNames('h-1.5 w-1.5 rounded-full mr-1', sv.dot)} />{sv.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={classNames('text-[10px]', stv.badge)}>{stv.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                          <div className={classNames('h-full rounded-full', t.confidence >= 80 ? 'bg-red-500' : t.confidence >= 60 ? 'bg-orange-500' : 'bg-yellow-500')} style={{ width: `${t.confidence}%` }} />
                        </div>
                        <span className="text-xs font-mono">{t.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatRelative(t.detectedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
          Mostrando {filtered.length} de {threats.length} amenazas
        </div>
      </Card>
    </div>
  );
}
