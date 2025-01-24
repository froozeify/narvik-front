import {usePut} from "~/composables/api/api";
import type {Item} from "~/types/api/item";
import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";

export abstract class AbstractSortableQuery<T> extends AbstractClubDependentQuery<T> {

  async move(item: Item, direction: string) {
    return usePut(item["@id"] + "/move", {direction: direction});
  }
}
