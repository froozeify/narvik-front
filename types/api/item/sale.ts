import type {TimestampItem} from "~/types/api/timestampItem";
import type {Member} from "~/types/api/item/member";
import type {SalePaymentMode} from "~/types/api/item/salePaymentMode";
import type {SalePurchasedItem} from "~/types/api/item/salePurchasedItem";

export interface Sale extends TimestampItem {
  seller?: Member|string|null;
  paymentMode?: SalePaymentMode|string|null;

  salePurchasedItems?: SalePurchasedItem[]

  comment?: string|null;
  price?: string|null;
}
