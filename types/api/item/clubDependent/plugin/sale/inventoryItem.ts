import type {InventoryCategory} from "~/types/api/item/clubDependent/plugin/sale/inventoryCategory";
import type {TimestampItem} from "~/types/api/timestampItem";
import type {UuidItem} from "~/types/api/uuidItem";
import type {ClubLinkedItem} from "~/types/api/clubLinkedItem";

export interface InventoryItem extends UuidItem, ClubLinkedItem, TimestampItem {
  category?: InventoryCategory|null;

  name?: string;
  description?: string;
  canBeSold?: boolean;
  purchasePrice?: string;
  sellingPrice?: string;
  sellingQuantity?: number;
  quantity?: number|null
  quantityAlert?: number|null
  barcode?: string;
}
