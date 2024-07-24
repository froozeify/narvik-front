import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {GlobalSetting} from "~/types/api/item/globalSetting";
import {useFetchItem, useUploadFile} from "~/composables/api/api";
import type {FetchItemData} from "~/types/api/api";

export default class GlobalSettingQuery extends AbstractQuery<GlobalSetting> {
    rootPath = "global-settings";

    async importLogo(formData: FormData) {
        return useUploadFile(this.rootPath + "/-/logo", formData)
    }

    async getPublic(id: number|string, useCache: boolean = false) {
        return useFetchItem<GlobalSetting>(`public/${this.rootPath}/${id}`, useCache, false);
    }
}
