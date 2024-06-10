import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Inventoryitem} from "~/types/inventoryitem";

export default class InventoryItemQuery extends AbstractQuery<Inventoryitem> {
    rootPath = "inventory-items";
}
