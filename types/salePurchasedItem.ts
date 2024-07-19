import type {TimestampItem} from "~/types/timestampItem";
import type {InventoryItem} from "~/types/inventoryItem";
import type {Sale} from "~/types/sale";

export interface SalePurchasedItem extends TimestampItem {
  item?: InventoryItem|string|null;
  sale?: Sale|null;

  itemName?: string|null;
  itemCategory?: string|null;
  itemPrice?: string|null;
  quantity?: number|null
}
