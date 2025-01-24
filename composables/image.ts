import type {Image} from "~/types/api/item/image";
import {useSelfMemberStore} from "~/stores/useSelfMember";
import {useAppConfigStore} from "~/stores/useAppConfig";

// export function useSetSiteFavicon() {
// 	const appConfigStore = useAppConfigStore()
// 	const siteLogo: Ref<Image|null> = appConfigStore.getLogo()
//
// 	injectFavicon(siteLogo.value)
//
// 	watch(siteLogo, (newValue, oldValue) => {
// 		injectFavicon(newValue)
// 	})
// }
//
// function injectFavicon(favicon: Image|null) {
// 	if (favicon && favicon.mimeType && favicon.base64) {
// 		useHead({
// 			link: [
// 				{
// 					key: 'favicon',
// 					rel: 'icon',
// 					type: favicon.mimeType,
// 					href: favicon.base64
// 				}
// 			]
// 		})
// 	} else {
// 		useHead({
// 			link: [
// 				{
// 					key: 'favicon',
// 					rel: 'icon',
// 					type: 'image/x-icon',
// 					href: '/favicon.ico'
// 				}
// 			]
// 		})
// 	}
// }
