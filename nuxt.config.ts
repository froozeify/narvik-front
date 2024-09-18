// https://nuxt.com/docs/api/configuration/nuxt-config
import pkg from './package.json'

export default defineNuxtConfig({
  devtools: {enabled: true},
  ssr: false,

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    'nuxt-api-party',
    '@nuxtjs/turnstile',
    '@nuxt/scripts',
  ],

  ui: {
    global: true,
  },

  css: [
    '~/assets/css/main.scss'
  ],

  app: {
    head: {
      titleTemplate: 'Narvik',
    }
  },

  turnstile: {
    addValidateEndpoint: true
  },

  runtimeConfig: {
    public: {
      clientVersion: pkg.version,
      clientTurnstile: false
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
