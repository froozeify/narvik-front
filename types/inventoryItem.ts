import type {Item} from "./item";
import type {InventoryCategory} from "~/types/inventorycategory";

export interface Inventoryitem extends Item {
  category?: InventoryCategory;

  name?: string;
  description?: string;
  canBeSold?: boolean;
  purchasePrice?: string;
  sellingPrice?: string;
  sellingQuantity?: number;
  quantity?: number|null
  barcode?: string;
}
