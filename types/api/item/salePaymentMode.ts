import type {UuidItem} from "~/types/api/uuidItem";

export interface SalePaymentMode extends UuidItem {
  name?: string;
  icon?: string;
  available?: boolean;
  weight?: number;
}
