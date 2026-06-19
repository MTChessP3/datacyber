'use client';

import { useState, useEffect, useCallback } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { authFetch } from '@/lib/store';
import { formatRelative, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { KeyRound, Check, X, Shield, Bell, Mail, Globe, Smartphone, MessageSquare, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  provider: string;
  label: string;
  maskedKey: string;
  status: string;
  lastUsed: string | null;
  quotaUsed: number | null;
  quotaTotal: number | null;
}

const statusStyles: Record<string, { label: string; badge: string; dot: string }> = {
  active:       { label: 'Active',       badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500' },
  invalid:      { label: 'Invalid',      badge: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-500' },
  unconfigured: { label: 'Unconfigured', badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30', dot: 'bg-slate-500' },
};

export function SettingsModule() {
  const [tab, setTab] = useState('api-keys');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftKey, setDraftKey] = useState('');
  const [newProvider, setNewProvider] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newKey, setNewKey] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/apikeys');
      if (res.ok) setKeys(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveKey(id: string) {
    if (!draftKey.trim()) {
      toast.error('Ingresá una API key válida');
      return;
    }
    try {
      const k = keys.find(x => x.id === id);
      const res = await authFetch('/api/apikeys', {
        method: 'POST',
        body: JSON.stringify({ id, provider: k?.provider, label: k?.label, apiKey: draftKey }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Error al guardar');
        return;
      }
      toast.success('API key guardada', { description: `${k?.provider} validada y activada` });
      setEditingKey(null);
      setDraftKey('');
      load();
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  }

  async function addNewKey() {
    if (!newProvider || !newKey) {
      toast.error('Provider y API key son obligatorios');
      return;
    }
    try {
      const res = await authFetch('/api/apikeys', {
        method: 'POST',
        body: JSON.stringify({ provider: newProvider, label: newLabel || newProvider, apiKey: newKey }),
      });
      if (!res.ok) {
        toast.error('Error al agregar');
        return;
      }
      toast.success('API key agregada', { description: newProvider });
      setNewProvider(''); setNewLabel(''); setNewKey('');
      load();
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  }

  async function deleteKey(id: string) {
    if (!confirm('¿Eliminar esta API key?')) return;
    try {
      await authFetch(`/api/apikeys/${id}`, { method: 'DELETE' });
      toast.success('API key eliminada');
      load();
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  }

  return (
    <div>
      <ModuleHeader title="Settings" description="API keys persistidas en base de datos. Cambios reales entre sesiones." />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/40">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="mt-4 space-y-4">
          {/* Agregar nueva key */}
          <Card className="bg-card/60 p-4">
            <h3 className="text-sm font-semibold mb-3">Agregar nueva API key</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              <Input placeholder="Provider (ej: VirusTotal)" value={newProvider} onChange={(e) => setNewProvider(e.target.value)} className="md:col-span-3 h-9" />
              <Input placeholder="Label (opcional)" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="md:col-span-3 h-9" />
              <Input type="password" placeholder="API key" value={newKey} onChange={(e) => setNewKey(e.target.value)} className="md:col-span-4 h-9 font-mono" />
              <Button onClick={addNewKey} className="md:col-span-2 h-9"><KeyRound className="h-3.5 w-3.5 mr-1.5" />Add</Button>
            </div>
          </Card>

          {/* Lista de keys */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">API keys configuradas ({keys.length})</h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Refresh'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keys.length === 0 && (
              <div className="col-span-full text-center py-8 text-sm text-muted-foreground">
                No hay API keys. Agregá la primera arriba.
              </div>
            )}
            {keys.map((k) => {
              const st = statusStyles[k.status] || statusStyles.unconfigured;
              const isEditing = editingKey === k.id;
              return (
                <Card key={k.id} className="bg-card/60 p-4 group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
                        <KeyRound className="h-4 w-4" />
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
                          placeholder="Pegá tu API key"
                          value={draftKey}
                          onChange={(e) => setDraftKey(e.target.value)}
                          className="h-8 font-mono text-xs"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 text-xs flex-1" onClick={() => saveKey(k.id)}>
                            <Check className="h-3 w-3 mr-1" />Guardar
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditingKey(null); setDraftKey(''); }}>
                            <X className="h-3 w-3 mr-1" />Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="font-mono text-muted-foreground break-all">{k.maskedKey}</div>
                    )}
                  </div>

                  {!isEditing && (
                    <>
                      {k.quotaUsed !== null && k.quotaTotal !== null && (
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
                          Last used: {k.lastUsed ? formatRelative(k.lastUsed) : 'nunca'}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditingKey(k.id)}>
                            Change API key
                          </Button>
                          <button onClick={() => deleteKey(k.id)} className="opacity-0 group-hover:opacity-100 transition h-7 w-7 flex items-center justify-center text-red-400 hover:text-red-300">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <SectionCard title="Notification preferences" description="Configuración local en el navegador (no persistida)">
            <div className="space-y-3">
              {[
                { icon: AlertTriangle, label: 'Critical threat alerts', desc: 'Notificación inmediata en amenazas críticas', defaultOn: true },
                { icon: Shield, label: 'Brand impersonation', desc: 'Apps falsas, typosquat, cuentas falsas', defaultOn: true },
                { icon: Bell, label: 'Daily digest', desc: 'Email diario a las 08:00', defaultOn: true },
                { icon: Mail, label: 'Weekly executive report', desc: 'PDF semanal para C-suite', defaultOn: false },
                { icon: MessageSquare, label: 'Social media alerts', desc: 'Mensajes flaggeados en canales monitoreados', defaultOn: true },
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

        <TabsContent value="security" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="Change password" description="Cambio real de contraseña (POST /api/auth pendiente)">
              <div className="space-y-3">
                <div className="space-y-1.5"><Label className="text-xs">Current password</Label><Input type="password" className="h-9" /></div>
                <div className="space-y-1.5"><Label className="text-xs">New password</Label><Input type="password" className="h-9" /></div>
                <div className="space-y-1.5"><Label className="text-xs">Confirm</Label><Input type="password" className="h-9" /></div>
                <Button className="w-full h-9" onClick={() => toast.info('Próximamente: endpoint /api/auth/password')}>Update password</Button>
              </div>
            </SectionCard>

            <SectionCard title="Two-factor authentication" description="2FA estado">
              <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-muted/20">
                <div className="h-9 w-9 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0"><Shield className="h-4 w-4" /></div>
                <div className="flex-1"><div className="text-sm font-medium">Authenticator app</div><div className="text-[11px] text-muted-foreground">TOTP via Google Authenticator</div></div>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Enabled</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-muted/20 mt-2">
                <div className="h-9 w-9 rounded-md bg-slate-500/15 text-slate-400 flex items-center justify-center shrink-0"><Smartphone className="h-4 w-4" /></div>
                <div className="flex-1"><div className="text-sm font-medium">SMS backup</div><div className="text-[11px] text-muted-foreground">+57 ••• ••• 0142</div></div>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.info('Configurar SMS')}>Configure</Button>
              </div>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
