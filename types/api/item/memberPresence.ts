import type {Activity} from "~/types/api/item/activity";
import type {Member} from "~/types/api/item/member";
import type {TimestampItem} from "~/types/api/timestampItem";
import type {UuidItem} from "~/types/api/uuidItem";

export interface MemberPresence extends UuidItem, TimestampItem {
  activities?: Activity[];
  member?: Member;
  date?: string;
}
