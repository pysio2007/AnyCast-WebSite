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

**Nuxt 3 + Vue 3** SPA/SSR site for Pysio Networks, a personal BGP/Anycast network operator's website. Deployed to Netlify on push to `main`.

### Layouts & Routing

- `layouts/default.vue` — standard layout with `<NavBar>` + `<Footer>` + `<slot>`
- `layouts/no-navbar.vue` — layout without nav (used by pages that opt in via `definePageMeta`)
- `pages/` — file-based routing; `pages/detail/[server]/[protocol].vue` is the dynamic detail route for LG peer details

### Key Pages

| Route | Purpose |
|---|---|
| `/lg` | Looking Glass — queries Bird BGP daemon status across multiple nodes |
| `/detail/[server]/[protocol]` | Per-peer detail view with raw output and analysis toggle |
| `/traceroute`, `/ping`, `/global-traceroute` | Network path/latency tools |
| `/bgp` | BGP route visibility via BGP.Tools API |
| `/whois` | WHOIS queries |
| `/tor-check` | Tor exit node lookup |
| `/anycast` | Anycast service info |
| `/dn42` | DN42 network peering info |
| `/root-dns` | Root DNS service stats |
| `/prefixes`, `/ix`, `/downstream` | Network topology/peering info |
| `/lir`, `/en/lir` | LIR (RIPE) service info (zh + en) |

### Components

- `components/PageSeo.vue` — drop into any page to set `<title>` and meta tags; accepts `title` and `description` props
- `components/NavBar.vue` — sticky frosted-glass nav with mobile hamburger menu
- `components/Footer.vue` — site footer

### Utilities

- `utils/cache.ts` — `localStorage`-backed `Cache` class with key-prefix-based TTLs:
  - `ip_geo_*` → 7 days
  - `api_req_*` → 10 minutes
  - `traceroute_*` → 1 hour
- `utils/geoip.ts` — IP geolocation via ipinfo.io (primary) falling back to ip-api.com; uses `Cache`; API key stored in `localStorage`
- `utils/country-centers.ts` — country centroid coordinates for map rendering

### Styling

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (imported in `assets/css/main.css`)
- **DaisyUI v5** as a Tailwind plugin, `light` theme only — dark mode is intentionally blocked via a `MutationObserver` in `nuxt.config.ts`
- Apple-inspired design system with CSS custom properties (`--apple-blue`, `--apple-shadow-*`, etc.) defined in `assets/css/main.css`
- Scoped styles in components use `@reference "tailwindcss"` to access Tailwind utilities inside `<style scoped>`

### Runtime Config

`nuxt.config.ts` exposes `public.gitHash` (retrieved via `git rev-parse --short HEAD` at build time) and sitemap configuration. Access with `useRuntimeConfig().public.gitHash`.

### External APIs

- **BGP.Tools** — BGP route/AS visibility
- **RIPE RIS** — routing information
- **Tor Metrics** — exit node data
- **DN42 Registry** — DN42 peering data
- **ipinfo.io / ip-api.com** — IP geolocation (client-side, cached in localStorage)

### Sitemap

New pages must be manually added to the `sitemap.urls` array in `nuxt.config.ts`.
