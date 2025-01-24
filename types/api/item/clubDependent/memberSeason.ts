import type {AgeCategory} from "~/types/api/item/ageCategory";
import type {UuidItem} from "~/types/api/uuidItem";

export interface MemberSeason extends UuidItem {
  member?: any;
  season?: any;
  ageCategory?: AgeCategory;
  isSecondaryClub?: boolean;
}
