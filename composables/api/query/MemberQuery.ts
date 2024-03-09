import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Member} from "~/types/member";
import type {FetchAllData} from "~/types/api";
import {useFetchItem, useFetchList, usePost, usePut, useUpdateItem, useUploadFile} from "~/composables/api/api";
import type {MemberPresence} from "~/types/memberpresence";

export default class MemberQuery extends AbstractQuery<Member> {
    rootPath = "members";

    async self() {
        return useFetchItem<Member>('/self');
    }

    async selfUpdatePassword(currentPassword: string, newPassword: string) {
        return usePut('/self/update-password', {current: currentPassword, new: newPassword});
    }

    async search(query: string) {
        return usePost<Member[]>(`${this.rootPath}/-/search`, {query});
    }

    async importFromItac(formData: FormData) {
        return useUploadFile(this.rootPath + "/-/from-itac", formData)
    }

    async importFromItacSecondary(formData: FormData) {
        return useUploadFile(this.rootPath + "/-/secondary-from-itac", formData)
    }

    async importPhotosFromItac(formData: FormData) {
        return useUploadFile(this.rootPath + "/-/photos-from-itac", formData)
    }

    async presences(id: number|string, urlParams?: URLSearchParams) {
        let url = `${this.rootPath}/${id}/presences`;

        if (!urlParams) {
            urlParams = new URLSearchParams()
        }
        if (!urlParams.has('pagination')) {
            urlParams.append('pagination', 'false')
        }

        url += '?' + urlParams.toString()

        return useFetchList<MemberPresence>(url)
    }
}
