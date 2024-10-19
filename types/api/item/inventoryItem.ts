import type {InventoryCategory} from "~/types/api/item/inventoryCategory";
import type {TimestampItem} from "~/types/api/timestampItem";
import type {UuidItem} from "~/types/api/uuidItem";

export interface InventoryItem extends UuidItem, TimestampItem {
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
