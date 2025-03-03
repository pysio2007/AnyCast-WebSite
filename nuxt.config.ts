// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/sitemap' , '@nuxt/content'],
  tailwindcss: {
    configPath: '~/tailwind.config.ts',
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      gitHash: process.env.NUXT_PUBLIC_GIT_HASH || 'development',
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
            url: '/tools',
            changefreq: 'weekly',
            priority: 0.9,
            lastmod: new Date().toISOString()
          },
          {
            url: '/lg',
            changefreq: 'daily',
            priority: 0.8,
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
            url: '/tor',
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
          }
        ]
      }
    }
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN'
      },
      title: 'Pysio Networks - Anycast Tools',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'color-scheme', content: 'light only' },
        { name: 'forced-colors', content: 'none' },
        { name: 'prefers-color-scheme', content: 'light' },
        {
          name: 'description',
          content: 'Pysio Networks 提供 Anycast 网络服务与专业网络工具集，包括 Looking Glass、路由追踪、BGP分析器、WHOIS查询和Tor节点查询等功能。'
        },
        {
          name: 'keywords',
          content: 'Pysio Networks, Anycast, BGP, Looking Glass, 路由追踪, WHOIS, Tor, DN42, 网络工具'
        },
        // Open Graph
        {
          property: 'og:title',
          content: 'Pysio Networks - Anycast Tools'
        },
        {
          property: 'og:description',
          content: 'Pysio Networks 提供 Anycast 网络服务与专业网络工具集，包括 Looking Glass、路由追踪、BGP分析器、WHOIS查询和Tor节点查询等功能。'
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
          content: 'Pysio Networks 提供 Anycast 网络服务与专业网络工具集，包括 Looking Glass、路由追踪、BGP分析器、WHOIS查询和Tor节点查询等功能。'
        }
      ],
      script: [
        {
          async: true,
          src: 'https://www.googletagmanager.com/gtag/js?id=G-P1L3MZ08KH'
        },
        {
          children: `window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-P1L3MZ08KH');`
        },
        {
          async: true,
          src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6547593871065949',
          crossorigin: 'anonymous'
        },
        {
          defer: true,
          src: 'https://umami.pysio.online/script.js',
          'data-website-id': 'dcab8ed3-861e-49d8-9fc2-9af34a0ad5bf'
        }
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap",
          rel: "stylesheet",
        },
        {
          rel: "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
          integrity: "sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==",
          crossorigin: "anonymous",
          referrerpolicy: "no-referrer"
        },
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.0.0/css/flag-icons.min.css"
        }
      ]
    }
  },
})