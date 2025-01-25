import type {Ref} from "vue";
import type {Config} from "~/types/api/item/config";
import ImageQuery from "~/composables/api/query/ImageQuery";
import ConfigQuery from "~/composables/api/query/ConfigQuery";
import {useSelfUserStore} from "~/stores/useSelfUser";
import type {Image} from "~/types/api/item/image";
import type {ConfigValue} from "~/types/api/configValue";
import {defineStore} from "pinia";
import {isDarkMode} from "~/utils/browser";

export const useAppConfigStore = defineStore('appConfig', () => {
	const config: Ref<Config | null> = ref(null)

	// Not exposed
	const logoImage: Ref<string> = ref('')
  setLogoImage(isDarkMode().value)
  watch(isDarkMode(), (value) => {
    setLogoImage(value)
  })

  function setLogoImage(isDark: boolean) {
    if (isDark) {
      logoImage.value = '/logo-narvik-white.png'
    } else {
      logoImage.value = '/logo-narvik.png'
    }
  }

  async function refresh(requireLogin?: boolean) {
    const selfStore = useSelfUserStore()

    if (requireLogin == undefined) requireLogin = selfStore.isLogged()

    const configQuery = new ConfigQuery();
    const { retrieved } = await configQuery.get(requireLogin)
    if (retrieved) {
      config.value = retrieved
    }
  }

	function getLogo(): Ref<string> {
		return logoImage
	}

  function getModuleConfig(name: string): Ref<ConfigValue|null> {
    if (!config.value || !config.value.modules || !config.value.modules[name]) {
      return ref(null)
    }

    return ref(config.value.modules[name])
  }

	return {
		config,

		refresh,
		getLogo,
    getModuleConfig,
	}
})
