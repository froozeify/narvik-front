import type {InventoryItem} from "~/types/api/item/clubDependent/plugin/sale/inventoryItem";
import {useFetchList} from "~/composables/api/api";
import type {InventoryItemHistory} from "~/types/api/item/clubDependent/plugin/sale/inventoryItemHistory";
import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";

export default class InventoryItemQuery extends AbstractClubDependentQuery<InventoryItem> {
    rootPath = "inventory-items";

    async histories(id: string, urlParams?: URLSearchParams) {
      let url = `${this.getRootUrl()}/${id}/histories`;

      if (!urlParams) {
        urlParams = new URLSearchParams()
      }

      url += '?' + urlParams.toString()

      return useFetchList<InventoryItemHistory>(url)
    }
}
