import type {InventoryItem} from "~/types/api/item/inventoryItem";
import type {UuidItem} from "~/types/api/uuidItem";

export interface InventoryCategory extends UuidItem {
  name?: string;
  weight?: number;
  items?: InventoryItem[];
}
