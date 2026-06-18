'use client';

import { useState } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { reportTemplates, generatedReports } from '@/lib/data';
import { formatDateTime, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  FileText, Download, Plus, Clock, CheckCircle2, Loader2, FileBarChart,
  FileCheck, Calendar, FileWarning,
} from 'lucide-react';
import { toast } from 'sonner';

const templateIcon = {
  executive:  FileBarChart,
  technical:  FileCheck,
  compliance: FileWarning,
  daily:      Calendar,
};

const statusStyles = {
  ready:      { label: 'Ready',      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  processing: { label: 'Processing', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Loader2 },
  failed:     { label: 'Failed',     badge: 'bg-red-500/15 text-red-400 border-red-500/30', icon: FileWarning },
};

export function ReportsModule() {
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState(reportTemplates[0].id);

  function generate() {
    if (!title.trim()) {
      toast.error('Please enter a report title');
      return;
    }
    toast.success('Report generation started', {
      description: `"${title}" is being generated. You'll be notified when it's ready.`,
    });
    setTitle('');
  }

  return (
    <div>
      <ModuleHeader
        title="Reports"
        description="Generación de reportes ejecutivos, técnicos, de cumplimiento y resúmenes diarios con datos de las 11 marcas monitoreadas."
        actions={<Button size="sm" onClick={() => toast.info('Nuevo template', { description: 'Definí secciones, audiencia y periodicidad.' })}><Plus className="h-3.5 w-3.5 mr-1.5" />Create Template</Button>}
      />

      {/* Generate report */}
      <Card className="bg-card/60 mb-6 p-5">
        <h3 className="text-sm font-semibold mb-3">Generate a new report</h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 space-y-1.5">
            <Label className="text-xs">Report title</Label>
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
                {reportTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3 flex items-end">
            <Button onClick={generate} className="w-full h-9">
              <FileText className="h-3.5 w-3.5 mr-1.5" />Generate
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Generated reports */}
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title="Generated reports" description={`${generatedReports.length} total`}>
            <div className="space-y-2">
              {generatedReports.map((r) => {
                const st = statusStyles[r.status];
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => toast.success('Descargando reporte', { description: `${r.title} (${r.size})` })}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* Templates */}
        <SectionCard title="Templates" description={`${reportTemplates.length} available`}>
          <div className="space-y-2">
            {reportTemplates.map((t) => {
              const Icon = templateIcon[t.type];
              return (
                <div key={t.id} className="p-3 rounded-md border border-border bg-muted/20 hover:bg-muted/40 transition">
                  <div className="flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{t.name}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">{t.type}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        Last generated: {formatDateTime(t.lastGenerated)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
