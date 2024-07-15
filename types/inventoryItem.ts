import type {InventoryCategory} from "~/types/inventorycategory";
import type {TimestampItem} from "~/types/timestampItem";

export interface InventoryItem extends TimestampItem {
  category?: InventoryCategory|null;

  name?: string;
  description?: string;
  canBeSold?: boolean;
  purchasePrice?: string;
  sellingPrice?: string;
  sellingQuantity?: number;
  quantity?: number|null
  barcode?: string;
}
