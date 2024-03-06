import type {Image} from "~/types/image";
import {useSelfMemberStore} from "~/stores/useSelfMember";

export function useSetSiteFavicon() {
	const selfStore = useSelfMemberStore()
	const siteLogo: Ref<Image|null> = selfStore.getSiteLogo()

	injectFavicon(siteLogo.value)

	watch(siteLogo, (newValue, oldValue) => {
		injectFavicon(newValue)
	})
}

function injectFavicon(favicon: Image|null) {
	if (favicon && favicon.mimeType && favicon.base64) {
		useHead({
			link: [
				{
					key: 'favicon',
					rel: 'icon',
					type: favicon.mimeType,
					href: favicon.base64
				}
			]
		})
	} else {
		useHead({
			link: [
				{
					key: 'favicon',
					rel: 'icon',
					type: 'image/x-icon',
					href: '/favicon.ico'
				}
			]
		})
	}
}
