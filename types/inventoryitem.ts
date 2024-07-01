import type {Item} from "./item";
import type {InventoryCategory} from "~/types/inventorycategory";

export interface Inventoryitem extends Item {
  category?: InventoryCategory;

  name?: string;
  description?: string;
  purchasePrice?: string;
  sellingPrice?: string;
  canBeSold?: boolean;
  quantity?: number
}
