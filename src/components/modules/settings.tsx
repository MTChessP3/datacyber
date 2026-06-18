'use client';

import { useState } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { apiKeys } from '@/lib/data';
import { formatRelative, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  KeyRound, Plus, Check, X, AlertCircle, Shield, Bell, Mail, Globe,
  Smartphone, MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

const statusStyles = {
  active:       { label: 'Active',       badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500' },
  invalid:      { label: 'Invalid',      badge: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-500' },
  unconfigured: { label: 'Unconfigured', badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30', dot: 'bg-slate-500' },
};

const providerIcon = {
  VirusTotal: Shield,
  AbuseIPDB: Globe,
  Shodan: Globe,
  Censys: Globe,
  MobSF: Smartphone,
  ScreenshotMachine: Globe,
  Telegram: MessageSquare,
  Discord: MessageSquare,
};

export function SettingsModule() {
  const [tab, setTab] = useState('api-keys');
  const [keys, setKeys] = useState(() => apiKeys.map((k) => ({ ...k })));
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftKey, setDraftKey] = useState('');

  function saveKey(id: string) {
    if (!draftKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    setKeys((prev) => prev.map((k) =>
      k.id === id
        ? { ...k, maskedKey: draftKey.slice(0, 4) + '••••••••••••••••' + draftKey.slice(-4), status: 'active' as const, lastUsed: new Date().toISOString() }
        : k
    ));
    setEditingKey(null);
    setDraftKey('');
    toast.success('API key saved', { description: 'Key validated and active' });
  }

  return (
    <div>
      <ModuleHeader
        title="Settings"
        description="Gestión de integraciones de API, preferencias de notificaciones y seguridad de la cuenta."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/40">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* API Keys */}
        <TabsContent value="api-keys" className="mt-4 space-y-4">
          <Card className="bg-card/60 p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <KeyRound className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">API Integration</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                  Connect external threat intelligence providers. DataCyber uses these keys to enrich
                  scans with reputation data, sandbox detonations, screenshots and social media capture.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keys.map((k) => {
              const Icon = providerIcon[k.provider as keyof typeof providerIcon] ?? KeyRound;
              const st = statusStyles[k.status];
              const isEditing = editingKey === k.id;
              return (
                <Card key={k.id} className="bg-card/60 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{k.provider}</div>
                        <div className="text-[11px] text-muted-foreground">{k.label}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={classNames('text-[10px] shrink-0', st.badge)}>
                      <span className={classNames('h-1.5 w-1.5 rounded-full mr-1', st.dot)} />
                      {st.label}
                    </Badge>
                  </div>

                  <div className="mt-3 text-xs">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          type="password"
                          placeholder="Paste your API key"
                          value={draftKey}
                          onChange={(e) => setDraftKey(e.target.value)}
                          className="h-8 font-mono text-xs"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 text-xs flex-1" onClick={() => saveKey(k.id)}>
                            <Check className="h-3 w-3 mr-1" />Save & Validate
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditingKey(null); setDraftKey(''); }}>
                            <X className="h-3 w-3 mr-1" />Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="font-mono text-muted-foreground break-all">{k.maskedKey}</div>
                    )}
                  </div>

                  {!isEditing && (
                    <>
                      {k.quotaUsed !== undefined && k.quotaTotal !== undefined && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                            <span>Quota</span>
                            <span className="font-mono">{k.quotaUsed.toLocaleString()} / {k.quotaTotal.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={classNames('h-full rounded-full',
                                (k.quotaUsed / k.quotaTotal) > 0.9 ? 'bg-red-500' :
                                (k.quotaUsed / k.quotaTotal) > 0.7 ? 'bg-orange-500' : 'bg-primary')}
                              style={{ width: `${(k.quotaUsed / k.quotaTotal) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          Last used: {k.lastUsed === '—' ? 'never' : formatRelative(k.lastUsed)}
                        </span>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditingKey(k.id)}>
                          Change API key
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <SectionCard title="Notification preferences" description="Choose how and when you want to be alerted">
            <div className="space-y-3">
              {[
                { icon: AlertCircle, label: 'Critical threat alerts', desc: 'Immediate notification on critical threats', defaultOn: true },
                { icon: Shield, label: 'Brand impersonation', desc: 'New fake apps, typosquat domains, fake social accounts', defaultOn: true },
                { icon: Bell, label: 'Daily digest', desc: 'Daily summary email at 08:00 local time', defaultOn: true },
                { icon: Mail, label: 'Weekly executive report', desc: 'Weekly PDF report for C-suite every Monday', defaultOn: false },
                { icon: MessageSquare, label: 'Social media alerts', desc: 'Flagged messages on monitored channels', defaultOn: true },
              ].map((n) => {
                const Icon = n.icon;
                return (
                  <div key={n.label} className="flex items-center gap-3 p-3 rounded-md border border-border bg-muted/20">
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{n.label}</div>
                      <div className="text-[11px] text-muted-foreground">{n.desc}</div>
                    </div>
                    <Switch defaultChecked={n.defaultOn} onCheckedChange={(v) => toast.success(`${n.label}: ${v ? 'activado' : 'desactivado'}`)} />
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="Change password" description="Use a strong, unique password">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Current password</Label>
                  <Input type="password" placeholder="••••••••" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">New password</Label>
                  <Input type="password" placeholder="••••••••" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Confirm new password</Label>
                  <Input type="password" placeholder="••••••••" className="h-9" />
                </div>
                <Button className="w-full h-9" onClick={() => toast.success('Password updated')}>
                  Update password
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Two-factor authentication" description="Add an extra layer of security">
              <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-muted/20">
                <div className="h-9 w-9 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Authenticator app</div>
                  <div className="text-[11px] text-muted-foreground">TOTP via Google Authenticator / Authy</div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Enabled</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-muted/20 mt-2">
                <div className="h-9 w-9 rounded-md bg-slate-500/15 text-slate-400 flex items-center justify-center shrink-0">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">SMS backup</div>
                  <div className="text-[11px] text-muted-foreground">+57 ••• ••• 0142</div>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.info('Configurar SMS backup', { description: 'Ingresá tu número para 2FA por SMS.' })}>Configure</Button>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Active sessions</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Bogotá, CO · Chrome</div>
                      <div className="text-muted-foreground">181.46.x.x · current session</div>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Bogotá, CO · Safari iOS</div>
                      <div className="text-muted-foreground">181.46.x.x · 2h ago</div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => toast.success('Sesión revocada', { description: 'Se cerró la sesión en Safari iOS.' })}>Revoke</Button>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
