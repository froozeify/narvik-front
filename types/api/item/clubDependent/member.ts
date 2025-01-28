import type {MemberSeason} from "~/types/api/item/clubDependent/memberSeason";
import type {UuidItem} from "~/types/api/uuidItem";
import type {ClubLinkedItem} from "~/types/api/clubLinkedItem";
import type {ClubRole} from "~/types/api/item/club";

export interface Member extends UuidItem, ClubLinkedItem {
  profileImage?: string;
  profileImageBase64?: string;
  lastControlShooting?: Date;
  currentSeason?: MemberSeason;
  plainPassword?: string;

  role?: ClubRole

  email?: string;
  licence?: string;
  firstname?: string;
  lastname?: string;
  fullName?: string;
  gender?: string;
  birthday?: string;
  handisport?: boolean;
  deceased?: boolean;
  blacklisted?: boolean;
  postal1?: string;
  postal2?: string;
  postal3?: string;
  zipCode?: number;
  city?: string;
  country?: string;
  phone?: string;
  mobilePhone?: string;
}
