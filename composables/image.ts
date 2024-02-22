import type {Image} from "~/types/image";
import {useSelfMemberStore} from "~/stores/useSelfMember";

export function useSetSiteFavicon() {
	const selfStore = useSelfMemberStore()
	const siteLogo: Ref<Image|null> = selfStore.getSiteLogo()

	watch(siteLogo, (newValue, oldValue) => {
		if (newValue && newValue.mimeType && newValue.base64) {
			useHead({
				link: [
					{
						key: 'logo',
						rel: 'icon',
						type: newValue.mimeType,
						href: newValue.base64
					}
				]
			})
		}
	})
}
