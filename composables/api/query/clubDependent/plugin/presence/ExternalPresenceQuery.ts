import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {FetchAllData} from "~/types/api/api";
import {useFetchList, useGetCsv, useUploadFile} from "~/composables/api/api";
import type {ExternalPresence} from "~/types/api/item/clubDependent/plugin/presence/externalPresence";
import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";

export default class ExternalPresenceQuery extends AbstractClubDependentQuery<ExternalPresence, ExternalPresence> {
  rootPath = "external-presences";

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

  async getPresentToday(): Promise<FetchAllData<ExternalPresence>> {
    return useFetchList<ExternalPresence>(this.getRootUrl() + "/-/today");
  }

  async importFromCsv(formData: FormData) {
    return useUploadFile(this.getRootUrl() + "/-/from-csv", formData)
  }
}
