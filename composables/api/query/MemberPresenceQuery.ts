import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {MemberPresence} from "~/types/memberpresence";
import type {FetchAllData} from "~/types/api";
import {useFetchList, useUploadFile} from "~/composables/api/api";

export default class MemberPresenceQuery extends AbstractQuery<MemberPresence> {
    rootPath = "member-presences";

    async getPresentToday(): Promise<FetchAllData<MemberPresence>> {
        return useFetchList<MemberPresence>(this.rootPath + "/-/today");
    }

    async importFromCerbere(formData: FormData) {
        return useUploadFile(this.rootPath + "/-/from-cerbere", formData)
    }
}
