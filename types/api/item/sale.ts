import type {TimestampItem} from "~/types/api/timestampItem";
import type {Member} from "~/types/api/item/member";
import type {SalePaymentMode} from "~/types/api/item/salePaymentMode";
import type {SalePurchasedItem} from "~/types/api/item/salePurchasedItem";
import type {UuidItem} from "~/types/api/uuidItem";

export interface Sale extends UuidItem, TimestampItem {
  seller?: Member|string|null;
  paymentMode?: SalePaymentMode|string|null;

  salePurchasedItems?: SalePurchasedItem[]

  comment?: string|null;
  price?: string|null;
}
