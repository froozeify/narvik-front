import type {InventoryItem} from "~/types/api/item/inventoryItem";
import type {TimestampItem} from "~/types/api/timestampItem";

export interface InventoryItemHistory extends TimestampItem {
  item?: InventoryItem;

  purchasePrice?: string;
  sellingPrice?: string;
}
