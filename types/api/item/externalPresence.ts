import type {Activity} from "~/types/api/item/activity";
import type {TimestampItem} from "~/types/api/timestampItem";

export interface ExternalPresence extends TimestampItem {
  activities?: Activity[];
  licence?: string;
  firstname: string;
  lastname: string;
  fullName: string;
  date?: string;
}
