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
  modules: ['@nuxtjs/sitemap', '@nuxt/image'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
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
          },
          {
            url: '/root-dns',
            changefreq: 'daily',
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
        'data-theme': 'light'
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
        {
          innerHTML: `
            // 强制亮色模式
            if (typeof document !== 'undefined') {
              document.documentElement.setAttribute('data-theme', 'light');
              document.documentElement.style.colorScheme = 'light only';
              // 阻止任何暗色模式切换
              const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                  if (mutation.attributeName === 'data-theme' || mutation.attributeName === 'class') {
                    if (document.documentElement.getAttribute('data-theme') !== 'light') {
                      document.documentElement.setAttribute('data-theme', 'light');
                    }
                  }
                });
              });
              observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-theme', 'class']
              });
            }
          `
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
