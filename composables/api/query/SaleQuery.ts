import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Sale} from "~/types/api/item/sale";

export default class SaleQuery extends AbstractQuery<Sale> {
    rootPath = "sales";
}
