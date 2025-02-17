import type {InventoryItem} from "~/types/api/item/clubDependent/plugin/sale/inventoryItem";
import type {UuidItem} from "~/types/api/uuidItem";
import type {ClubLinkedItem} from "~/types/api/clubLinkedItem";

export interface InventoryCategory extends UuidItem, ClubLinkedItem {
  name?: string;
  weight?: number;
  items?: InventoryItem[];
}
