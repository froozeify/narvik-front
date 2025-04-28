import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {ExposedFile} from "~/types/api/item/exposedFile";
import {useFetchItem} from "~/composables/api/api";

export default class FileQuery extends AbstractQuery<ExposedFile, ExposedFile> {
    rootPath = "files";

    async getPublic(id: number | string, useCache: boolean = true) {
        return useFetchItem<ExposedFile>(`public/${this.getRootUrl()}/${id.toString()}`, useCache, false);
    }

    async getFromUrl(url: string) {
      return useFetchItem<ExposedFile>(url, false);
    }
}
