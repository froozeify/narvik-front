import type {UuidItem} from "~/types/api/uuidItem";
import type {ClubSetting} from "~/types/api/item/clubDependent/ClubSetting";
import type {TimestampItem} from "~/types/api/timestampItem";

export enum ClubRole {
  Badger = 'CLUB_BADGER',

  Member = 'CLUB_MEMBER',
  Supervisor = 'CLUB_SUPERVISOR',
  Admin = 'CLUB_ADMIN'
}

export function getAvailableClubRoles() {
  return [
    {
      text:  'Administateur',
      value: ClubRole.Admin
    },
    {
      text:  'Superviseur/Permanent',
      value: ClubRole.Supervisor
    },
    {
      text:  'Membre',
      value: ClubRole.Member
    },
  ]
}

interface _Club extends UuidItem, TimestampItem {
  name: string;
  isActivated: boolean
  salesEnabled: boolean
  badgerToken?: string
  comment?: string
  settings?: ClubSetting
  renewDate?: Date|null
}

export interface Club extends _Club {
  settings: ClubSetting
}

export interface WriteClub extends _Club {

}
