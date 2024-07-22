import type {ExternalPresence} from "~/types/api/item/externalPresence";
import ExternalPresenceQuery from "~/composables/api/query/ExternalPresenceQuery";

export const useExternalPresenceStore = defineStore('externalPresence', () => {
	const isRefreshing = ref(false)
	const list: Ref<ExternalPresence[] | undefined> = ref(undefined)

	const modalOpen: Ref<boolean> = ref(false);

	async function refresh() {
		isRefreshing.value = true
		const externalPresenceQuery = new ExternalPresenceQuery();
		const { items } = await externalPresenceQuery.getPresentToday()
		if (items) {
			list.value = items
		}
		isRefreshing.value = false
	}

	function addItem(newItem: ExternalPresence) {
		if (list.value) {
			list.value.unshift(newItem)
		}
	}

	function updateItem(updatedItem: ExternalPresence) {
		const item: ExternalPresence | undefined = list.value?.find(
			(i) => i["@id"] === updatedItem["@id"]
		);

		if (!item) return;
		Object.assign(item, updatedItem);
	}

	function deleteItem(deletedItem: ExternalPresence) {
		list.value = list.value?.filter((item) => {
			return item["@id"] !== deletedItem["@id"]
		})
	}

	return {
		isRefreshing,
		list,
		modalOpen,
		addItem,
		refresh,
		updateItem,
		deleteItem
	}
})
