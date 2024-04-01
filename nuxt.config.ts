// https://nuxt.com/docs/api/configuration/nuxt-config
import pkg from './package.json'

export default defineNuxtConfig({
	devtools: { enabled: true },
	ssr: false,
	modules: [
		'@nuxt/ui',
		'@pinia/nuxt',
		'nuxt-api-party'
	],
	ui: {
		global: true,
		icons: ['mdi', 'simple-icons'],
	},
	css: [
		'~/assets/css/main.scss'
	],
	app: {
		head: {
			titleTemplate: 'Narvik',
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
})
