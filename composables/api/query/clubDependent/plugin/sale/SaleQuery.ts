import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Sale} from "~/types/api/item/clubDependent/plugin/sale/sale";
import {useGetCsv} from "~/composables/api/api";
import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";

export default class SaleQuery extends AbstractClubDependentQuery<Sale> {
  rootPath = "sales";

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
}
