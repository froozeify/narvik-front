import type {InventoryItem} from "~/types/api/item/inventoryItem";
import type {TimestampItem} from "~/types/api/timestampItem";
import type {UuidItem} from "~/types/api/uuidItem";

export interface InventoryItemHistory extends UuidItem, TimestampItem {
  item?: InventoryItem;

  purchasePrice?: string;
  sellingPrice?: string;
}
