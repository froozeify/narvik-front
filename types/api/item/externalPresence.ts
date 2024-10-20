import type {Activity} from "~/types/api/item/activity";
import type {TimestampItem} from "~/types/api/timestampItem";
import type {UuidItem} from "~/types/api/uuidItem";

export interface ExternalPresence extends UuidItem, TimestampItem {
  activities?: Activity[];
  licence?: string;
  firstname: string;
  lastname: string;
  fullName: string;
  date?: string;
}
