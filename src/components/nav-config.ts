'use client';

import {
  LayoutDashboard, Shield, Briefcase, MessageSquare, Link2,
  Globe, Search, AlertTriangle, FileText, Settings,
} from 'lucide-react';
import type { ModuleKey } from '@/lib/types';

export interface NavItem {
  key: ModuleKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string | number;
}

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Security overview & KPIs' },
      { key: 'threats', label: 'Threats', icon: AlertTriangle, description: 'Active threats & alerts', badge: 37 },
    ],
  },
  {
    title: 'Protection',
    items: [
      { key: 'brand-protection', label: 'Brand Protection', icon: Shield, description: 'Domains, apps, impersonations' },
      { key: 'executive-protection', label: 'Executive Protection', icon: Briefcase, description: 'Executive exposure monitoring' },
      { key: 'social-monitoring', label: 'Social Monitoring', icon: MessageSquare, description: 'Telegram / Discord / Twitter' },
    ],
  },
  {
    title: 'Investigation',
    items: [
      { key: 'url-forensics', label: 'URL Forensics', icon: Link2, description: 'Phishing & URL sandbox' },
      { key: 'domain-analysis', label: 'Domain Analysis', icon: Globe, description: 'DNS, WHOIS, ports, headers' },
      { key: 'google-dorking', label: 'Google Dorking', icon: Search, description: 'Advanced search queries' },
    ],
  },
  {
    title: 'Output',
    items: [
      { key: 'reports', label: 'Reports', icon: FileText, description: 'Templates & generated reports' },
      { key: 'settings', label: 'Settings', icon: Settings, description: 'API keys & preferences' },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function findNavItem(key: ModuleKey): NavItem {
  return NAV_ITEMS.find((i) => i.key === key) ?? NAV_ITEMS[0];
}
