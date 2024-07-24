import type {SalePaymentMode} from "~/types/api/item/salePaymentMode";
import {AbstractSortableQuery} from "~/composables/api/query/AbstractSortableQuery";

export default class SalePaymentModeQuery extends AbstractSortableQuery<SalePaymentMode> {
    rootPath = "sale-payment-modes";
}
