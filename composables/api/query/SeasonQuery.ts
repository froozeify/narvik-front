import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Season} from "~/types/api/item/season";

export default class SeasonQuery extends AbstractQuery<Season> {
  rootPath = "seasons";
}
