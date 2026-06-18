'use client';

import { useState } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { executiveProfiles, exposureFindings } from '@/lib/data';
import { formatRelative, severityVariant, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Briefcase, Mail, Phone, KeyRound, FileText, MapPin, Shield } from 'lucide-react';
import type { ExposureFinding } from '@/lib/types';
import { toast } from 'sonner';

const typeIcon = {
  email: Mail,
  phone: Phone,
  credential: KeyRound,
  document: FileText,
  address: MapPin,
};

export function ExecutiveProtectionModule() {
  const [selectedId, setSelectedId] = useState(executiveProfiles[0].id);
  const selected = executiveProfiles.find((p) => p.id === selectedId)!;
  const findings = exposureFindings.filter((f) => f.profileId === selectedId);

  return (
    <div>
      <ModuleHeader
        title="Executive Protection"
        description="Monitoreo de exposición digital de ejecutivos C-level de Bancolombia, Wenia, Nequi, Wompi, Banco AgroMercantil, Banco Agrícola, Banistmo y Zaswin. Filtraciones en breaches, darkweb, paste sites y registros públicos."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.info('Nuevo perfil ejecutivo', { description: 'Abriendo formulario para agregar ejecutivo…' })}><Plus className="h-3.5 w-3.5 mr-1.5" />Add Executive Profile</Button>
            <Button size="sm" onClick={() => toast.success('Exposure scan iniciado', { description: 'Revisando 9 perfiles contra 14 fuentes OSINT…' })}><Shield className="h-3.5 w-3.5 mr-1.5" />Run Exposure Scan</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile list */}
        <Card className="bg-card/60 lg:col-span-1">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Executive Profiles</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{executiveProfiles.length} monitored</p>
          </div>
          <div className="p-2 space-y-1 max-h-[600px] overflow-y-auto dc-scroll">
            {executiveProfiles.map((p) => {
              const active = p.id === selectedId;
              const riskColor = p.riskScore >= 75 ? 'text-red-400' : p.riskScore >= 50 ? 'text-orange-400' : 'text-emerald-400';
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={classNames(
                    'w-full flex items-center gap-3 p-2.5 rounded-md transition text-left',
                    active ? 'bg-primary/10 border border-primary/30' : 'border border-transparent hover:bg-muted/30'
                  )}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className={classNames('text-xs font-semibold', active ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground')}>
                      {p.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{p.role} · {p.company}</div>
                  </div>
                  <div className="text-right">
                    <div className={classNames('text-sm font-bold dc-mono', riskColor)}>{p.riskScore}</div>
                    <div className="text-[10px] text-muted-foreground">risk</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Profile detail */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card/60 p-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary/20 text-primary text-base font-semibold">
                  {selected.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{selected.name}</h2>
                <p className="text-sm text-muted-foreground">{selected.role} · {selected.company}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" />
                  Last exposure check: {formatRelative(selected.lastCheck)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Risk Score</div>
                <div className={classNames(
                  'text-3xl font-bold dc-mono',
                  selected.riskScore >= 75 ? 'text-red-400' : selected.riskScore >= 50 ? 'text-orange-400' : 'text-emerald-400'
                )}>
                  {selected.riskScore}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: 'Exposed Emails', value: selected.exposedEmails, icon: Mail, accent: 'text-orange-400' },
                { label: 'Exposed Phones', value: selected.exposedPhones, icon: Phone, accent: 'text-yellow-400' },
                { label: 'Leaked Credentials', value: selected.leakedCredentials, icon: KeyRound, accent: 'text-red-400' },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Icon className={classNames('h-3.5 w-3.5', s.accent)} />
                      {s.label}
                    </div>
                    <div className={classNames('text-2xl font-semibold dc-mono mt-1', s.accent)}>{s.value}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <SectionCard
            title="Exposure findings"
            description={`${findings.length} findings across darkweb, paste sites and public sources`}
          >
            <div className="space-y-2">
              {findings.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No exposure findings for this profile.
                </div>
              ) : findings.map((f: ExposureFinding) => {
                const Icon = typeIcon[f.type];
                const sev = severityVariant[f.severity];
                return (
                  <div key={f.id} className="flex items-start gap-3 p-3 rounded-md border border-border bg-muted/20 hover:bg-muted/40 transition">
                    <div className={classNames('h-8 w-8 rounded-md flex items-center justify-center shrink-0', sev.badge)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={classNames('text-[10px] capitalize', sev.badge)}>{f.type}</Badge>
                        <span className="font-mono text-sm">{f.value}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Source: {f.source}</div>
                    </div>
                    <div className="text-right text-[11px] text-muted-foreground shrink-0">
                      {formatRelative(f.detectedAt)}
                    </div>
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
