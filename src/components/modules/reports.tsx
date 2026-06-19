'use client';

import { useState, useEffect, useCallback } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { authFetch, useAppStore } from '@/lib/store';
import { formatDateTime, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Plus, Clock, CheckCircle2, Loader2, FileBarChart, FileCheck, Calendar, FileWarning } from 'lucide-react';
import { toast } from 'sonner';

interface Report {
  id: string;
  title: string;
  template: string;
  period: string;
  status: string;
  size: string | null;
  generatedAt: string;
  content: string | null;
}

const templateIcon: Record<string, any> = {
  executive: FileBarChart,
  technical: FileCheck,
  compliance: FileWarning,
  daily: Calendar,
};

const statusStyles: Record<string, { label: string; badge: string; icon: any }> = {
  ready:      { label: 'Ready',      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  processing: { label: 'Processing', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Loader2 },
  failed:     { label: 'Failed',     badge: 'bg-red-500/15 text-red-400 border-red-500/30', icon: FileWarning },
};

export function ReportsModule() {
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('Executive Summary');
  const [period, setPeriod] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const token = useAppStore((s) => s.token);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/reports');
      if (res.ok) setReports(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const hasProcessing = reports.some(r => r.status === 'processing');
    if (!hasProcessing) return;
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [reports, load]);

  async function generate() {
    if (!title.trim()) {
      toast.error('Ingresá un título para el reporte');
      return;
    }
    setGenerating(true);
    try {
      const res = await authFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ title, template, period: period || 'Custom' }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Error al generar reporte');
        return;
      }
      toast.success('Reporte en generación', { description: `Se está creando "${title}" con datos reales de la DB.` });
      setTitle('');
      setTimeout(load, 500);
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    } finally {
      setGenerating(false);
    }
  }

  function download(r: Report) {
    if (r.status !== 'ready') {
      toast.error('El reporte no está listo aún');
      return;
    }
    // Descarga directa del PDF real
    const url = `/api/reports/${r.id}?download=1`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${r.title.replace(/[^a-z0-9-_]+/gi, '_').toLowerCase()}.pdf`;
    // Para autenticación, fetch + blob
    fetch(url, { headers: { authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then(blob => {
        const u = URL.createObjectURL(blob);
        a.href = u;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(u);
        toast.success('PDF descargado', { description: r.title });
      })
      .catch(e => toast.error('Error: ' + e.message));
  }

  return (
    <div>
      <ModuleHeader
        title="Reports"
        description="Generación de reportes REALES en PDF con datos actuales de la base de datos: marcas, amenazas, ejecutivos y estadísticas. El PDF se descarga al hacer clic en Download."
        actions={<Button size="sm" onClick={() => toast.info('Próximamente: editor de templates')}><Plus className="h-3.5 w-3.5 mr-1.5" />Create Template</Button>}
      />

      <Card className="bg-card/60 mb-6 p-5">
        <h3 className="text-sm font-semibold mb-3">Generar nuevo reporte</h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 space-y-1.5">
            <Label className="text-xs">Título</Label>
            <Input
              placeholder="Executive Summary — Week 26"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="md:col-span-4 space-y-1.5">
            <Label className="text-xs">Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Executive Summary">Executive Summary</SelectItem>
                <SelectItem value="Technical Threat Report">Technical Threat Report</SelectItem>
                <SelectItem value="Compliance Report (ISO 27001)">Compliance Report (ISO 27001)</SelectItem>
                <SelectItem value="Daily Digest">Daily Digest</SelectItem>
                <SelectItem value="Brand Protection Report">Brand Protection Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <Label className="text-xs">Período</Label>
            <Input
              placeholder="2026-06-19"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
        <Button onClick={generate} disabled={generating} className="mt-3 w-full md:w-auto">
          {generating ? (
            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Generando…</>
          ) : (
            <><FileText className="h-3.5 w-3.5 mr-1.5" />Generate Report</>
          )}
        </Button>
      </Card>

      <SectionCard title="Reportes generados" description={`${reports.length} en base de datos`}>
        <div className="space-y-2">
          {reports.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No hay reportes todavía. Generá el primero arriba.
            </div>
          )}
          {reports.map((r) => {
            const st = statusStyles[r.status] || statusStyles.processing;
            const StIcon = st.icon;
            return (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-md border border-border bg-muted/20 hover:bg-muted/40 transition">
                <div className={classNames('h-10 w-10 rounded-md flex items-center justify-center shrink-0', st.badge)}>
                  <StIcon className={classNames('h-5 w-5', r.status === 'processing' && 'animate-spin')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {r.template} · {r.period}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="outline" className={classNames('text-[10px]', st.badge)}>{st.label}</Badge>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {r.status === 'ready' ? `${r.size} · ${formatDateTime(r.generatedAt)}` : formatDateTime(r.generatedAt)}
                  </div>
                </div>
                {r.status === 'ready' && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => download(r)}>
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
