import type {Ref} from "vue";
import type {Config} from "~/types/api/item/config";
import ImageQuery from "~/composables/api/query/ImageQuery";
import ConfigQuery from "~/composables/api/query/ConfigQuery";
import {useSelfMemberStore} from "~/stores/useSelfMember";
import type {Image} from "~/types/api/item/image";

export const useAppConfigStore = defineStore('appConfig', () => {
	const config: Ref<Config | null> = ref(null)

	// Not exposed
	const logoImage: Ref<Image | null> = ref(null)

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

	async function refresh(requireLogin?: boolean) {
		const selfStore = useSelfMemberStore()

		if (requireLogin == undefined) requireLogin = selfStore.isLogged()

		const configQuery = new ConfigQuery();
		const { retrieved } = await configQuery.get(requireLogin)
		if (retrieved) {
			config.value = retrieved
		}
	}

	return {
		config,

		refresh,
		getLogo,
	}
})
