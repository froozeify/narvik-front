import type {AgeCategory} from "~/types/api/item/ageCategory";
import type {UuidItem} from "~/types/api/uuidItem";
import type {ClubLinkedItem} from "~/types/api/clubLinkedItem";
import type {Activity} from "~/types/api/item/clubDependent/plugin/presence/activity";

export interface ClubSetting extends UuidItem, ClubLinkedItem {
  controlShootingActivity?: Activity
  excludedActivitiesFromOpeningDays?: Activity[]
  itacImportDate?: Date
  itacImportRemaining?: number
  itacSecondaryImportDate?: Date
  itacSecondaryImportRemaining?: number
  cerbereImportRemaining?: number
}
