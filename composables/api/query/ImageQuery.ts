import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Image} from "~/types/image";
import type {FetchItemData} from "~/types/api";
import {id} from "postcss-selector-parser";
import {useFetchItem} from "~/composables/api/api";

export default class ImageQuery extends AbstractQuery<Image> {
    rootPath = "images";

    async get(id: number | string): Promise<FetchItemData<Image>> {
        return useFetchItem<Image>(id.toString(), true);
    }
}
