'use client';

import { useAppStore } from '@/lib/store';
import { NAV_GROUPS } from './nav-config';
import { classNames } from '@/lib/helpers';
import {
  ShieldCheck, ChevronsLeft, ChevronsRight, LogOut, Bell, Search,
  Sun, Moon, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    activeModule, setModule, sidebarCollapsed, toggleSidebar,
    user, logout, theme, toggleTheme,
  } = useAppStore();

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background dc-grid-bg">
      {/* ============ SIDEBAR (desktop) ============ */}
      <aside
        className={classNames(
          'hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200',
          sidebarCollapsed ? 'w-[68px]' : 'w-[248px]'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-sidebar-border">
          <div className="relative h-9 w-9 shrink-0 rounded-lg bg-primary/15 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary dc-glow" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">DataCyber</span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Intelligence Platform
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto dc-scroll py-3 px-2 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              {!sidebarCollapsed && (
                <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                  {group.title}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeModule === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setModule(item.key)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={classNames(
                        'group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all',
                        active
                          ? 'bg-primary/15 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent',
                        sidebarCollapsed && 'justify-center'
                      )}
                    >
                      <Icon className={classNames('h-4 w-4 shrink-0', active && 'text-primary')} />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {sidebarCollapsed && item.badge && (
                        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-sidebar-border p-2">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition"
          >
            {sidebarCollapsed ? <ChevronsRight className="h-4 w-4" /> : (<><ChevronsLeft className="h-4 w-4" /> Collapse</>)}
          </button>
        </div>
      </aside>

      {/* ============ SIDEBAR (mobile drawer) ============ */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-[260px] bg-sidebar border-r border-sidebar-border flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">DataCyber</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Intelligence Platform</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto dc-scroll py-3 px-2 space-y-4">
              {NAV_GROUPS.map((group) => (
                <div key={group.title}>
                  <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.title}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = activeModule === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => { setModule(item.key); setMobileOpen(false); }}
                          className={classNames(
                            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm',
                            active ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ============ MAIN ============ */}
      <div className={classNames('transition-all', sidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-[248px]')}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center gap-3 px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search threats, domains, IOCs…"
              className="pl-9 h-9 bg-muted/40 border-muted/40 text-sm"
            />
            <kbd className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 h-5 px-1.5 items-center gap-0.5 rounded border border-border bg-muted text-[10px] text-muted-foreground">
              ⌘K
            </kbd>
          </div>

          <div className="flex-1" />

          {/* Quick actions */}
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted/60 transition" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 dc-pulse-critical" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Badge variant="secondary" className="text-[10px]">3 new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                <div className="flex items-center gap-2 w-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-red-400">Critical</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">5m ago</span>
                </div>
                <p className="text-xs">Phishing kit detected on login-acme-secure.tk</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                <div className="flex items-center gap-2 w-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  <span className="text-xs font-semibold text-orange-400">High</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">1h ago</span>
                </div>
                <p className="text-xs">Fake "ACME Wallet" app on Google Play</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                <div className="flex items-center gap-2 w-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-red-400">Critical</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">3h ago</span>
                </div>
                <p className="text-xs">Credentials of exec@acmebank.com leaked</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-md hover:bg-muted/60 transition">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/20 text-primary text-[11px] font-semibold">
                    {user?.avatar ?? 'AD'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-xs font-medium">{user?.username ?? 'admin'}</span>
                  <span className="text-[10px] text-muted-foreground">{user?.role ?? 'Administrator'}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span>{user?.username ?? 'admin'}</span>
                <span className="text-[11px] font-normal text-muted-foreground">{user?.email ?? 'admin@datacyber.io'}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setModule('settings')}>Settings</DropdownMenuItem>
              <DropdownMenuItem>API Keys</DropdownMenuItem>
              <DropdownMenuItem>Change Password</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-400 focus:text-red-400">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
