import type {Activity} from "~/types/api/item/clubDependent/plugin/presence/activity";
import type {Member} from "~/types/api/item/clubDependent/member";
import type {TimestampItem} from "~/types/api/timestampItem";
import type {UuidItem} from "~/types/api/uuidItem";
import type {ClubLinkedItem} from "~/types/api/clubLinkedItem";

export interface MemberPresence extends UuidItem, ClubLinkedItem, TimestampItem {
  activities?: Activity[];
  member?: Member;
  date?: string;
}
