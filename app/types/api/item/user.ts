import type {UuidItem} from "~/types/api/uuidItem";
import type {LinkedProfile} from "~/types/api/linkedProfile";
import type {TimestampItem} from "~/types/api/timestampItem";

export enum UserRole {
  SuperAdmin = 'ROLE_SUPER_ADMIN',
  User = 'ROLE_USER',

  Badger = 'ROLE_BADGER',
}

export interface User extends UuidItem, TimestampItem {
  accountActivated?: boolean;
  plainPassword?: string;
  role?: UserRole;

  email: string;
  firstname?: string;
  lastname?: string;
  fullName?: string;

  legalsExpired: boolean
  legalsAccepted?: Date|null

  linkedProfiles?: LinkedProfile[]
}
