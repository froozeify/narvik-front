import type {Member} from "~/types/api/item/clubDependent/member";
import {
  useFetchItem,
  useFetchList,
  useGetCsv,
  usePost,
  usePostRawJson,
  usePut,
  useUploadFile
} from "~/composables/api/api";
import type {MemberPresence} from "~/types/api/item/clubDependent/plugin/presence/memberPresence";
import type {MemberSeason} from "~/types/api/item/clubDependent/memberSeason";
import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";

export default class MemberQuery extends AbstractClubDependentQuery<Member> {
  rootPath = "members";

  async passwordResetInitialise(email: string) {
    return usePostRawJson(`${this.rootPath}/-/initiate-reset-password`, {
      email: email
    });
  }

  async passwordReset(email: string, password: string, securityCode: string) {
    return usePostRawJson(`${this.rootPath}/-/reset-password`, {
      email: email,
      password: password,
      securityCode: securityCode.trim().toUpperCase()
    });
  }

  async self() {
    return useFetchItem<Member>('/self');
  }

  async selfUpdatePassword(currentPassword: string, newPassword: string) {
    return usePut('/self/update-password', {current: currentPassword, new: newPassword});
  }

  async search(query: string) {
    return usePost<Member[]>(`${this.getRootUrl()}/-/search`, {query});
  }

  async importFromItac(formData: FormData) {
    return useUploadFile(this.getRootUrl() + "/-/from-itac", formData)
  }

  async importFromItacSecondary(formData: FormData) {
    return useUploadFile(this.getRootUrl() + "/-/secondary-from-itac", formData)
  }

  async importPhotosFromItac(formData: FormData) {
    return useUploadFile(this.getRootUrl() + "/-/photos-from-itac", formData)
  }

  async seasons(id: string, urlParams?: URLSearchParams) {
    let url = `${this.getRootUrl()}/${id}/seasons`;

    if (!urlParams) {
      urlParams = new URLSearchParams()
    }

    url += '?' + urlParams.toString()

    return useFetchList<MemberSeason>(url)
  }

  async presences(id: string, urlParams?: URLSearchParams) {
    let url = `${this.getRootUrl()}/${id}/presences`;

    if (!urlParams) {
      urlParams = new URLSearchParams()
    }
    if (!urlParams.has('pagination')) {
      urlParams.append('pagination', 'false')
    }

    url += '?' + urlParams.toString()

    return useFetchList<MemberPresence>(url)
  }

  async presencesCsv(id: string, urlParams?: URLSearchParams) {
    let url = `${this.getRootUrl()}/${id}/presences.csv`;

    if (!urlParams) {
      urlParams = new URLSearchParams()
    }
    if (!urlParams.has('pagination')) {
      urlParams.append('pagination', 'false')
    }

    url += '?' + urlParams.toString()

    return useGetCsv(url)
  }
}
