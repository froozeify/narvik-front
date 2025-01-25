import type {UuidItem} from "~/types/api/uuidItem";

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

export interface Club extends UuidItem {
  name?: string;
}
