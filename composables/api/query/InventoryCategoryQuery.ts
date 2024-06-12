import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {InventoryCategory} from "~/types/inventorycategory";
import {usePut} from "~/composables/api/api";

export default class InventoryCategoryQuery extends AbstractQuery<InventoryCategory> {
    rootPath = "inventory-categories";

  async move(category: InventoryCategory, direction: string) {
    return usePut(this.rootPath + "/" + category.id + "/move", {direction: direction});
  }
}
