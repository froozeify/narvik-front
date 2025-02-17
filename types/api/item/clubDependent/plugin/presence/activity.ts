import type {MemberPresence} from "~/types/api/item/clubDependent/plugin/presence/memberPresence";
import type {UuidItem} from "~/types/api/uuidItem";
import type {ClubLinkedItem} from "~/types/api/clubLinkedItem";

export interface Activity extends UuidItem, ClubLinkedItem {
  name: string;
  isEnabled: boolean;
  memberPresences?: MemberPresence[];
}
