import type { Item } from "../item";
import type {MemberSeason} from "~/types/api/item/memberSeason";

export enum MemberRole {
  User = 'ROLE_USER',

  Badger = 'ROLE_BADGER',

  Member = 'ROLE_MEMBER',
  Supervisor = 'ROLE_SUPERVISOR',
  Admin = 'ROLE_ADMIN'
}

export function getAvailableMemberRoles() {
  return [
    {
      text:  'Administateur',
      value: MemberRole.Admin
    },
    {
      text:  'Superviseur/Permanent',
      value: MemberRole.Supervisor
    },
    {
      text:  'Membre',
      value: MemberRole.Member
    },
  ]
}

export interface Member extends Item {
  profileImage?: string;
  profileImageBase64?: string;
  lastControlShooting?: Date;
  currentSeason?: MemberSeason;
  accountActivated?: boolean;
  plainPassword?: string;
  role?: string;

  email?: string;
  licence?: string;
  firstname?: string;
  lastname?: string;
  fullName?: string;
  gender?: string;
  birthday?: string;
  handisport?: boolean;
  deceased?: boolean;
  postal1?: string;
  postal2?: string;
  postal3?: string;
  zipCode?: number;
  city?: string;
  country?: string;
  phone?: string;
  mobilePhone?: string;
}
