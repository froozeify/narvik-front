// https://nuxt.com/docs/api/configuration/nuxt-config
import pkg from './package.json'

export default defineNuxtConfig({
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2024-11-27',

  ssr: false,

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'nuxt-api-party',
    '@nuxtjs/turnstile',
    '@nuxtjs/seo',
  ],

  css: ['~/assets/css/main.css'],

  piniaPluginPersistedstate: {
    storage: 'localStorage',
    key: 'narvik_%id',
  },

  site: {
    name: 'Narvik',
  },

  app: {
    head: {
      titleTemplate: 'Narvik',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      clientVersion: pkg.version,
      clientId: '', // can be overridden by NUXT_PUBLIC_CLIENT_ID environment variable
      clientSecret: '', // can be overridden by NUXT_PUBLIC_CLIENT_SECRET environment variable

      badgerClientId: '', // can be overridden by NUXT_PUBLIC_BADGER_CLIENT_ID environment variable
      badgerClientSecret: '', // can be overridden by NUXT_PUBLIC_BADGER_CLIENT_SECRET environment variable

      clientTurnstile: false,

      umamiEnabled: false,// can be overridden by NUXT_PUBLIC_UMAMI_ENABLED environment variable
      umamiScript: '',// can be overridden by NUXT_PUBLIC_UMAMI_SCRIPT environment variable
      umamiWebsiteId: '',// can be overridden by NUXT_PUBLIC_UMAMI_WEBSITE_ID environment variable
    },

    apiParty: {
      endpoints: {
        localApi: {
          url: 'http://php',
        }
      }
    }
  },

  turnstile: {
    siteKey: '',
    addValidateEndpoint: false
  },

  // Require ssr, so we disable it
  ogImage: {
    enabled: false
  },

  robots: {
    disallow: ['*'],
    allow: ['/login', '/login/**'],
  }
})
