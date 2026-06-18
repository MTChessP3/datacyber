# DataCyber — Cybersecurity Intelligence Platform

Plataforma de inteligencia de amenazas para monitoreo de marcas, ejecutivos, canales sociales, forensia de URLs, análisis de dominios y Google dorking.

## Marcas monitoreadas (11)

| Marca | País | Tipo |
|-------|------|------|
| Bancolombia | Colombia | Bank |
| Banco AgroMercantil | Guatemala | Bank |
| Banco Agrícola | El Salvador | Bank |
| Banistmo | Panamá | Bank |
| Nequi | Colombia | Fintech |
| Zaswin | Colombia | Fintech |
| Renting | Colombia | Services |
| Suvalor | Colombia | Services |
| Wompi | Colombia | Fintech |
| Wenia | Colombia | Fintech |

## Stack

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript 5
- **UI**: Tailwind CSS 4 + shadcn/ui
- **State**: Zustand (cliente) + persist
- **Charts**: Recharts
- **Icons**: Lucide React
- **Fonts**: Geist Sans/Mono + JetBrains Mono

## Módulos

1. **Dashboard** — KPIs, tendencias, distribución de amenazas, top marcas
2. **Threats** — Listado con filtros (severity, status, search) + export
3. **Brand Protection** — Targets monitoreados + fake apps + takedowns
4. **Executive Protection** — Perfiles C-level + exposure findings
5. **Social Monitoring** — Canales Telegram/Discord/Twitter/Reddit + mensajes flaggeados
6. **URL Forensics** — Análisis con threat score, SSL, multi-engine detections
7. **Domain Analysis** — DNS, WHOIS, puertos, subdominios, security headers
8. **Google Dorking** — Queries guardadas + resultados
9. **Reports** — Templates + generación + descarga
10. **Settings** — API keys (8 proveedores), notificaciones, 2FA

## Credenciales demo

| Usuario | Clave | Rol |
|---------|-------|-----|
| `admin` | `admin` | Administrator |
| `analyst` | `analyst` | Threat Analyst |

## Desarrollo

```bash
bun install
bun run dev      # http://localhost:3000
bun run lint     # ESLint
bun run build    # build de producción
```

## Despliegue

### Vercel (recomendado)

1. Subir este repo a GitHub
2. Importar en https://vercel.com/new
3. Framework preset: **Next.js**
4. Build command: `bun run build`
5. Output: automático (standalone)
6. Deploy → URL lista en ~2 min

### Railway / Render / Netlify

También compatibles. Usar build command `bun run build` y start `bun run start`.

## Estructura

```
src/
├── app/
│   ├── layout.tsx           # Root layout + ThemeProvider
│   ├── page.tsx             # Entry SPA (auth gate)
│   └── globals.css          # Tema dark ciberseguridad
├── components/
│   ├── app-shell.tsx        # Sidebar + topbar + content
│   ├── login-screen.tsx     # Pantalla de login
│   ├── ui-blocks.tsx        # KpiCard, ModuleHeader, SectionCard
│   ├── nav-config.ts        # Navegación sidebar
│   └── modules/
│       ├── dashboard.tsx
│       ├── threats.tsx
│       ├── brand-protection.tsx
│       ├── executive-protection.tsx
│       ├── social-monitoring.tsx
│       ├── url-forensics.tsx
│       ├── domain-analysis.tsx
│       ├── google-dorking.tsx
│       ├── reports.tsx
│       └── settings.tsx
└── lib/
    ├── types.ts             # Tipos del dominio
    ├── data.ts              # Datos mock (11 marcas)
    ├── store.ts             # Zustand store
    └── helpers.ts           # Utilidades
```

## Licencia

MIT
