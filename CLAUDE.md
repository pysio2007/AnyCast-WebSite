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

## Development Notes

- The site is primarily in Chinese with some English technical terms
- All network tools are designed for diagnostic purposes only
- Private IP addresses are filtered out in GeoIP lookups
- Multiple API providers ensure service reliability
- Responsive design with mobile-first approach
- No linting or testing commands are currently configured