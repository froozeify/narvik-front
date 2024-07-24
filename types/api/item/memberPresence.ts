import type {Activity} from "~/types/api/item/activity";
import type {Member} from "~/types/api/item/member";
import type {TimestampItem} from "~/types/api/timestampItem";

export interface MemberPresence extends TimestampItem {
  activities?: Activity[];
  member?: Member;
  date?: string;
}
