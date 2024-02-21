import ImageQuery from "~/composables/api/query/ImageQuery";
import GlobalSettingQuery from "~/composables/api/query/GlobalSettingQuery";
import type {Image} from "~/types/image";

const globalSettingQuery = new GlobalSettingQuery()
export const useImageLogo: Ref<Image | null> = ref(null)

export function useLoadImageLogo(useCache: boolean = true) {
	globalSettingQuery.getPublic("LOGO", useCache).then(value => {
		if (value.retrieved && value.retrieved.value) {
			// No logo
			if (!value.retrieved.value.value) {
				useImageLogo.value = null
				return;
			}

			const imageQuery = new ImageQuery()
			imageQuery.getPublic(value.retrieved.value.value, useCache).then(imageQueryResponse => {
				if (imageQueryResponse.retrieved && imageQueryResponse.retrieved.value) {
					useImageLogo.value = imageQueryResponse.retrieved.value
				}
			})
		}
	})
}
