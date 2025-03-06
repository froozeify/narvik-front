import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {AgeCategory} from "~/types/api/item/ageCategory";

export default class AgeCategoryQuery extends AbstractQuery<AgeCategory, AgeCategory> {
  rootPath = "age-categories";
}
