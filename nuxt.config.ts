// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { execSync } from 'child_process';

// 获取 Git commit hash
function getGitHash(): string {
  try {
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    return hash;
  } catch (error) {
    console.warn('Failed to get git hash:', error);
    return 'development';
  }
}

const gitHash = getGitHash();

export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap', '@nuxt/image', 'shadcn-nuxt', '@nuxtjs/color-mode', '@vueuse/nuxt'],
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: ['@lucide/vue', 'class-variance-authority', 'clsx', 'reka-ui', 'tailwind-merge', 'vue-sonner', 'leaflet'],
    },
  },
  image: {
    format: ['webp', 'avif', 'jpg', 'png'],
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    provider: 'ipx',
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  // Our own Looking Glass (lg.pysio.online) is retired; its routes now point to the public RIPE RIS route lookup.
  routeRules: {
    '/lg': { redirect: { to: '/bgp', statusCode: 301 } },
    '/detail/**': { redirect: { to: '/bgp', statusCode: 301 } },
    // Root DNS mirror page removed.
    '/root-dns': { redirect: { to: '/', statusCode: 301 } },
  },
  runtimeConfig: {
    public: {
      gitHash: gitHash,
      sitemap: {
        siteUrl: 'https://anycast.ink',
        changefreq: 'daily',
        priority: 0.7,
        exclude: ['/404'],
        urls: [
          {
            url: '/',
            changefreq: 'daily',
            priority: 1.0,
            lastmod: new Date().toISOString()
          },
          {
            url: '/asn',
            changefreq: 'daily',
            priority: 0.9,
            lastmod: new Date().toISOString()
          },
          {
            url: '/tools',
            changefreq: 'weekly',
            priority: 0.9,
            lastmod: new Date().toISOString()
          },
          {
            url: '/traceroute',
            changefreq: 'daily',
            priority: 0.8,
            lastmod: new Date().toISOString()
          },
          {
            url: '/bgp',
            changefreq: 'daily',
            priority: 0.8,
            lastmod: new Date().toISOString()
          },
          {
            url: '/whois',
            changefreq: 'daily',
            priority: 0.8,
            lastmod: new Date().toISOString()
          },
          {
            url: '/tor-check',
            changefreq: 'daily',
            priority: 0.8,
            lastmod: new Date().toISOString()
          },
          {
            url: '/anycast',
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: new Date().toISOString()
          },
          {
            url: '/dn42',
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: new Date().toISOString()
          },
          {
            url: '/blog',
            changefreq: 'daily',
            priority: 0.9,
            lastmod: new Date().toISOString()
          },
          {
            url: '/version',
            changefreq: 'weekly',
            priority: 0.6,
            lastmod: new Date().toISOString()
          },
          {
            url: '/lir',
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: new Date().toISOString()
          }
        ]
      }
    }
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN',
      },
      title: 'Pysio Networks - Anycast Tools',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        {
          name: 'description',
          content: 'Pysio Networks 提供 Anycast 网络服务与开放网络工具集，包括 BGP 路由查询、全球 Ping、路由追踪、WHOIS 查询和 Tor 节点查询等功能。'
        },
        {
          name: 'keywords',
          content: 'Pysio Networks, Anycast, BGP, Looking Glass, 路由查询, 全球 Ping, 路由追踪, WHOIS, RDAP, Tor, DN42, 网络工具'
        },
        // Open Graph
        {
          property: 'og:title',
          content: 'Pysio Networks - Anycast Tools'
        },
        {
          property: 'og:description',
          content: 'Pysio Networks 提供 Anycast 网络服务与开放网络工具集，包括 BGP 路由查询、全球 Ping、路由追踪、WHOIS 查询和 Tor 节点查询等功能。'
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          property: 'og:url',
          content: 'https://anycast.ink'
        },
        // Twitter Card
        {
          name: 'twitter:card',
          content: 'summary'
        },
        {
          name: 'twitter:title',
          content: 'Pysio Networks - Anycast Tools'
        },
        {
          name: 'twitter:description',
          content: 'Pysio Networks 提供 Anycast 网络服务与开放网络工具集，包括 BGP 路由查询、全球 Ping、路由追踪、WHOIS 查询和 Tor 节点查询等功能。'
        }
      ],
      script: [
        {
          async: true,
          src: 'https://www.googletagmanager.com/gtag/js?id=G-P1L3MZ08KH'
        },
        {
          innerHTML: `window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-P1L3MZ08KH');`
        },
        {
          defer: true,
          src: 'https://umami.pysio.online/script.js',
          'data-website-id': 'e7693c69-0ebb-47bf-8f06-e49fa527ef7b'
        },
        {
          async: true,
          src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6547593871065949',
          crossorigin: 'anonymous'
        },
      ],
      link: [
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.0.0/css/flag-icons.min.css"
        }
      ]
    }
  },
})
