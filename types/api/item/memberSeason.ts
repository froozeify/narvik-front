import type { Item } from "../item";
import type {AgeCategory} from "~/types/api/item/ageCategory";

export interface MemberSeason extends Item {
  member?: any;
  season?: any;
  ageCategory?: AgeCategory;
  isSecondaryClub?: boolean;
}
