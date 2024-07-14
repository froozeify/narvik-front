import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import {usePut} from "~/composables/api/api";
import type {Item} from "~/types/item";

export abstract class AbstractSortableQuery<T> extends AbstractQuery<T> {

  async move(item: Item, direction: string) {
    return usePut(this.rootPath + "/" + item.id + "/move", {direction: direction});
  }
}
