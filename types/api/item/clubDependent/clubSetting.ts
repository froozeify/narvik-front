import type {UuidItem} from "~/types/api/uuidItem";
import type {ClubLinkedItem} from "~/types/api/clubLinkedItem";
import type {Activity} from "~/types/api/item/clubDependent/plugin/presence/activity";
import type {File} from "~/types/api/item/file";

interface _ClubSetting extends UuidItem, ClubLinkedItem {
  logo?: any
  logoBase64?: string
  controlShootingActivity?: any
  excludedActivitiesFromOpeningDays?: any
  itacImportDate?: Date
  itacImportRemaining?: number
  itacSecondaryImportDate?: Date
  itacSecondaryImportRemaining?: number
  cerbereImportRemaining?: number
}

export interface ClubSetting extends _ClubSetting {
  logo?: File
  controlShootingActivity?: Activity
  excludedActivitiesFromOpeningDays?: Activity[]
}


export interface WriteClubSetting extends _ClubSetting {
  controlShootingActivity?: Activity|string
  excludedActivitiesFromOpeningDays?: Activity[]|string[]
}
