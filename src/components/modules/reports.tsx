'use client';

import { useState, useEffect, useCallback } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { useAppStore } from '@/lib/store';
import { loadDb, saveDb, genId } from '@/lib/local-db';
import { formatDateTime, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Plus, Clock, CheckCircle2, Loader2, FileBarChart, FileCheck, Calendar, FileWarning } from 'lucide-react';
import { toast } from 'sonner';
import type { Report } from '@/lib/types';

const templateIcon: Record<string, any> = {
  executive: FileBarChart, technical: FileCheck, compliance: FileWarning, daily: Calendar,
};

export function ReportsModule() {
  const user = useAppStore((s) => s.user);
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('Executive Summary');
  const [period, setPeriod] = useState('');
  const [reports, setReports] = useState<Report[]>([]);

  const load = useCallback(() => {
    const db = loadDb();
    setReports([...db.reports].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt)));
  }, []);

  useEffect(() => { load(); }, [load]);

  function generate() {
    if (!title.trim()) {
      toast.error('Ingresá un título para el reporte');
      return;
    }
    // Crear reporte en estado processing
    const newReport: Report = {
      id: genId('g'),
      title,
      template,
      period: period || 'Custom',
      generatedAt: new Date().toISOString(),
      status: 'processing',
      size: '—',
    };
    const db = loadDb();
    db.reports.unshift(newReport);
    saveDb(db);
    load();
    toast.success('Generando reporte…', { description: title });

    // Generar PDF asíncrono
    setTimeout(() => {
      const db2 = loadDb();
      const idx = db2.reports.findIndex(r => r.id === newReport.id);
      if (idx >= 0) {
        const pdf = buildPdf(title, template, period || 'Custom', db2);
        db2.reports[idx] = {
          ...db2.reports[idx],
          status: 'ready',
          size: `${(pdf.length / 1024).toFixed(1)} KB`,
        };
        db2.activity.unshift({
          id: genId('a'),
          type: 'report',
          message: `Reporte generado: ${title}`,
          severity: 'info',
          actor: user?.username || 'system',
          timestamp: new Date().toISOString(),
        });
        saveDb(db2);
        load();
        toast.success('Reporte listo', { description: `${title} — ${db2.reports[idx].size}` });
      }
    }, 2500);
  }

  function download(r: Report) {
    if (r.status !== 'ready') {
      toast.error('El reporte no está listo aún');
      return;
    }
    const db = loadDb();
    const pdf = buildPdf(r.title, r.template, r.period, db);
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${r.title.replace(/[^a-z0-9-_]+/gi, '_').toLowerCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('PDF descargado', { description: r.title });
  }

  const statusStyles: Record<string, { label: string; badge: string; icon: any }> = {
    ready:      { label: 'Ready',      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
    processing: { label: 'Processing', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Loader2 },
    failed:     { label: 'Failed',     badge: 'bg-red-500/15 text-red-400 border-red-500/30', icon: FileWarning },
  };

  return (
    <div>
      <ModuleHeader
        title="Reports"
        description="Generación de reportes REALES en PDF con datos actuales de localStorage. El PDF se descarga al hacer clic en Download."
        actions={<Button size="sm" onClick={() => toast.info('Editor de templates próximamente')}><Plus className="h-3.5 w-3.5 mr-1.5" />Create Template</Button>}
      />

      <Card className="bg-card/60 mb-6 p-5">
        <h3 className="text-sm font-semibold mb-3">Generar nuevo reporte</h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 space-y-1.5">
            <Label className="text-xs">Título</Label>
            <Input placeholder="Executive Summary — Week 26" value={title} onChange={(e) => setTitle(e.target.value)} className="h-9" />
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
            <Input placeholder="2026-06-19" value={period} onChange={(e) => setPeriod(e.target.value)} className="h-9" />
          </div>
        </div>
        <Button onClick={generate} className="mt-3 w-full md:w-auto">
          <FileText className="h-3.5 w-3.5 mr-1.5" />Generate Report
        </Button>
      </Card>

      <SectionCard title="Reportes generados" description={`${reports.length} en localStorage`}>
        <div className="space-y-2">
          {reports.length === 0 && <div className="text-center py-8 text-sm text-muted-foreground">No hay reportes todavía. Generá el primero arriba.</div>}
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
                  <div className="text-[11px] text-muted-foreground mt-0.5">{r.template} · {r.period}</div>
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

// Generador de PDF real (sintaxis PDF nativa, blob descargable)
function buildPdf(title: string, template: string, period: string, db: ReturnType<typeof loadDb>): Uint8Array {
  const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\n/g, ' ');
  const now = new Date().toLocaleString();
  const critical = db.threats.filter(t => t.severity === 'critical').length;
  const high = db.threats.filter(t => t.severity === 'high').length;
  const medium = db.threats.filter(t => t.severity === 'medium').length;
  const low = db.threats.filter(t => t.severity === 'low').length;

  const lines: string[] = ['BT'];
  lines.push('/F1 24 Tf');
  lines.push('60 760 Td');
  lines.push(`(${escape(title)}) Tj`);
  lines.push('/F1 11 Tf');
  lines.push('0 -30 Td');
  lines.push('(DataCyber Intelligence Platform) Tj');
  lines.push('0 -20 Td');
  lines.push(`(Generated: ${now}) Tj`);
  lines.push('0 -20 Td');
  lines.push(`(Template: ${escape(template)}) Tj`);
  lines.push('0 -20 Td');
  lines.push(`(Period: ${escape(period)}) Tj`);
  lines.push('0 -35 Td');
  lines.push('/F1 14 Tf');
  lines.push('(1. EXECUTIVE SUMMARY) Tj');
  lines.push('/F1 10 Tf');
  lines.push('0 -20 Td');
  lines.push(`(Brands monitored: ${db.brands.length}) Tj`);
  lines.push('0 -15 Td');
  lines.push(`(Active threats: ${db.threats.length}) Tj`);
  lines.push('0 -15 Td');
  lines.push(`(Critical: ${critical}   High: ${high}   Medium: ${medium}   Low: ${low}) Tj`);
  lines.push('0 -15 Td');
  lines.push(`(Executives monitored: ${db.executives.length}) Tj`);
  lines.push('0 -30 Td');
  lines.push('/F1 14 Tf');
  lines.push('(2. BRANDS MONITORED) Tj');
  lines.push('/F1 10 Tf');
  lines.push('0 -18 Td');
  for (const b of db.brands) {
    lines.push(`(${escape(b.name + ' - ' + b.country + ' - ' + b.domain + ' - ' + b.status + ' - ' + b.findings + ' findings')}) Tj`);
    lines.push('0 -13 Td');
  }
  lines.push('0 -20 Td');
  lines.push('/F1 14 Tf');
  lines.push('(3. RECENT THREATS) Tj');
  lines.push('/F1 10 Tf');
  lines.push('0 -18 Td');
  for (const t of db.threats.slice(0, 15)) {
    lines.push(`(${escape('[' + t.severity.toUpperCase() + '] ' + t.title.slice(0, 80))}) Tj`);
    lines.push('0 -13 Td');
  }
  lines.push('0 -25 Td');
  lines.push('/F1 9 Tf');
  lines.push('(--- Generated by DataCyber - SOC 2 Type II compliant ---) Tj');
  lines.push('ET');

  const contentStream = lines.join('\n');
  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += String(off).padStart(10, '0') + ' 00000 n \n';
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}
