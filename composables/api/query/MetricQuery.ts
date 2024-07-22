import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Metric} from "~/types/api/item/metric";
import type {FetchItemData} from "~/types/api/api";

export default class MetricQuery extends AbstractQuery<Metric> {
    rootPath = "metrics";


    async get(id: number | string): Promise<FetchItemData<Metric>> {
        return super.get(id);
    }
}
