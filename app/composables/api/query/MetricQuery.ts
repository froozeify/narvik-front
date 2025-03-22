import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Metric} from "~/types/api/item/metric";
import type {FetchItemData} from "~/types/api/api";
import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";
import {useFetchItem} from "~/composables/api/api";

export default class MetricQuery extends AbstractClubDependentQuery<Metric, Metric> {
  rootPath = "metrics";

  async getSuperAdmin(id: string) {
    return useFetchItem<Metric>(this.rootPath+ "/" + id);
  }

}
