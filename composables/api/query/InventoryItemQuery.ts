import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {InventoryItem} from "~/types/inventoryItem";
import {useFetchList} from "~/composables/api/api";
import type {InventoryItemHistory} from "~/types/inventoryItemHistory";

export default class InventoryItemQuery extends AbstractQuery<InventoryItem> {
    rootPath = "inventory-items";

    async histories(id: number|string, urlParams?: URLSearchParams) {
      let url = `${this.rootPath}/${id}/histories`;

      if (!urlParams) {
        urlParams = new URLSearchParams()
      }

      url += '?' + urlParams.toString()

      return useFetchList<InventoryItemHistory>(url)
    }
}
