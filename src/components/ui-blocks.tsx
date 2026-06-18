'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { classNames } from '@/lib/helpers';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number | string;
  delta?: number;
  hint?: string;
  icon?: LucideIcon;
  accent?: 'primary' | 'red' | 'orange' | 'sky' | 'violet' | 'emerald';
}

const accentMap = {
  primary:  { bg: 'bg-primary/10',  text: 'text-primary' },
  red:      { bg: 'bg-red-500/10',  text: 'text-red-400' },
  orange:   { bg: 'bg-orange-500/10', text: 'text-orange-400' },
  sky:      { bg: 'bg-sky-500/10',  text: 'text-sky-400' },
  violet:   { bg: 'bg-violet-500/10', text: 'text-violet-400' },
  emerald:  { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
};

export function KpiCard({ label, value, delta, hint, icon: Icon, accent = 'primary' }: KpiCardProps) {
  const a = accentMap[accent];
  const positive = (delta ?? 0) >= 0;
  // For some metrics (threats/alerts), a positive delta is BAD.
  // Caller passes delta with sign already meaningful; we just render.
  const isGood = positive ? label.toLowerCase().includes('report') || label.toLowerCase().includes('message') || label.toLowerCase().includes('scan') || label.toLowerCase().includes('monitor') || label.toLowerCase().includes('analyz') : !positive;

  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
            <span className="text-2xl font-semibold dc-mono tracking-tight">{value}</span>
          </div>
          {Icon && (
            <div className={classNames('h-9 w-9 rounded-lg flex items-center justify-center', a.bg, a.text)}>
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        {(delta !== undefined || hint) && (
          <div className="flex items-center gap-1.5 mt-3 text-xs">
            {delta !== undefined && (
              <span className={classNames(
                'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium',
                isGood ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              )}>
                {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(delta)}%
              </span>
            )}
            {hint && <span className="text-muted-foreground">{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ModuleHeader({
  title, description, actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({
  title, description, action, children, className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={classNames('bg-card/60', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
          <div>
            {title && <h3 className="text-sm font-semibold">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </Card>
  );
}
