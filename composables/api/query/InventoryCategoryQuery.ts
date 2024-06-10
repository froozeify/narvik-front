import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {InventoryCategory} from "~/types/inventorycategory";

export default class InventoryCategoryQuery extends AbstractQuery<InventoryCategory> {
    rootPath = "inventory-categories";
}
