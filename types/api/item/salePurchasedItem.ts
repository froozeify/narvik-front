import type {TimestampItem} from "~/types/api/timestampItem";
import type {InventoryItem} from "~/types/api/item/inventoryItem";
import type {Sale} from "~/types/api/item/sale";

export interface SalePurchasedItem extends TimestampItem {
  item?: InventoryItem|string|null;
  sale?: Sale|null;

  itemName?: string|null;
  itemCategory?: string|null;
  itemPrice?: string|null;
  quantity?: number|null
}
