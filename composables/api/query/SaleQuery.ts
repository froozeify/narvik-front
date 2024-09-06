import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Sale} from "~/types/api/item/sale";
import {useGetCsv} from "~/composables/api/api";

export default class SaleQuery extends AbstractQuery<Sale> {
  rootPath = "sales";

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
}
