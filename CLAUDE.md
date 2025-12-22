# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt 3 web application for Pysio Networks' Anycast tools and services. The site provides various network diagnostic tools including Looking Glass, traceroute, BGP analysis, WHOIS queries, and Tor node checking. It's a Chinese-language website deployed on Netlify.

## Development Commands

```bash
# Install dependencies (runs nuxt prepare via postinstall hook)
npm install

# Start development server
npm run dev

# Build for production (SSR)
npm run build

# Generate static site
npm run generate

# Preview production build
npm run preview
```

## Project Architecture

### Framework & Structure
- **Framework**: Nuxt 3.17+ with TypeScript
- **Styling**: Tailwind CSS 4.x + DaisyUI 5.x with custom Apple-inspired design system
- **Deployment**: Netlify with auto-deployment from main branch
- **Language**: Chinese (zh-CN)
- **Theme**: Light mode only (dark mode explicitly disabled)

### Key Directories
- `pages/` - Route-based pages for different tools (lg.vue, traceroute.vue, bgp.vue, whois.vue, etc.)
  - `detail/[server]/[protocol].vue` - Dynamic route for detailed server information
  - `en/` - English language pages (e.g., en/lir.vue)
- `components/` - Reusable Vue components (NavBar, Footer, PageSeo)
- `utils/` - Utility functions for caching, GeoIP, and country centers
- `server/` - Server-side plugins (git-hash injection)
- `assets/css/` - Global CSS with Apple-inspired design tokens
- `types/` - TypeScript type definitions (e.g., git.d.ts)
- `public/` - Static assets and resources

### Core Utilities
- `utils/cache.ts` - Client-side localStorage caching with prefix-based TTL strategy
  - Default: 10 minutes
  - IP geolocation (`ip_geo_` prefix): 7 days
  - API requests (`api_req_` prefix): 10 minutes
  - Traceroute results (`traceroute_` prefix): 1 hour
- `utils/geoip.ts` - IP geolocation with multi-provider failover
  - Primary: ipinfo.io (requires API key, default key provided)
  - Fallback: ip-api.com (free tier, no key required)
  - Private IP filtering to avoid unnecessary API calls
  - API key management with user override capability
- `utils/country-centers.ts` - Country coordinate mapping for map visualizations
- `server/plugins/git-hash.ts` - Git hash injection using `git-describe` package
  - Falls back to 'development' when git info unavailable
  - Exposed via `NUXT_PUBLIC_GIT_HASH` runtime config

### Configuration
- `nuxt.config.ts` - Main Nuxt configuration
  - Vite with `@tailwindcss/vite` plugin (not PostCSS/Tailwind CLI)
  - `@nuxt/image` module with IPX provider and WebP/AVIF formats
  - `@nuxtjs/sitemap` module with hardcoded URL list
  - Runtime config for git hash injection
  - Comprehensive SEO meta tags (Open Graph, Twitter Cards)
  - Analytics: Google Analytics (G-P1L3MZ08KH) + Umami (umami.pysio.online)
  - Google AdSense async script
  - Forced light mode with MutationObserver enforcement
- `assets/css/main.css` - Tailwind + DaisyUI configuration with Apple-inspired design tokens
  - Custom CSS variables for colors, shadows, blur effects
  - Jetbrains Mono font for monospace text (plus Chinese fallback fonts)
  - Explicit dark mode disable overrides

### API Integration
The application integrates with various external APIs:
- **BGP.Tools** (`bgp.tools`) - BGP route analysis and Looking Glass data
- **Tor Metrics** (`metrics.torproject.org`) - Tor node information
- **RIPE RIS** - Routing information service API
- **DN42 Registry** - DN42 network data
- **GeoIP Services** - ipinfo.io (primary), ip-api.com (fallback)

### Caching Strategy
The `Cache` utility in `utils/cache.ts` implements localStorage-based caching with prefix-based TTL:
- Check cache first before API calls
- Prefix-based TTL selection (`ip_geo_`, `api_req_`, `traceroute_`)
- Automatic cleanup of expired entries
- `clearByPrefix()` for bulk invalidation
- `clearAll()` for complete cache reset

## External Dependencies & APIs

### Required API Providers
- **BGP.Tools** (`bgp.tools`) - BGP route analysis and Looking Glass data
- **Tor Metrics** (`metrics.torproject.org`) - Tor node information
- **RIPE RIS** - Routing information and traceroute data
- **ipinfo.io** - GeoIP (primary, requires API token)
- **ip-api.com** - GeoIP fallback (free tier, no auth required)
- **DN42 Registry** - DN42 network data

### Analytics & Monitoring
- Google Analytics: G-P1L3MZ08KH
- Umami Analytics: umami.pysio.online (website-id: e7693c69-0ebb-47bf-8f06-e49fa527ef7b)
- Google AdSense: ca-pub-6547593871065949

### Font & Icon Dependencies
- FontAwesome 6.5.1 via CDN (cdnjs)
- Flag Icons 7.0.0 via jsdelivr CDN
- JetBrains Mono via Google Fonts (with Chinese fallbacks: PingFang SC, Microsoft YaHei)

## Key Architecture Patterns

### Page Structure Pattern
Most tool pages (lg.vue, ping.vue, traceroute.vue, etc.) follow this pattern:
- Top search form with input validation
- Results display with loading states and error handling
- Interactive data visualization using ECharts (for map/network data)
- Responsive cards layout for mobile/desktop
- Caching integration using `Cache` utility class

### API Integration Pattern
```typescript
// 1. Check cache first
const cachedData = Cache.get(cacheKey)
if (cachedData) return cachedData

// 2. Fetch from API with error handling
try {
  const response = await $fetch(apiUrl)
  Cache.set(cacheKey, response, ttl)
  return response
} catch (error) {
  // Fallback to secondary API or show error
}
```

### State Management Pattern
Vue 3 Composition API with reactive refs:
- `loading` - Boolean for loading states
- `error` - String for error messages
- `results` - Array/Object for API responses
- Computed properties for filtered/processed data

## Development Notes

- Language: Site is primarily Chinese with English technical terms
- All network tools are diagnostic/read-only (no configuration changes)
- Private IP addresses filtered in GeoIP lookups to avoid unnecessary API calls
- Multi-provider API failover for reliability
- Mobile-first responsive design using Tailwind breakpoints
- No linting or testing commands configured - manual code review process
- AGPL-3.0 license requires derivative works to remain open source
