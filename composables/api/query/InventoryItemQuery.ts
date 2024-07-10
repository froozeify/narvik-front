import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {InventoryItem} from "~/types/inventoryItem";

export default class InventoryItemQuery extends AbstractQuery<InventoryItem> {
    rootPath = "inventory-items";
}
