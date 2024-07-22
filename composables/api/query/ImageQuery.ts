import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Image} from "~/types/api/item/image";
import type {FetchItemData} from "~/types/api/api";
import {id} from "postcss-selector-parser";
import {useFetchItem} from "~/composables/api/api";

export default class ImageQuery extends AbstractQuery<Image> {
    rootPath = "images";

    async get(id: number | string) {
        return useFetchItem<Image>(id.toString(), true);
    }

    async getPublic(id: number | string, useCache: boolean = true) {
        return useFetchItem<Image>(`public/${this.rootPath}/${id.toString()}`, useCache, false);
    }
}
