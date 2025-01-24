import type {AgeCategory} from "~/types/api/item/ageCategory";
import type {UuidItem} from "~/types/api/uuidItem";
import type {ClubLinkedItem} from "~/types/api/clubLinkedItem";

export interface MemberSeason extends UuidItem, ClubLinkedItem {
  member?: any;
  season?: any;
  ageCategory?: AgeCategory;
  isSecondaryClub?: boolean;
}
