import type {ExternalPresence} from "~/types/externalpresence";
import ExternalPresenceQuery from "~/composables/api/query/ExternalPresenceQuery";

export const usePresenceStore = defineStore('presence', () => {
	const selectedDate: Ref<Date|null> = ref(null)

	const totalExternal: Ref<number> = ref(0)
	const totalMembers: Ref<number> = ref(0)

	const list: Ref<ExternalPresence[] | undefined> = ref(undefined)

	async function refresh() {
		const externalPresenceQuery = new ExternalPresenceQuery();
		const { items } = await externalPresenceQuery.getPresentToday()
		if (items) {
			list.value = items
		}
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
		selectedDate,
		totalExternal,
		totalMembers,

		addItem,
		refresh,
		updateItem,
		deleteItem
	}
})
