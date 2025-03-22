import {useCreateItem, useDeleteItem, useFetchItem, useFetchList, useGetCsv, usePatchItem} from "~/composables/api/api";
import type {FetchAllData, FetchItemData} from "~/types/api/api";
import type {Item} from "~/types/api/item";
import {useSelfUserStore} from "~/stores/useSelfUser";

export abstract class AbstractQuery<R, W> {
	protected abstract rootPath: string;

  protected getRootUrl(): string {
    return this.rootPath;
  }

  protected getCurrentClubPath(): string {
    const selfStore = useSelfUserStore()

    const profile = selfStore.selectedProfile
    if (profile === undefined || !profile.club["@id"]) {
      throw new Error("No profile selected")
    }
    return profile.club["@id"]
  }

	async get(id: string, useCache: boolean = false, requireLogin: boolean = true): Promise<FetchItemData<R>> {
		return useFetchItem<R>(this.getRootUrl() + "/" + id, useCache, requireLogin);
	}

	async getAll(urlParams?: URLSearchParams): Promise<FetchAllData<R>> {
		let url = this.getRootUrl();
		if (urlParams) {
			url += '?' + urlParams.toString()
		}
		return useFetchList<R>(url);
	}

  async getAllCsv(urlParams?: URLSearchParams) {
    let url = `${this.getRootUrl()}.csv`;

    if (!urlParams) {
      urlParams = new URLSearchParams()
    }
    if (!urlParams.has('pagination')) {
      urlParams.append('pagination', 'false')
    }

    url += '?' + urlParams.toString()

    return useGetCsv(url)
  }

	async post(payload: Item) {
		return useCreateItem<W>(this.getRootUrl(), payload)
	}

	async patch(item: Item, payload: Item) {
		return usePatchItem<R>(item, payload)
	}

	async delete(item?: Item | null) {
		return useDeleteItem(item)
	}
}
