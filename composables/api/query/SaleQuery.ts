import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Sale} from "~/types/sale";

export default class SaleQuery extends AbstractQuery<Sale> {
    rootPath = "sales";
}
