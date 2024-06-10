import type {Item} from "./item";

export interface InventoryCategory extends Item {
  name?: string;
  weight?: number;
}
