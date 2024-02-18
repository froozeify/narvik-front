// https://nuxt.com/docs/api/configuration/nuxt-config
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
			// title: 'Narvik default',
			titleTemplate: 'Narvik'
		}
	},
	runtimeConfig: {
		public: {
			apiUrl: process.env.API_URL || 'https://localhost'
		}
	},
	apiParty: {
		endpoints: {
			localApi: {
				url: process.env.API_URL || 'https://localhost'
			}
		}
	}
})
