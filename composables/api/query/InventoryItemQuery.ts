import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {InventoryItem} from "~/types/api/item/inventoryItem";
import {useFetchList} from "~/composables/api/api";
import type {InventoryItemHistory} from "~/types/api/item/inventoryItemHistory";

export default class InventoryItemQuery extends AbstractQuery<InventoryItem> {
    rootPath = "inventory-items";

    async histories(id: string, urlParams?: URLSearchParams) {
      let url = `${this.rootPath}/${id}/histories`;

      if (!urlParams) {
        urlParams = new URLSearchParams()
      }

      url += '?' + urlParams.toString()

      return useFetchList<InventoryItemHistory>(url)
    }
}
