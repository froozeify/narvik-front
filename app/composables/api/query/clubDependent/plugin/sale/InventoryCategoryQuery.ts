import type {InventoryCategory} from "~/types/api/item/clubDependent/plugin/sale/inventoryCategory";
import {AbstractSortableQuery} from "~/composables/api/query/AbstractSortableQuery";

export default class InventoryCategoryQuery extends AbstractSortableQuery<InventoryCategory, InventoryCategory> {
    rootPath = "inventory-categories";
}
