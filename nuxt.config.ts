// https://nuxt.com/docs/api/configuration/nuxt-config
import pkg from './package.json'

export default defineNuxtConfig({
  compatibilityDate: '2024-07-15',
  future: {
    compatibilityVersion: 4
  },

  devtools: {enabled: true},
  devServer: {
    https: true,
    host: "0.0.0.0" // Expose to local network
  },

  ssr: false,

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/image',
    'nuxt-api-party',
    '@nuxtjs/turnstile',
  ],

  ui: {
    global: true,
  },

  css: [
    '~/assets/css/main.css'
  ],

  piniaPluginPersistedstate: {
    storage: 'localStorage',
    key: 'narvik_%id',
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
})
