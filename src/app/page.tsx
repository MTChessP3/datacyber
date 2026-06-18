'use client';

import { useAppStore } from '@/lib/store';
import { AppShell } from '@/components/app-shell';
import { LoginScreen } from '@/components/login-screen';
import { DashboardModule } from '@/components/modules/dashboard';
import { ThreatsModule } from '@/components/modules/threats';
import { BrandProtectionModule } from '@/components/modules/brand-protection';
import { ExecutiveProtectionModule } from '@/components/modules/executive-protection';
import { SocialMonitoringModule } from '@/components/modules/social-monitoring';
import { UrlForensicsModule } from '@/components/modules/url-forensics';
import { DomainAnalysisModule } from '@/components/modules/domain-analysis';
import { GoogleDorkingModule } from '@/components/modules/google-dorking';
import { ReportsModule } from '@/components/modules/reports';
import { SettingsModule } from '@/components/modules/settings';

export default function Home() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const activeModule = useAppStore((s) => s.activeModule);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <AppShell>
      {activeModule === 'dashboard' && <DashboardModule />}
      {activeModule === 'threats' && <ThreatsModule />}
      {activeModule === 'brand-protection' && <BrandProtectionModule />}
      {activeModule === 'executive-protection' && <ExecutiveProtectionModule />}
      {activeModule === 'social-monitoring' && <SocialMonitoringModule />}
      {activeModule === 'url-forensics' && <UrlForensicsModule />}
      {activeModule === 'domain-analysis' && <DomainAnalysisModule />}
      {activeModule === 'google-dorking' && <GoogleDorkingModule />}
      {activeModule === 'reports' && <ReportsModule />}
      {activeModule === 'settings' && <SettingsModule />}
    </AppShell>
  );
}
