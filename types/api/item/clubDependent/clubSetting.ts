import type {UuidItem} from "~/types/api/uuidItem";
import type {ClubLinkedItem} from "~/types/api/clubLinkedItem";
import type {Activity} from "~/types/api/item/clubDependent/plugin/presence/activity";

interface _ClubSetting extends UuidItem, ClubLinkedItem {
  controlShootingActivity?: any
  excludedActivitiesFromOpeningDays?: any
  itacImportDate?: Date
  itacImportRemaining?: number
  itacSecondaryImportDate?: Date
  itacSecondaryImportRemaining?: number
  cerbereImportRemaining?: number
}

export interface ClubSetting extends _ClubSetting {
  controlShootingActivity?: Activity
  excludedActivitiesFromOpeningDays?: Activity[]
}


export interface WriteClubSetting extends _ClubSetting {
  controlShootingActivity?: Activity|string
  excludedActivitiesFromOpeningDays?: Activity[]|string[]
}
