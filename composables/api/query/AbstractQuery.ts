import {useCreateItem, useDeleteItem, useFetchItem, useFetchList, usePatchItem} from "~/composables/api/api";
import type {FetchAllData, FetchItemData} from "~/types/api/api";
import type {Item} from "~/types/api/item";

export abstract class AbstractQuery<T> {
	protected abstract rootPath: string;

  protected getRootUrl(): string {
    return this.rootPath;
  }

	async get(id: string, useCache: boolean = false, requireLogin: boolean = true): Promise<FetchItemData<T>> {
		return useFetchItem<T>(this.getRootUrl() + "/" + id, useCache, requireLogin);
	}

	async getAll(urlParams?: URLSearchParams): Promise<FetchAllData<T>> {
		let url = this.getRootUrl();
		if (urlParams) {
			url += '?' + urlParams.toString()
		}
		return useFetchList<T>(url);
	}

	async post(payload: Item) {
		return useCreateItem<T>(this.getRootUrl(), payload)
	}

	async patch(item: Item, payload: Item) {
		return usePatchItem<T>(item, payload)
	}

	async delete(item?: Item | null) {
		return useDeleteItem(item)
	}
}
