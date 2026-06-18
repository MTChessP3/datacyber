'use client';

import { useState } from 'react';
import { ModuleHeader, SectionCard } from '@/components/ui-blocks';
import { socialChannels, socialMessages } from '@/lib/data';
import { formatRelative, classNames } from '@/lib/helpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, MessageSquare, Send, MessageCircle, Twitter, Users, Flag } from 'lucide-react';
import { toast } from 'sonner';

const platformIcon = {
  Telegram: Send,
  Discord: MessageCircle,
  Twitter: Twitter,
  Reddit: Users,
};

const platformColor = {
  Telegram: 'text-sky-400 bg-sky-500/10',
  Discord: 'text-violet-400 bg-violet-500/10',
  Twitter: 'text-blue-400 bg-blue-500/10',
  Reddit: 'text-orange-400 bg-orange-500/10',
};

const statusStyles = {
  monitoring: { label: 'Monitoring', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  paused:     { label: 'Paused',     badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  flagged:    { label: 'Flagged',    badge: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

const sentimentStyles = {
  positive: 'text-emerald-400',
  neutral:  'text-muted-foreground',
  negative: 'text-red-400',
};

export function SocialMonitoringModule() {
  const [selectedId, setSelectedId] = useState(socialChannels[0].id);
  const selected = socialChannels.find((c) => c.id === selectedId)!;
  const messages = socialMessages.filter((m) => m.channelId === selectedId);

  const totals = {
    channels: socialChannels.length,
    messages: socialChannels.reduce((a, c) => a + c.messages, 0),
    alerts: socialChannels.reduce((a, c) => a + c.alerts, 0),
    members: socialChannels.reduce((a, c) => a + c.members, 0),
  };

  return (
    <div>
      <ModuleHeader
        title="Social Media Monitoring"
        description="Vigilancia de canales de Telegram, Discord, Twitter y Reddit mencionando las 11 marcas. Detecta venta de creds, phishing kits, fake airdrops y menciones sospechosas."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.info('Agregar canal', { description: 'Pegar ID de canal de Telegram, Discord o usuario de Twitter.' })}><Plus className="h-3.5 w-3.5 mr-1.5" />Add Channel</Button>
            <Button size="sm" onClick={() => toast.info('Agregar keyword', { description: 'Define reglas de keyword para flaggear mensajes.' })}><MessageSquare className="h-3.5 w-3.5 mr-1.5" />Add Keyword</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Channels', value: totals.channels, accent: 'text-primary' },
          { label: 'Messages Collected', value: totals.messages.toLocaleString(), accent: 'text-sky-400' },
          { label: 'Flagged Alerts', value: totals.alerts, accent: 'text-red-400' },
          { label: 'Tracked Members', value: totals.members.toLocaleString(), accent: 'text-violet-400' },
        ].map((c) => (
          <Card key={c.label} className="bg-card/60 p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{c.label}</div>
            <div className={classNames('text-2xl font-semibold dc-mono mt-1', c.accent)}>{c.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Channels list */}
        <Card className="bg-card/60 lg:col-span-1">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Channels</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{socialChannels.length} monitored</p>
          </div>
          <div className="p-2 space-y-1 max-h-[640px] overflow-y-auto dc-scroll">
            {socialChannels.map((c) => {
              const Icon = platformIcon[c.platform];
              const active = c.id === selectedId;
              const st = statusStyles[c.status];
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={classNames(
                    'w-full flex items-start gap-3 p-3 rounded-md transition text-left',
                    active ? 'bg-primary/10 border border-primary/30' : 'border border-transparent hover:bg-muted/30'
                  )}
                >
                  <div className={classNames('h-9 w-9 rounded-md flex items-center justify-center shrink-0', platformColor[c.platform])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{c.name}</span>
                      <span className={classNames('h-1.5 w-1.5 rounded-full shrink-0',
                        c.status === 'flagged' ? 'bg-red-500' : c.status === 'monitoring' ? 'bg-emerald-500' : 'bg-slate-500')} />
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate">{c.identifier}</div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      {c.members > 0 && <span>{c.members.toLocaleString()} members</span>}
                      <span>{c.messages.toLocaleString()} msgs</span>
                      {c.alerts > 0 && <span className="text-red-400">{c.alerts} alerts</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Channel detail */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card/60 p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={classNames('h-12 w-12 rounded-lg flex items-center justify-center', platformColor[selected.platform])}>
                  {(() => {
                    const Icon = platformIcon[selected.platform];
                    return <Icon className="h-6 w-6" />;
                  })()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selected.name}</h2>
                  <p className="text-xs text-muted-foreground font-mono">{selected.identifier}</p>
                </div>
              </div>
              <Badge variant="outline" className={classNames('text-[10px]', statusStyles[selected.status].badge)}>
                {statusStyles[selected.status].label}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-[11px] text-muted-foreground">Platform</div>
                <div className="text-sm font-medium mt-0.5">{selected.platform}</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-[11px] text-muted-foreground">Members</div>
                <div className="text-sm font-medium mt-0.5 dc-mono">{selected.members.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-[11px] text-muted-foreground">Messages</div>
                <div className="text-sm font-medium mt-0.5 dc-mono">{selected.messages.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-[11px] text-muted-foreground">Last Activity</div>
                <div className="text-sm font-medium mt-0.5">{formatRelative(selected.lastActivity)}</div>
              </div>
            </div>
          </Card>

          <SectionCard
            title="Flagged messages"
            description="Messages matching keyword rules — flagged for analyst review"
            action={<Button variant="ghost" size="sm" className="text-xs" onClick={() => toast.info(`Mostrando todos los mensajes de "${selected.name}"`)}>View all</Button>}
          >
            <div className="space-y-2 max-h-[500px] overflow-y-auto dc-scroll">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No messages captured for this channel yet.
                </div>
              ) : messages.map((m) => (
                <div
                  key={m.id}
                  className={classNames(
                    'flex items-start gap-3 p-3 rounded-md border transition',
                    m.flagged ? 'border-red-500/30 bg-red-500/5' : 'border-border bg-muted/20 hover:bg-muted/40'
                  )}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-muted text-xs font-mono">
                      {m.author.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium font-mono">{m.author}</span>
                      {m.flagged && (
                        <Badge variant="outline" className="text-[10px] bg-red-500/15 text-red-400 border-red-500/30">
                          <Flag className="h-2.5 w-2.5 mr-1" /> Flagged
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground ml-auto">{formatRelative(m.timestamp)}</span>
                    </div>
                    <p className="text-sm mt-1 leading-snug">{m.content}</p>
                    {m.keywords.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {m.keywords.map((k) => (
                          <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                            {k}
                          </span>
                        ))}
                        <span className={classNames('text-[10px] ml-1 capitalize', sentimentStyles[m.sentiment])}>
                          · {m.sentiment}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
