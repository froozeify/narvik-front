import type {MemberPresence} from "~/types/api/item/clubDependent/plugin/presence/memberPresence";
import type {UuidItem} from "~/types/api/uuidItem";
import type {ClubLinkedItem} from "~/types/api/clubLinkedItem";
import type {ClubRole} from "~/types/api/item/club";

export interface Activity extends UuidItem, ClubLinkedItem {
  name: string;
  visibility?: ClubRole|null
  isEnabled: boolean;
  memberPresences?: MemberPresence[];
}
