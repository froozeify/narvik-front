import type {Item} from "./item";
import type {Inventoryitem} from "~/types/inventoryitem";

export interface InventoryCategory extends Item {
  name?: string;
  weight?: number;
  items?: Inventoryitem[];
}
