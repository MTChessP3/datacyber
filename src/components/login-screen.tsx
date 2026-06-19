'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Lock, User, Fingerprint, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin', role: 'Administrator', desc: 'Full access to all modules' },
  { username: 'analyst', password: 'analyst', role: 'Threat Analyst', desc: 'Read-only on settings & reports' },
];

export function LoginScreen() {
  const login = useAppStore((s) => s.login);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error || 'Login failed');
      toast.error('Login failed', { description: result.error });
    } else {
      toast.success('Welcome to DataCyber', { description: `Signed in as ${username}` });
    }
  }

  function fillDemo(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-background dc-grid-bg relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-chart-4/10 blur-3xl" />

      <div className="relative min-h-screen grid lg:grid-cols-2">
        {/* ============ LEFT — Brand ============ */}
        <div className="hidden lg:flex flex-col justify-between p-12 border-r border-border bg-sidebar/40">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary dc-glow" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold tracking-tight">DataCyber</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Cybersecurity Intelligence
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Threat intelligence,<br/>
              <span className="text-primary">all in one place.</span>
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-md">
              Monitor brands, executives, social channels, phishing URLs and exposed infrastructure.
              Detect threats before they reach your customers — and your bottom line.
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-md">
              {[
                { label: 'Brand Protection', val: '246 domains' },
                { label: 'Executive Watch', val: '5 profiles' },
                { label: 'Social Channels', val: '6 monitored' },
                { label: 'URL Forensics', val: '1.2k analyzed' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-card/50 p-3">
                  <div className="text-[11px] text-muted-foreground">{s.label}</div>
                  <div className="text-sm font-semibold mt-0.5 dc-mono">{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            © 2026 DataCyber · All rights reserved · SOC 2 Type II compliant
          </div>
        </div>

        {/* ============ RIGHT — Form ============ */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
              <div className="relative h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-semibold">DataCyber</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold">Welcome back</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to your threat intelligence workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="pl-9 h-11 bg-muted/30"
                    placeholder="admin"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <button type="button" onClick={() => toast.info('Reset de contraseña', { description: 'Se enviaría un email con instrucciones.' })} className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="pl-9 h-11 bg-muted/30"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-medium group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Authenticating…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4" />
                    Sign in to DataCyber
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </Button>
            </form>

            {/* Demo accounts */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">
                Demo accounts — click to fill
              </p>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.username}
                    onClick={() => fillDemo(acc.username, acc.password)}
                    className="w-full text-left rounded-md border border-border bg-card/50 hover:border-primary/40 hover:bg-card transition p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{acc.username}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                        {acc.role}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Password: <span className="font-mono">{acc.password}</span> — {acc.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
