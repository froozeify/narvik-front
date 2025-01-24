import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {MemberPresence} from "~/types/api/item/clubDependent/plugin/presence/memberPresence";
import type {FetchAllData} from "~/types/api/api";
import {useFetchList, useGetCsv, usePost, useUploadFile} from "~/composables/api/api";
import type {Member} from "~/types/api/item/clubDependent/member";

export default class MemberPresenceQuery extends AbstractQuery<MemberPresence> {
    rootPath = "member-presences";

    async getAllCsv(urlParams?: URLSearchParams) {
        let url = `${this.rootPath}.csv`;

        if (!urlParams) {
            urlParams = new URLSearchParams()
        }
        if (!urlParams.has('pagination')) {
            urlParams.append('pagination', 'false')
        }

        url += '?' + urlParams.toString()

        return useGetCsv(url)
    }

    async getPresentToday(): Promise<FetchAllData<MemberPresence>> {
        return useFetchList<MemberPresence>(this.rootPath + "/-/today");
    }

    async importFromCerbere(formData: FormData) {
        return useUploadFile(this.rootPath + "/-/from-cerbere", formData)
    }

    async importFromExternalPresences() {
        return usePost(`${this.rootPath}/-/import-from-external-presences`, {});
    }

    async importFromCsv(formData: FormData) {
        return useUploadFile(this.rootPath + "/-/from-csv", formData)
    }
}
