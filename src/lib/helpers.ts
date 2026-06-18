import type { Severity, ThreatStatus } from './types';

export function formatRelative(iso: string): string {
  const now = new Date('2026-06-19T09:00:00Z').getTime();
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const severityVariant: Record<Severity, {
  label: string;
  badge: string; // tailwind classes for badge
  dot: string;
}> = {
  critical: { label: 'Critical', badge: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-500' },
  high:     { label: 'High',     badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30', dot: 'bg-orange-500' },
  medium:   { label: 'Medium',   badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-500' },
  low:      { label: 'Low',      badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30', dot: 'bg-sky-500' },
  info:     { label: 'Info',     badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30', dot: 'bg-slate-500' },
};

export const statusVariant: Record<ThreatStatus, { label: string; badge: string }> = {
  new:            { label: 'New',            badge: 'bg-red-500/15 text-red-400 border-red-500/30' },
  investigating:  { label: 'Investigating',  badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  resolved:       { label: 'Resolved',       badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  false_positive: { label: 'False Positive', badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

export function classNames(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}
