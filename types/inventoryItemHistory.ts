import type {Item} from "./item";
import type {InventoryItem} from "~/types/inventoryItem";

export interface InventoryItemHistory extends Item {
  item?: InventoryItem;

  purchasePrice?: string;
  sellingPrice?: string;
  date?: Date;
}
