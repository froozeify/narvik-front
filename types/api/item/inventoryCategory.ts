import type {Item} from "../item";
import type {InventoryItem} from "~/types/api/item/inventoryItem";

export interface InventoryCategory extends Item {
  name?: string;
  weight?: number;
  items?: InventoryItem[];
}
