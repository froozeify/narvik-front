import type {TimestampItem} from "~/types/timestampItem";
import type {Member} from "~/types/member";
import type {SalePaymentMode} from "~/types/salePaymentMode";
import type {SalePurchasedItem} from "~/types/salePurchasedItem";

export interface Sale extends TimestampItem {
  seller?: Member|null;
  paymentMode?: SalePaymentMode|string|null;

  salePurchasedItems?: SalePurchasedItem[]

  comment?: string|null;
  price?: string|null;
}
