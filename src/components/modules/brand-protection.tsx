'use client';

import { useState } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { brandTargets, fakeApps } from '@/lib/data';
import { formatRelative, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Shield, Smartphone, Globe, ShoppingBag, AtSign, AlertTriangle, Download } from 'lucide-react';

const typeIcon = {
  domain: Globe,
  appstore: Smartphone,
  marketplace: ShoppingBag,
  social: AtSign,
};

const statusStyles = {
  active:   { label: 'Active',   badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  inactive: { label: 'Inactive', badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  flagged:  { label: 'Flagged',  badge: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

const fakeStatusStyles = {
  pending:  { label: 'Pending',  badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  reported: { label: 'Reported', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  removed:  { label: 'Removed',  badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
};

export function BrandProtectionModule() {
  const [tab, setTab] = useState('targets');

  const totals = {
    targets: brandTargets.length,
    flagged: brandTargets.filter((t) => t.status === 'flagged').length,
    fakeApps: fakeApps.length,
    pendingApps: fakeApps.filter((a) => a.status === 'pending').length,
  };

  return (
    <div>
      <ModuleHeader
        title="Brand Protection"
        description="Monitor domains, app stores, marketplaces and social media for impersonations of your brands. Detect fake apps, typosquatting and brand abuse in real time."
        actions={
          <>
            <Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />Add Monitoring Target</Button>
            <Button size="sm"><Shield className="h-3.5 w-3.5 mr-1.5" />Run Scan</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Monitored Targets', value: totals.targets, accent: 'text-primary' },
          { label: 'Flagged', value: totals.flagged, accent: 'text-red-400' },
          { label: 'Fake Apps Detected', value: totals.fakeApps, accent: 'text-orange-400' },
          { label: 'Pending Takedown', value: totals.pendingApps, accent: 'text-amber-400' },
        ].map((c) => (
          <Card key={c.label} className="bg-card/60 p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{c.label}</div>
            <div className={classNames('text-2xl font-semibold dc-mono mt-1', c.accent)}>{c.value}</div>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/40">
          <TabsTrigger value="targets">Monitored Targets</TabsTrigger>
          <TabsTrigger value="fake-apps">Fake Apps</TabsTrigger>
        </TabsList>

        {/* Monitored Targets */}
        <TabsContent value="targets" className="mt-4">
          <Card className="bg-card/60 overflow-hidden">
            <div className="overflow-x-auto dc-scroll">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Brand / Target</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Findings</th>
                    <th className="px-4 py-3 font-medium">Last Scan</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {brandTargets.map((t) => {
                    const Icon = typeIcon[t.type];
                    const st = statusStyles[t.status];
                    return (
                      <tr key={t.id} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium text-[13px]">{t.brand}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">{t.target}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs capitalize">{t.type}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={classNames('text-[10px]', st.badge)}>{st.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className={classNames('font-mono text-sm', t.findings > 0 ? 'text-red-400' : 'text-muted-foreground')}>
                            {t.findings}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{formatRelative(t.lastScan)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-xs">Details</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Fake Apps */}
        <TabsContent value="fake-apps" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fakeApps.map((a) => {
              const st = fakeStatusStyles[a.status];
              const scoreColor = a.maliciousScore >= 85 ? 'text-red-400' : a.maliciousScore >= 70 ? 'text-orange-400' : 'text-yellow-400';
              return (
                <Card key={a.id} className="bg-card/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-sm">{a.appName}</div>
                          <div className="text-xs text-muted-foreground">by {a.developer}</div>
                        </div>
                        <Badge variant="outline" className={classNames('text-[10px] shrink-0', st.badge)}>{st.label}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div>
                          <div className="text-muted-foreground">Impersonates</div>
                          <div className="font-medium">{a.impersonated}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Platform</div>
                          <div className="font-medium">{a.platform}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">Malicious Score</div>
                          <div className={classNames('text-lg font-bold dc-mono', scoreColor)}>{a.maliciousScore}</div>
                        </div>
                        <Button variant="outline" size="sm" className="h-7 text-xs">Submit takedown</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
