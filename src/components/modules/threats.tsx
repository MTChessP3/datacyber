'use client';

import { useState, useMemo } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { threats } from '@/lib/data';
import { severityVariant, statusVariant, formatRelative, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Filter, Search, Download, ShieldOff } from 'lucide-react';
import type { Severity, ThreatStatus } from '@/lib/types';

export function ThreatsModule() {
  const [search, setSearch] = useState('');
  const [sev, setSev] = useState<Severity | 'all'>('all');
  const [status, setStatus] = useState<ThreatStatus | 'all'>('all');

  const filtered = useMemo(() => {
    return threats.filter((t) => {
      if (sev !== 'all' && t.severity !== sev) return false;
      if (status !== 'all' && t.status !== status) return false;
      if (search && !`${t.title} ${t.source} ${t.category}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, sev, status]);

  const counts = useMemo(() => ({
    critical: threats.filter((t) => t.severity === 'critical').length,
    high: threats.filter((t) => t.severity === 'high').length,
    medium: threats.filter((t) => t.severity === 'medium').length,
    low: threats.filter((t) => t.severity === 'low').length,
    new: threats.filter((t) => t.status === 'new').length,
    investigating: threats.filter((t) => t.status === 'investigating').length,
    resolved: threats.filter((t) => t.status === 'resolved').length,
    false_positive: threats.filter((t) => t.status === 'false_positive').length,
  }), []);

  return (
    <div>
      <ModuleHeader
        title="Threats"
        description="All detected threats across brand protection, executive exposure, social monitoring, URL forensics, domain analysis and dorking."
        actions={
          <>
            <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5 mr-1.5" />Export CSV</Button>
            <Button size="sm"><ShieldOff className="h-3.5 w-3.5 mr-1.5" />Bulk triage</Button>
          </>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Critical', value: counts.critical, accent: 'border-red-500/30 bg-red-500/5 text-red-400' },
          { label: 'High', value: counts.high, accent: 'border-orange-500/30 bg-orange-500/5 text-orange-400' },
          { label: 'New', value: counts.new, accent: 'border-amber-500/30 bg-amber-500/5 text-amber-400' },
          { label: 'Resolved', value: counts.resolved, accent: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' },
        ].map((c) => (
          <Card key={c.label} className={classNames('p-4', c.accent)}>
            <div className="text-[11px] uppercase tracking-wider opacity-80">{c.label}</div>
            <div className="text-3xl font-semibold dc-mono mt-1">{c.value}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-card/60 mb-4">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, source or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={sev} onValueChange={(v) => setSev(v as any)}>
            <SelectTrigger className="w-full sm:w-[160px] h-9">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className="w-full sm:w-[170px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="false_positive">False Positive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Threats list */}
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
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t) => {
                const sv = severityVariant[t.severity];
                const stv = statusVariant[t.status];
                return (
                  <tr key={t.id} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <div className={classNames('h-7 w-7 rounded-md flex items-center justify-center shrink-0 mt-0.5', sv.badge)}>
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[13px] leading-snug">{t.title}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                            {t.category.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.source}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={classNames('text-[10px] font-medium', sv.badge)}>
                        <span className={classNames('h-1.5 w-1.5 rounded-full mr-1', sv.dot)} />
                        {sv.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={classNames('text-[10px] font-medium', stv.badge)}>
                        {stv.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                          <div
                            className={classNames('h-full rounded-full', t.confidence >= 80 ? 'bg-red-500' : t.confidence >= 60 ? 'bg-orange-500' : 'bg-yellow-500')}
                            style={{ width: `${t.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono">{t.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatRelative(t.detectedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">Investigate</Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No threats match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {threats.length} threats</span>
          <Button variant="ghost" size="sm" className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1" />
            Export
          </Button>
        </div>
      </Card>
    </div>
  );
}
