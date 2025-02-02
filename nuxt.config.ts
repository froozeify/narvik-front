// https://nuxt.com/docs/api/configuration/nuxt-config
import pkg from './package.json'

export default defineNuxtConfig({
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
  ],

  ui: {
    global: true,
  },

  css: [
    '~/assets/css/main.scss'
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
      clientVersion: pkg.version
    },

    apiParty: {
      endpoints: {
        localApi: {
          url: 'http://php'
        }
      }
    }
  },

  compatibilityDate: '2024-07-15',
})
