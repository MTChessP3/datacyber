'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis,
  CartesianGrid, PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import {
  AlertTriangle, Activity, Globe, Smartphone, FileText, MessageSquare,
  ScanLine, Radar, Shield, AlertCircle, KeyRound, LogIn, Building2, Loader2,
} from 'lucide-react';
import { KpiCard, ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { authFetch, useAppStore } from '@/lib/store';
import { severityVariant, formatRelative, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const threatDistribution = [
  { name: 'Phishing', value: 612, color: '#ef4444' },
  { name: 'Brand Abuse', value: 487, color: '#f59e0b' },
  { name: 'Malware', value: 334, color: '#a855f7' },
  { name: 'Data Leak', value: 258, color: '#06b6d4' },
  { name: 'Domain', value: 151, color: '#10b981' },
];

export function DashboardModule() {
  const setModule = useAppStore((s) => s.setModule);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/dashboard').then(async (r) => {
      if (r.ok) setData(await r.json());
      setLoading(false);
    });
  }, []);

  const k = data?.kpis;
  const activity = data?.activity || [];
  const recentThreats = data?.recentThreats || [];

  const quickActions: { label: string; icon: typeof ScanLine; accent: string; action: () => void }[] = [
    { label: 'Scan URL',      icon: ScanLine, accent: 'text-primary',    action: () => setModule('url-forensics') },
    { label: 'Scan Domain',   icon: Globe,    accent: 'text-emerald-400', action: () => setModule('domain-analysis') },
    { label: 'Scan App',      icon: Smartphone, accent: 'text-violet-400', action: () => setModule('brand-protection') },
    { label: 'Dork Search',   icon: Radar,    accent: 'text-sky-400',    action: () => setModule('google-dorking') },
    { label: 'Monitor Brand', icon: Shield,   accent: 'text-orange-400', action: () => setModule('brand-protection') },
    { label: 'Generate Report', icon: FileText, accent: 'text-red-400',  action: () => setModule('reports') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <ModuleHeader
        title="Security Dashboard"
        description={`Monitoreo de ${k?.brandsMonitored || 0} marcas. KPIs reales desde base de datos SQLite.`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success('Modo live activo')}>
              <Activity className="h-3.5 w-3.5 mr-1.5" />Live
              <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 dc-pulse-critical" />
            </Button>
            <Button size="sm" onClick={() => setModule('reports')}><FileText className="h-3.5 w-3.5 mr-1.5" />Generate Report</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total Threats', value: k?.totalThreats || 0, delta: 12, icon: AlertTriangle, accent: 'red' as const },
          { label: 'Critical Alerts', value: k?.criticalAlerts || 0, delta: -8, icon: AlertCircle, accent: 'orange' as const },
          { label: 'Brands Monitored', value: k?.brandsMonitored || 0, delta: 0, icon: Globe, accent: 'emerald' as const },
          { label: 'Flagged Brands', value: k?.flaggedBrands || 0, delta: 0, icon: Shield, accent: 'violet' as const },
          { label: 'URL Scans', value: k?.totalScans || 0, delta: 0, icon: ScanLine, accent: 'primary' as const },
          { label: 'Reports', value: k?.reportsGenerated || 0, delta: 0, icon: FileText, accent: 'sky' as const },
        ].map((c) => (
          <KpiCard key={c.label} label={c.label} value={c.value} delta={c.delta} icon={c.icon} accent={c.accent} />
        ))}
      </div>

      <Card className="bg-card/60 mb-6">
        <div className="px-5 pt-4 pb-3 border-b border-border">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button key={a.label} onClick={a.action} className="group rounded-lg border border-border bg-card/60 hover:border-primary/40 hover:bg-card transition p-4 flex flex-col items-center gap-2 text-center">
                <div className={classNames('h-10 w-10 rounded-lg bg-muted/40 flex items-center justify-center group-hover:bg-primary/10 transition', a.accent)}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{a.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Recent activity (DB)" description="Eventos persistidos en ActivityLog" className="lg:col-span-2">
          {activity.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No hay actividad registrada</div>
          ) : (
            <div className="space-y-1 max-h-[400px] overflow-y-auto dc-scroll -mx-2">
              {activity.map((a: any) => {
                const sev = severityVariant[a.severity as keyof typeof severityVariant] || severityVariant.info;
                return (
                  <div key={a.id} className="flex items-start gap-3 px-2 py-2.5 rounded-md hover:bg-muted/30 transition">
                    <div className={classNames('h-7 w-7 rounded-md flex items-center justify-center shrink-0', sev.badge)}>
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{a.message}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground flex-wrap">
                        <span className={classNames('inline-flex items-center gap-1 px-1.5 py-0.5 rounded border', sev.badge)}>
                          <span className={classNames('h-1 w-1 rounded-full', sev.dot)} />{sev.label}
                        </span>
                        <span>·</span><span className="font-mono">{a.actor}</span>
                        <span>·</span><span>{formatRelative(a.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent threats" description="Últimas amenazas desde DB">
          {recentThreats.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">Sin amenazas</div>
          ) : (
            <div className="space-y-2">
              {recentThreats.map((t: any) => {
                const sev = severityVariant[t.severity as keyof typeof severityVariant] || severityVariant.info;
                return (
                  <div key={t.id} className="p-2 rounded-md border border-border bg-muted/20">
                    <div className="flex items-start gap-2">
                      <span className={classNames('h-1.5 w-1.5 rounded-full mt-1.5 shrink-0', sev.dot)} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs leading-snug">{t.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{t.source}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
