import type {Ref} from "vue";
import type {Config} from "~/types/api/item/config";
import ImageQuery from "~/composables/api/query/ImageQuery";
import ConfigQuery from "~/composables/api/query/ConfigQuery";
import {useSelfMemberStore} from "~/stores/useSelfMember";
import type {Image} from "~/types/api/item/image";
import type {ConfigValue} from "~/types/api/configValue";

export const useAppConfigStore = defineStore('appConfig', () => {
	const config: Ref<Config | null> = ref(null)

	// Not exposed
	const logoImage: Ref<Image | null> = ref(null)

  async function refresh(requireLogin?: boolean) {
    const selfStore = useSelfMemberStore()

    if (requireLogin == undefined) requireLogin = selfStore.isLogged()

    const configQuery = new ConfigQuery();
    const { retrieved } = await configQuery.get(requireLogin)
    if (retrieved) {
      config.value = retrieved
    }
  }

	function getLogo(useCache: boolean = true): Ref<Image|null> {
		if (useCache && logoImage.value) {
			return logoImage
		}

		// No logo defined in the config
		if (!config.value || !config.value.logo) {
			return ref(null)
		}

		const imageQuery = new ImageQuery();
		imageQuery.getPublic(config.value.logo, useCache).then(imageQueryResponse => {
			if (imageQueryResponse.retrieved && imageQueryResponse.retrieved) {
				logoImage.value = imageQueryResponse.retrieved
			}
		})

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
