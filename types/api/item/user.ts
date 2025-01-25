import type {UuidItem} from "~/types/api/uuidItem";
import type {LinkedProfile} from "~/types/api/linkedProfile";

export enum UserRole {
  User = 'ROLE_USER',
  SuperAdmin = 'ROLE_SUPER_ADMIN',

  Badger = 'ROLE_BADGER',
}

export interface User extends UuidItem {
  accountActivated?: boolean;
  plainPassword?: string;
  role: string;

  email: string;
  firstname?: string;
  lastname?: string;
  fullName?: string;

  linkedProfiles?: LinkedProfile[]
}
