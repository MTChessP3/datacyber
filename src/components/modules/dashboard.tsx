'use client';

import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis,
  CartesianGrid, PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import {
  AlertTriangle, Activity, Globe, Smartphone, FileText, MessageSquare,
  ScanLine, Radar, Shield, AlertCircle, KeyRound, LogIn, Building2,
} from 'lucide-react';
import { KpiCard, ModuleHeader, SectionCard } from '@/components/ui-blocks';
import {
  dashboardKpis, trendData, threatDistribution, recentActivity,
  threatsByBrand, brands,
} from '@/lib/data';
import { severityVariant, formatRelative, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const kpiIconMap = [
  { icon: AlertTriangle, accent: 'red' as const },
  { icon: AlertCircle, accent: 'orange' as const },
  { icon: Globe, accent: 'emerald' as const },
  { icon: Smartphone, accent: 'violet' as const },
  { icon: FileText, accent: 'primary' as const },
  { icon: MessageSquare, accent: 'sky' as const },
];

const activityIcon = {
  scan: ScanLine,
  alert: AlertTriangle,
  report: FileText,
  monitor: Radar,
  login: LogIn,
  apikey: KeyRound,
};

export function DashboardModule() {
  const setModule = useAppStore((s) => s.setModule);

  const quickActions: { label: string; icon: typeof ScanLine; accent: string; action: () => void }[] = [
    { label: 'Scan URL',      icon: ScanLine, accent: 'text-primary',    action: () => { setModule('url-forensics'); toast.info('Módulo URL Forensics abierto', { description: 'Pegá una URL sospechosa para analizarla.' }); } },
    { label: 'Scan Domain',   icon: Globe,    accent: 'text-emerald-400', action: () => { setModule('domain-analysis'); toast.info('Módulo Domain Analysis abierto'); } },
    { label: 'Scan App',      icon: Smartphone, accent: 'text-violet-400', action: () => { setModule('brand-protection'); toast.info('Brand Protection abierta', { description: 'Revisá la pestaña Fake Apps.' }); } },
    { label: 'Dork Search',   icon: Radar,    accent: 'text-sky-400',    action: () => { setModule('google-dorking'); toast.info('Google Dorking abierto'); } },
    { label: 'Monitor Brand', icon: Shield,   accent: 'text-orange-400', action: () => { setModule('brand-protection'); toast.info('Brand Protection abierta'); } },
    { label: 'Generate Report', icon: FileText, accent: 'text-red-400',  action: () => { setModule('reports'); toast.info('Módulo Reports abierto'); } },
  ];

  return (
    <div>
      <ModuleHeader
        title="Security Dashboard"
        description="Monitoreo de 11 marcas en 4 países (Colombia, Guatemala, El Salvador, Panamá). Amenazas, escaneos y menciones en tiempo real."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success('Modo live activo', { description: 'Refrescando datos cada 30 segundos.' })}>
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              Live
              <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 dc-pulse-critical" />
            </Button>
            <Button size="sm" onClick={() => { setModule('reports'); toast.success('Generando reporte ejecutivo...', { description: 'Se abrirá el módulo de Reports.' }); }}>
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Generate Report
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {dashboardKpis.map((kpi, i) => {
          const meta = kpiIconMap[i];
          return (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value.toLocaleString()}
              delta={kpi.delta}
              hint={kpi.hint}
              icon={meta.icon}
              accent={meta.accent}
            />
          );
        })}
      </div>

      {/* Trend + distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 bg-card/60">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-semibold">Threats · Scans · Mentions (last 30 days)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Aggregated across all monitoring modules</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-chart-2" />Threats</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Scans</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-chart-4" />Mentions</span>
            </div>
          </div>
          <div className="p-3 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.18 165)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.72 0.18 165)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMentions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => d.slice(5)}
                  stroke="oklch(0.65 0.02 220)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="oklch(0.65 0.02 220)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.21 0.025 250)',
                    border: '1px solid oklch(1 0 0 / 0.10)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'oklch(0.96 0.01 220)' }}
                />
                <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} fill="url(#gThreats)" />
                <Area type="monotone" dataKey="scans" stroke="oklch(0.72 0.18 165)" strokeWidth={2} fill="url(#gScans)" />
                <Area type="monotone" dataKey="mentions" stroke="#a855f7" strokeWidth={2} fill="url(#gMentions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-card/60">
          <div className="px-5 pt-4 pb-3 border-b border-border">
            <h3 className="text-sm font-semibold">Threat distribution</h3>
            <p className="text-xs text-muted-foreground mt-0.5">By category, current month</p>
          </div>
          <div className="p-3 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  stroke="none"
                >
                  {threatDistribution.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.21 0.025 250)',
                    border: '1px solid oklch(1 0 0 / 0.10)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {quickActions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              onClick={a.action}
              className="group rounded-lg border border-border bg-card/60 hover:border-primary/40 hover:bg-card transition p-4 flex flex-col items-center gap-2 text-center"
            >
              <div className={classNames('h-10 w-10 rounded-lg bg-muted/40 flex items-center justify-center group-hover:bg-primary/10 transition', a.accent)}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{a.label}</span>
            </button>
          );
        })}
      </div>

      {/* Brands monitored */}
      <Card className="bg-card/60 mb-6">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Brands monitored
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{brands.length} marcas en 4 países</p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setModule('brand-protection')}>Ver todas →</Button>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {brands.map((b) => {
            const statusBadge = b.status === 'flagged'
              ? 'bg-red-500/15 text-red-400 border-red-500/30'
              : b.status === 'active'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-500/15 text-slate-400 border-slate-500/30';
            return (
              <button
                key={b.id}
                onClick={() => { setModule('brand-protection'); toast.info(`Filtrando por ${b.name}`); }}
                className="text-left rounded-lg border border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40 transition p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{b.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">{b.domain}</div>
                  </div>
                  <Badge variant="outline" className={classNames('text-[10px] shrink-0', statusBadge)}>{b.status}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                  <span>{b.country}</span>
                  <span>·</span>
                  <span>{b.type}</span>
                  {b.findings > 0 && (
                    <>
                      <span>·</span>
                      <span className={b.findings >= 5 ? 'text-red-400 font-medium' : 'text-orange-400'}>{b.findings} findings</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Threats by brand bar chart */}
      <Card className="bg-card/60 mb-6">
        <div className="px-5 pt-4 pb-3 border-b border-border">
          <h3 className="text-sm font-semibold">Amenazas por marca (últimos 30 días)</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Distribución de amenazas detectadas por cada marca monitoreada</p>
        </div>
        <div className="p-3 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={threatsByBrand} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis dataKey="brand" stroke="oklch(0.65 0.02 220)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.65 0.02 220)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.21 0.025 250)',
                  border: '1px solid oklch(1 0 0 / 0.10)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                cursor={{ fill: 'oklch(1 0 0 / 0.04)' }}
              />
              <Bar dataKey="threats" radius={[4, 4, 0, 0]}>
                {threatsByBrand.map((entry, idx) => (
                  <Cell key={idx} fill={entry.threats >= 250 ? '#ef4444' : entry.threats >= 150 ? '#f59e0b' : entry.threats >= 50 ? '#fbbf24' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Activity feed + Severity bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          title="Recent activity"
          description="Last events across all modules"
          className="lg:col-span-2"
          action={<Button variant="ghost" size="sm" className="text-xs" onClick={() => { setModule('threats'); toast.info('Módulo Threats abierto'); }}>View all</Button>}
        >
          <div className="space-y-1 max-h-[420px] overflow-y-auto dc-scroll -mx-2">
            {recentActivity.map((a) => {
              const Icon = activityIcon[a.type];
              const sev = severityVariant[a.severity];
              return (
                <button
                  key={a.id}
                  onClick={() => { setModule('threats'); toast.info(`Amenaza abierta: ${a.message.slice(0, 60)}…`); }}
                  className="w-full text-left flex items-start gap-3 px-2 py-2.5 rounded-md hover:bg-muted/40 transition"
                >
                  <div className={classNames('h-7 w-7 rounded-md flex items-center justify-center shrink-0', sev.badge)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{a.message}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground flex-wrap">
                      <span className={classNames('inline-flex items-center gap-1 px-1.5 py-0.5 rounded border', sev.badge)}>
                        <span className={classNames('h-1 w-1 rounded-full', sev.dot)} />
                        {sev.label}
                      </span>
                      <span>·</span>
                      <span className="font-mono">{a.actor}</span>
                      <span>·</span>
                      <span>{formatRelative(a.timestamp)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Critical threats" description="Top by severity (last 7 days)">
          <div className="space-y-3">
            {[
              { label: 'Phishing', count: 412, max: 500, color: 'bg-red-500' },
              { label: 'Brand Abuse', count: 287, max: 500, color: 'bg-orange-500' },
              { label: 'Malware', count: 234, max: 500, color: 'bg-violet-500' },
              { label: 'Data Leak', count: 198, max: 500, color: 'bg-sky-500' },
              { label: 'Domain', count: 153, max: 500, color: 'bg-emerald-500' },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">{s.label}</span>
                  <span className="text-xs font-mono text-muted-foreground">{s.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={classNames('h-full rounded-full', s.color)}
                    style={{ width: `${(s.count / s.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-3 mt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Avg. resolution time</div>
                  <div className="text-xl font-semibold dc-mono mt-1">4h 12m</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">SLA compliance</div>
                  <div className="text-xl font-semibold dc-mono mt-1 text-emerald-400">98.2%</div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
