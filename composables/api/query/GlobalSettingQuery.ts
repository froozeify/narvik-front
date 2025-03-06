import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {GlobalSetting} from "~/types/api/item/globalSetting";
import {useFetchItem, usePost, useUploadFile} from "~/composables/api/api";
import type {FetchItemData} from "~/types/api/api";
import type {SmtpConfig} from "~/types/api/smtp";

export default class GlobalSettingQuery extends AbstractQuery<GlobalSetting, GlobalSetting> {
    rootPath = "global-settings";

    async importLogo(formData: FormData) {
        return useUploadFile(this.rootPath + "/-/logo", formData)
    }

    async getPublic(id: number|string, useCache: boolean = false) {
        return useFetchItem<GlobalSetting>(`public/${this.rootPath}/${id}`, useCache, false);
    }

    async updateSmtpConfig(config: SmtpConfig) {
      return usePost(this.rootPath + "/-/smtp", config)

    }

    async testSmtp(email: string) {
      return usePost(this.rootPath + "/-/test-email", {to: email})
    }
}
