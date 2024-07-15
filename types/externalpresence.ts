import type {Activity} from "~/types/activity";
import type {TimestampItem} from "~/types/timestampItem";

export interface ExternalPresence extends TimestampItem {
  activities?: Activity[];
  licence?: string;
  firstname: string;
  lastname: string;
  fullName: string;
  date?: string;
}
