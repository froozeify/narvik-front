import {useCreateItem, useDeleteItem, useFetchItem, useFetchList, usePatchItem} from "~/composables/api/api";
import type {FetchAllData, FetchItemData} from "~/types/api";
import type {Item} from "~/types/item";

export abstract class AbstractQuery<T> {
	protected abstract rootPath: string;

	async get(id: number|string, useCache: boolean = false, requireLogin: boolean = true): Promise<FetchItemData<T>> {
		return useFetchItem<T>(this.rootPath + "/" + id, useCache, requireLogin);
	}

	async getAll(urlParams?: URLSearchParams): Promise<FetchAllData<T>> {
		let url = this.rootPath;
		if (urlParams) {
			url += '?' + urlParams.toString()
		}
		return useFetchList<T>(url);
	}

	async post(payload: Item) {
		return useCreateItem<T>(this.rootPath, payload)
	}

	async patch(item: Item, payload: Item) {
		return usePatchItem<T>(item, payload)
	}

	async delete(item: Item | null) {
		return useDeleteItem(item)
	}
}
