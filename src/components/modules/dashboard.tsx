'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import {
  AlertTriangle, Activity, Globe, Smartphone, FileText, ScanLine,
  Radar, Shield, AlertCircle, Building2, Loader2,
} from 'lucide-react';
import { KpiCard, ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { useAppStore } from '@/lib/store';
import { loadDb } from '@/lib/local-db';
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

const trendData = [
  { date: '2026-05-19', threats: 142, scans: 268, mentions: 412 },
  { date: '2026-05-22', threats: 168, scans: 298, mentions: 487 },
  { date: '2026-05-25', threats: 151, scans: 281, mentions: 451 },
  { date: '2026-05-28', threats: 198, scans: 342, mentions: 567 },
  { date: '2026-05-31', threats: 178, scans: 312, mentions: 521 },
  { date: '2026-06-03', threats: 214, scans: 367, mentions: 612 },
  { date: '2026-06-06', threats: 198, scans: 354, mentions: 587 },
  { date: '2026-06-09', threats: 234, scans: 398, mentions: 678 },
  { date: '2026-06-12', threats: 221, scans: 381, mentions: 645 },
  { date: '2026-06-15', threats: 267, scans: 421, mentions: 712 },
  { date: '2026-06-18', threats: 248, scans: 405, mentions: 689 },
];

export function DashboardModule() {
  const setModule = useAppStore((s) => s.setModule);
  const [data, setData] = useState<ReturnType<typeof loadDb> | null>(null);

  useEffect(() => { setData(loadDb()); }, []);

  if (!data) return <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const k = {
    totalThreats: data.threats.length,
    criticalAlerts: data.threats.filter(t => t.severity === 'critical').length,
    brandsMonitored: data.brands.length,
    flaggedBrands: data.brands.filter(b => b.status === 'flagged').length,
    totalScans: data.urlScans.length + data.domainScans.length,
    reportsGenerated: data.reports.length,
  };

  const quickActions = [
    { label: 'Scan URL',      icon: ScanLine,   accent: 'text-primary',     action: () => setModule('url-forensics') },
    { label: 'Scan Domain',   icon: Globe,      accent: 'text-emerald-400', action: () => setModule('domain-analysis') },
    { label: 'Scan App',      icon: Smartphone, accent: 'text-violet-400',  action: () => setModule('brand-protection') },
    { label: 'Dork Search',   icon: Radar,      accent: 'text-sky-400',     action: () => setModule('google-dorking') },
    { label: 'Monitor Brand', icon: Shield,     accent: 'text-orange-400',  action: () => setModule('brand-protection') },
    { label: 'Generate Report', icon: FileText, accent: 'text-red-400',     action: () => setModule('reports') },
  ];

  return (
    <div>
      <ModuleHeader
        title="Security Dashboard"
        description={`Monitoreo de ${k.brandsMonitored} marcas. Datos persistidos en tu navegador (localStorage).`}
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
        <KpiCard label="Total Threats" value={k.totalThreats} delta={12} icon={AlertTriangle} accent="red" />
        <KpiCard label="Critical Alerts" value={k.criticalAlerts} delta={-8} icon={AlertCircle} accent="orange" />
        <KpiCard label="Brands Monitored" value={k.brandsMonitored} delta={0} icon={Globe} accent="emerald" />
        <KpiCard label="Flagged Brands" value={k.flaggedBrands} delta={0} icon={Shield} accent="violet" />
        <KpiCard label="URL Scans" value={k.totalScans} delta={0} icon={ScanLine} accent="primary" />
        <KpiCard label="Reports" value={k.reportsGenerated} delta={0} icon={FileText} accent="sky" />
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

      <Card className="bg-card/60 mb-6">
        <div className="px-5 pt-4 pb-3 border-b border-border">
          <h3 className="text-sm font-semibold">Tendencia (30 días)</h3>
        </div>
        <div className="p-3 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.72 0.18 165)" stopOpacity={0.35} /><stop offset="100%" stopColor="oklch(0.72 0.18 165)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} stroke="oklch(0.65 0.02 220)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.65 0.02 220)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'oklch(0.21 0.025 250)', border: '1px solid oklch(1 0 0 / 0.10)', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} fill="url(#gT)" />
              <Area type="monotone" dataKey="scans" stroke="oklch(0.72 0.18 165)" strokeWidth={2} fill="url(#gS)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Recent activity" description="Eventos en localStorage" className="lg:col-span-2">
          <div className="space-y-1 max-h-[400px] overflow-y-auto dc-scroll -mx-2">
            {data.activity.slice(0, 10).map((a) => {
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
        </SectionCard>

        <SectionCard title="Threat distribution" description="Por categoría">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={threatDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2} stroke="none">
                  {threatDistribution.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'oklch(0.21 0.025 250)', border: '1px solid oklch(1 0 0 / 0.10)', borderRadius: '8px', fontSize: '12px' }} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
