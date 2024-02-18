import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Metric} from "~/types/metric";
import type {FetchItemData} from "~/types/api";

export default class MetricQuery extends AbstractQuery<Metric> {
    rootPath = "metrics";


    async get(id: number | string): Promise<FetchItemData<Metric>> {
        return super.get(id);
    }
}
