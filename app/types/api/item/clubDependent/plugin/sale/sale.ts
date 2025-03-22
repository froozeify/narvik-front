import type {TimestampItem} from "~/types/api/timestampItem";
import type {Member} from "~/types/api/item/clubDependent/member";
import type {SalePaymentMode} from "~/types/api/item/clubDependent/plugin/sale/salePaymentMode";
import type {SalePurchasedItem} from "~/types/api/item/clubDependent/plugin/sale/salePurchasedItem";
import type {UuidItem} from "~/types/api/uuidItem";
import type {ClubLinkedItem} from "~/types/api/clubLinkedItem";

export interface Sale extends UuidItem, ClubLinkedItem, TimestampItem {
  seller?: Member|string|null;
  paymentMode?: SalePaymentMode|string|null;

  salePurchasedItems?: SalePurchasedItem[]

  comment?: string|null;
  price?: string|null;
}
