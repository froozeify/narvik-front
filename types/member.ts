import type { Item } from "./item";

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
      text:  'Superviseur',
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
  lastControlShooting?: Date;
  accountActivated?: boolean;
  plainPassword?: string;
  role?: string;

  email?: string;
  licence?: string;
  firstname?: string;
  lastname?: string;
  fullName?: string;
  memberPresences?: any;
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
  memberSeasons?: any;
}
