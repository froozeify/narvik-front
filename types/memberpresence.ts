import type {Activity} from "~/types/activity";
import type {Member} from "~/types/member";
import type {TimestampItem} from "~/types/timestampItem";

export interface MemberPresence extends TimestampItem {
  activities?: Activity[];
  member?: Member;
  date?: string;
}
