import type {TimestampItem} from "~/types/api/timestampItem";
import type {InventoryItem} from "~/types/api/item/clubDependent/plugin/sale/inventoryItem";
import type {Sale} from "~/types/api/item/clubDependent/plugin/sale/sale";
import type {UuidItem} from "~/types/api/uuidItem";

export interface SalePurchasedItem extends UuidItem, TimestampItem {
  item?: InventoryItem|string|null;
  sale?: Sale|null;

  itemName?: string|null;
  itemCategory?: string|null;
  itemPrice?: string|null;
  quantity?: number|null
}
