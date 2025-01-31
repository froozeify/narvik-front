import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {MemberPresence} from "~/types/api/item/clubDependent/plugin/presence/memberPresence";
import type {FetchAllData} from "~/types/api/api";
import {useFetchList, useGetCsv, usePost, useUploadFile} from "~/composables/api/api";
import type {Member} from "~/types/api/item/clubDependent/member";
import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";

export default class MemberPresenceQuery extends AbstractClubDependentQuery<MemberPresence, MemberPresence> {
    rootPath = "member-presences";

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

    async getPresentToday(): Promise<FetchAllData<MemberPresence>> {
        return useFetchList<MemberPresence>(this.getRootUrl() + "/-/today");
    }

    async importFromCerbere(formData: FormData) {
        return useUploadFile(this.getRootUrl() + "/-/from-cerbere", formData)
    }

    async importFromExternalPresences() {
        return usePost(`${this.getRootUrl()}/-/import-from-external-presences`, {});
    }

    async importFromCsv(formData: FormData) {
        return useUploadFile(this.getRootUrl() + "/-/from-csv", formData)
    }
}
