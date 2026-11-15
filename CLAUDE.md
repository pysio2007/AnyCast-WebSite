# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (hot-reload)
npm run build      # Build for production (SSR)
npm run generate   # Static site generation
npm run preview    # Preview production build
```

There are no test commands — this project has no test suite.

## Architecture

**Nuxt 4 + Vue 3** SSR site for Pysio Networks, a personal BGP/Anycast network operator's website. Deployed to Netlify on push to `main`.

### Layouts & Routing

- `layouts/default.vue` — standard layout: `<SiteHeader>` + `<slot>` + `<SiteFooter>`
- `layouts/no-navbar.vue` — used **only** by the LIR pages; loads the legacy DaisyUI stylesheet (`assets/css/lir.css`) and Font Awesome so those pages keep their original design
- `pages/` — file-based routing. `/lg` and `/detail/**` (the retired own Looking Glass) 301-redirect to `/bgp` via `routeRules` in `nuxt.config.ts`

### Key Pages

| Route | Purpose |
|---|---|
| `/bgp` | BGP route lookup — public Looking Glass on RIPE RIS (RIPEstat `looking-glass`, visibility, RPKI, ASN overview) |
| `/ping`, `/traceroute`, `/global-traceroute` | Globalping-based ping / MTR / multi-probe traceroute |
| `/whois` | RDAP lookups via rdap.org (IP, ASN, domain) |
| `/ip` | IP geolocation compared across ~11 databases (xmsl.Dev GeoAPI via `/api/geo`) |
| `/tor-check` | Tor exit node lookup |
| `/asn` | All operated ASNs (Pysio / Akaere / Skimit) with live RIPEstat data |
| `/anycast` | Anycast service info |
| `/dn42` | DN42 AutoPeer — live nodes/stats from autopeer.su via the cached `server/api/autopeer.get.ts` proxy (autopeer.su has no CORS for us) |
| `/prefixes`, `/ix`, `/downstream` | Network topology/peering info |
| `/lir`, `/en/lir` | LIR (RIPE) service info (zh + en) |

### Components

- `components/ui/*` — shadcn-vue components (Reka UI), auto-imported without prefix by `shadcn-nuxt`. Add more with `npx shadcn-vue@latest add <name>`; the CLI may emit `import { cn } from 'cn'` — rewrite to `@/lib/utils`
- `components/PageSeo.vue` — drop into any page to set `<title>` and meta tags; accepts `title` and `description` props
- `components/SiteHeader.vue` / `SiteFooter.vue` — global nav (NavigationMenu + mobile Sheet) and footer (links, color-mode toggle, commit hash); both driven by `lib/site.ts`
- `components/PageHeader.vue` — standard page hero (`eyebrow`, `title`, `description`, `#actions` slot)
- `components/StatCard.vue`, `components/LinkCard.vue` — stat tile and navigation card

### Shared data

- `lib/site.ts` — `ORGANIZATIONS` + `OPERATED_ASNS` (every ASN we run, with org/registry/PeeringDB id; `SITE_ASNS` derives from it), `ANYCAST_ASNS`, `PRIMARY_ASN`, nav link groups (`networkLinks`, `toolLinks`, `resourceLinks`)
- `composables/usePublicApi.ts` — `useRipeStat(call, query)` and `usePeeringDb(resource, query)`: client-side, lazy `useFetch` wrappers so pages always show live public data
- `composables/useGlobalping.ts` — create + poll Globalping measurements (`run`, `load`, `stop`), shared rate-limit state; `components/GlobalpingLocation.vue` (probe location picker) and `components/GlobalpingQuota.vue` (credit + remaining quota). Anonymous quota: 250 probe tests/hour/IP; never send both top-level `limit` and `locations[].limit`

### Utilities

- `utils/cache.ts` — `localStorage`-backed `Cache` class with key-prefix-based TTLs:
  - `api_req_*` → 10 minutes
  - `traceroute_*` → 1 hour
- `composables/useTraceAnalysis.ts` — cached client for `/api/trace` (hop placement helpers); `components/TraceMap.vue` renders the analysed route (locations, segments, confidence) on Leaflet

### Styling

- **Tailwind CSS v4** via `@tailwindcss/vite`; theme tokens (shadcn neutral + `success`/`warning`/`info`) in `assets/css/main.css`, which also imports `shadcn-vue/tailwind.css` (the `data-open:`-style variants the components rely on)
- **shadcn-vue** components + **Lucide** icons (`@lucide/vue`); Vercel-style monochrome design, Geist / Geist Mono fonts
- Light/dark via `@nuxtjs/color-mode` (`.dark` class). Use theme tokens (`bg-background`, `text-muted-foreground`, `border`…), never hardcoded light colors
- Utilities: `page-container` (page width), `bg-grid` (hero backdrop)
- LIR pages are the exception: DaisyUI scoped to `.lir-root` via `assets/css/lir.css`, forced light mode via `definePageMeta({ colorMode: 'light' })`

### Runtime Config

Server-only secret: `XMSL_KEY` (Netlify env var; locally in `.env`, see `.env.example`). Read at request time via `xmslConfig()` in `server/utils/xmsl.ts`; never put its value into `runtimeConfig` defaults (it would be inlined into `.output` and Netlify's secret scan fails the build).


`nuxt.config.ts` exposes `public.gitHash` (retrieved via `git rev-parse --short HEAD` at build time) and sitemap configuration. Access with `useRuntimeConfig().public.gitHash`.

### External APIs

- **RIPEstat Data API** — announced prefixes, ASN neighbours, visibility
- **PeeringDB API** — IX connections
- **Globalping** — ping / traceroute / MTR probes (`api.globalping.io`)
- **RDAP** — `rdap.org` redirector to RIR/registry RDAP servers
- **ip.akaere.online** — visitor IP info on the home page
- **xmsl.Dev GeoAPI** — server-only (CORS is locked to xmsl.dev): `server/api/geo.get.ts` (multi-provider IP lookup, needs `XMSL_KEY`, 20 req/h/visitor, cached 24h) and `server/api/trace.post.ts` (uploads an MTR text, reads the cross-checked hop geolocation, deletes the stored trace; 60 req/h/visitor, cached 24h by text hash). Shared types in `shared/types/xmsl.ts`. Base URL in `runtimeConfig.xmsl.baseUrl`
- Retired, do not use: `lg.pysio.online`, `ping.akaere.online`, `whois.akaere.online`
- **Tor Onionoo** — relay data
- **ipinfo.io / ip-api.com** — IP geolocation (client-side, cached in localStorage)

### Sitemap

New pages must be manually added to the `sitemap.urls` array in `nuxt.config.ts`.
