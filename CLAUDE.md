# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt 3 web application for Pysio Networks' Anycast tools and services. The site provides various network diagnostic tools including Looking Glass, traceroute, BGP analysis, WHOIS queries, and Tor node checking. It's a Chinese-language website deployed on Netlify.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Generate static site
npm run generate

# Preview production build
npm run preview
```

## Project Architecture

### Framework & Structure
- **Framework**: Nuxt 3 with TypeScript
- **Styling**: Tailwind CSS 4.x + DaisyUI
- **Deployment**: Netlify with auto-deployment from main branch
- **Language**: Chinese (zh-CN)

### Key Directories
- `pages/` - Route-based pages for different tools (lg.vue, traceroute.vue, bgp.vue, whois.vue, etc.)
- `components/` - Reusable Vue components (NavBar, Footer, PageSeo)
- `utils/` - Utility functions for caching, GeoIP, and country centers
- `server/` - Server-side plugins and configuration
- `assets/css/` - Global CSS and Tailwind configuration
- `public/` - Static assets and resources

### Core Utilities
- `utils/cache.ts` - Client-side caching system with different TTL for different data types
- `utils/geoip.ts` - IP geolocation service with multiple API providers (ipinfo.io, ip-api.com)
- `utils/country-centers.ts` - Country coordinate mapping for visualizations
- `server/plugins/git-hash.ts` - Git hash injection for build versioning

### Configuration
- `nuxt.config.ts` - Main Nuxt configuration with modules, SEO settings, and analytics
- Uses `@nuxt/content`, `@nuxt/image`, `@nuxtjs/sitemap` modules
- Configured for light theme only with comprehensive SEO meta tags
- Includes Google Analytics and Umami analytics

### API Integration
The application integrates with various external APIs:
- BGP.Tools API for BGP analysis
- Tor Metrics API for Tor node information
- RIPE RIS API for routing information
- DN42 Registry API for DN42 network data
- Multiple GeoIP services with failover support

### Caching Strategy
- Client-side caching with different TTL periods:
  - IP geolocation: 7 days
  - API requests: 10 minutes
  - Traceroute results: 1 hour
- Cache keys use prefixes to identify data types

### Git Integration
- Uses git-describe to inject commit hashes into builds
- Fallback to 'development' when git info unavailable
- Hash displayed in version page for debugging

## Key Architecture Patterns

### Page Structure Pattern
Most tool pages (lg.vue, ping.vue, traceroute.vue, etc.) follow this pattern:
- Top search form with input validation
- Results display with loading states and error handling  
- Interactive data visualization using ECharts
- Responsive cards layout for mobile/desktop
- Caching integration using `Cache` utility class

### API Integration Pattern
All external API calls follow this pattern:
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

### TypeScript Integration
- Interface definitions in utils/cache.ts for API responses
- Type-safe reactive refs throughout components
- Proper error handling with typed catch blocks

## External Dependencies & APIs

### Required API Providers
- **BGP.Tools**: `bgp.tools` for BGP route analysis and Looking Glass data
- **Tor Metrics**: `metrics.torproject.org` for Tor node information
- **RIPE RIS**: RIS API for routing information and traceroute
- **GeoIP Services**: ipinfo.io (primary), ip-api.com (fallback)
- **DN42 Registry**: For DN42 network data

### Analytics & Monitoring
- Google Analytics (G-P1L3MZ08KH) 
- Umami Analytics (`umami.pysio.online`)
- Both configured in nuxt.config.ts head scripts

### Font & Icon Dependencies
- FontAwesome 6.5.1 via CDN for icons
- Flag Icons via jsdelivr CDN for country flags
- JetBrains Mono from Google Fonts for monospace text

## Development Notes

- Site is primarily Chinese with English technical terms
- All network tools are diagnostic/read-only (no configuration changes)
- Private IP addresses filtered out in GeoIP lookups to avoid unnecessary API calls
- Multiple API providers with automatic failover for reliability
- Mobile-first responsive design using Tailwind breakpoints
- No linting or testing commands configured - manual code review process
- AGPL-3.0 license requires derivative works to remain open source