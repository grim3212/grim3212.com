import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import redirects from './redirects.json'
import { withCspMeta } from './infra/lib/csp'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    'nuxt-link-checker',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap'
  ],
  devtools: { enabled: true },
  app: {
    rootId: 'app',
    head: {
      htmlAttrs: { lang: 'en' },
      link: [{ rel: 'icon', href: '/favicon.ico' }]
    }
  },
  css: ['~/assets/css/main.css'],
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://grim3212.com',
    name: 'Grim3212',
    indexable: true
  },
  // Only used while building: the server reads the Grim Pack export from here (server/utils/grimpack.ts).
  runtimeConfig: {
    grimpackDir: fileURLToPath(new URL('./public/assets/grimpack', import.meta.url))
  },
  // Pages the old site had that are gone now; each sends you to the home page.
  routeRules: Object.fromEntries(
    Object.entries(redirects).map(([from, to]) => [from, { redirect: { to, statusCode: 301 } }])
  ),
  compatibilityDate: '2026-10-29',
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', ...Object.keys(redirects)]
    },
    hooks: {
      // Give every generated page a CSP that allows exactly its own inline scripts.
      'prerender:generate'(route) {
        if (typeof route.contents === 'string' && route.fileName?.endsWith('.html')) {
          route.contents = withCspMeta(route.contents)
        }
      }
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },
  eslint: {
    config: {
      stylistic: {
        indent: 2,
        quotes: 'single',
        semi: false,
        commaDangle: 'only-multiline'
      }
    }
  },
  linkChecker: {
    // The Grim Pack's URLs and section anchors come from the mod's own ids (chunk_loader, #cookOre)
    // and must not change.
    skipInspections: ['no-underscores', 'no-uppercase-chars']
  },
})
