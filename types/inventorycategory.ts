import type {Item} from "./item";
import type {InventoryItem} from "~/types/inventoryItem";

export interface InventoryCategory extends Item {
  name?: string;
  weight?: number;
  items?: InventoryItem[];
}
