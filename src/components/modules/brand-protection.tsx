'use client';

import { useState, useEffect, useCallback } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { authFetch } from '@/lib/store';
import { classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Shield, Smartphone, Globe, ShoppingBag, AtSign, AlertTriangle, Trash2, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface Brand {
  id: string;
  name: string;
  country: string;
  type: string;
  domain: string;
  status: string;
  findings: number;
}

const typeIcon: Record<string, any> = { domain: Globe, appstore: Smartphone, marketplace: ShoppingBag, social: AtSign };
const statusStyles: Record<string, { label: string; badge: string }> = {
  active:   { label: 'Active',   badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  flagged:  { label: 'Flagged',  badge: 'bg-red-500/15 text-red-400 border-red-500/30' },
  inactive: { label: 'Inactive', badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

export function BrandProtectionModule() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', country: 'Colombia', type: 'Bank', domain: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/brands');
      if (res.ok) setBrands(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addBrand() {
    if (!form.name || !form.domain) {
      toast.error('Name y domain son obligatorios');
      return;
    }
    try {
      const res = await authFetch('/api/brands', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Error al agregar marca');
        return;
      }
      toast.success('Marca agregada', { description: `${form.name} (${form.country})` });
      setForm({ name: '', country: 'Colombia', type: 'Bank', domain: '' });
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  }

  async function deleteBrand(b: Brand) {
    if (!confirm(`¿Eliminar la marca "${b.name}"? Esta acción es irreversible.`)) return;
    try {
      const res = await authFetch(`/api/brands/${b.id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Error al eliminar');
        return;
      }
      toast.success('Marca eliminada', { description: b.name });
      load();
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  }

  const totals = {
    brands: brands.length,
    flagged: brands.filter(b => b.status === 'flagged').length,
    findings: brands.reduce((a, b) => a + b.findings, 0),
    countries: new Set(brands.map(b => b.country)).size,
  };

  return (
    <div>
      <ModuleHeader
        title="Brand Protection"
        description="Gestión REAL de marcas monitoreadas. Alta/baja persistente en base de datos. Cuando agregás o eliminás una marca, queda guardada entre sesiones."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />Add Brand</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar marca para monitorear</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nombre *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Nequi" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">País</Label>
                    <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Colombia">Colombia</SelectItem>
                        <SelectItem value="Guatemala">Guatemala</SelectItem>
                        <SelectItem value="El Salvador">El Salvador</SelectItem>
                        <SelectItem value="Panamá">Panamá</SelectItem>
                        <SelectItem value="México">México</SelectItem>
                        <SelectItem value="Argentina">Argentina</SelectItem>
                        <SelectItem value="Brasil">Brasil</SelectItem>
                        <SelectItem value="Perú">Perú</SelectItem>
                        <SelectItem value="Chile">Chile</SelectItem>
                        <SelectItem value="Ecuador">Ecuador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tipo</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank">Bank</SelectItem>
                        <SelectItem value="Fintech">Fintech</SelectItem>
                        <SelectItem value="Services">Services</SelectItem>
                        <SelectItem value="Crypto">Crypto</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Telco">Telco</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Dominio principal *</Label>
                  <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="example.com" className="font-mono" />
                </div>
                <Button onClick={addBrand} className="w-full">
                  <Shield className="h-3.5 w-3.5 mr-1.5" />Agregar y empezar a monitorear
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Marcas monitoreadas', value: totals.brands, accent: 'text-primary' },
          { label: 'Flagged', value: totals.flagged, accent: 'text-red-400' },
          { label: 'Hallazgos totales', value: totals.findings, accent: 'text-orange-400' },
          { label: 'Países', value: totals.countries, accent: 'text-sky-400' },
        ].map((c) => (
          <Card key={c.label} className="bg-card/60 p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{c.label}</div>
            <div className={classNames('text-2xl font-semibold dc-mono mt-1', c.accent)}>{c.value}</div>
          </Card>
        ))}
      </div>

      <Card className="bg-card/60">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />Marcas en base de datos</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{brands.length} marcas persistidas en SQLite</p>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {brands.length === 0 && (
            <div className="col-span-full text-center py-12 text-sm text-muted-foreground">
              No hay marcas cargadas. Hacé clic en "Add Brand" para agregar la primera.
            </div>
          )}
          {brands.map((b) => {
            const st = statusStyles[b.status] || statusStyles.active;
            return (
              <div key={b.id} className="rounded-lg border border-border bg-muted/20 hover:border-primary/40 transition p-3 group">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{b.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">{b.domain}</div>
                  </div>
                  <Badge variant="outline" className={classNames('text-[10px] shrink-0', st.badge)}>{b.status}</Badge>
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
                <button
                  onClick={() => deleteBrand(b)}
                  className="opacity-0 group-hover:opacity-100 transition mt-2 text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />Eliminar
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
