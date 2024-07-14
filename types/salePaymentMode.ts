import type {Item} from "./item";

export interface SalePaymentMode extends Item {
  name?: string;
  icon?: string;
  available?: boolean;
  weight?: number;
}
