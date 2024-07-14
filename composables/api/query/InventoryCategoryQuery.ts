import type {InventoryCategory} from "~/types/inventorycategory";
import {AbstractSortableQuery} from "~/composables/api/query/AbstractSortableQuery";

export default class InventoryCategoryQuery extends AbstractSortableQuery<InventoryCategory> {
    rootPath = "inventory-categories";
}
