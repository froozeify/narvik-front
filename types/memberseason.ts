import type { Item } from "./item";
import type {AgeCategory} from "~/types/agecategory";

export interface MemberSeason extends Item {
  member?: any;
  season?: any;
  ageCategory?: AgeCategory;
  isSecondaryClub?: boolean;
}
