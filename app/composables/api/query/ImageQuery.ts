import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Image} from "~/types/api/item/image";
import type {FetchItemData} from "~/types/api/api";
import {id} from "postcss-selector-parser";
import {useFetchItem} from "~/composables/api/api";

export default class ImageQuery extends AbstractQuery<Image, Image> {
    rootPath = "images";

    async getPublic(id: number | string, useCache: boolean = true) {
        return useFetchItem<Image>(`public/${this.getRootUrl()}/${id.toString()}`, useCache, false);
    }

    async getFromUrl(url: string) {
      return useFetchItem<Image>(url, false);
    }
}
