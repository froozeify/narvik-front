import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {MemberPresence} from "~/types/memberpresence";
import type {FetchAllData} from "~/types/api";
import {useFetchList, usePost, useUploadFile} from "~/composables/api/api";
import type {Member} from "~/types/member";

export default class MemberPresenceQuery extends AbstractQuery<MemberPresence> {
    rootPath = "member-presences";

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
