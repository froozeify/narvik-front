import type {InventoryItem} from "~/types/inventoryItem";
import type {TimestampItem} from "~/types/timestampItem";

export interface InventoryItemHistory extends TimestampItem {
  item?: InventoryItem;

  purchasePrice?: string;
  sellingPrice?: string;
}
