import type {InventoryCategory} from "~/types/api/item/inventoryCategory";
import type {TimestampItem} from "~/types/api/timestampItem";

export interface InventoryItem extends TimestampItem {
  category?: InventoryCategory|null;

  name?: string;
  description?: string;
  canBeSold?: boolean;
  purchasePrice?: string;
  sellingPrice?: string;
  sellingQuantity?: number;
  quantity?: number|null
  quantityAlert?: number|null
  barcode?: string;
}
