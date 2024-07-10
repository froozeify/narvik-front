import type {Item} from "./item";
import type {InventoryCategory} from "~/types/inventorycategory";

export interface InventoryItem extends Item {
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
