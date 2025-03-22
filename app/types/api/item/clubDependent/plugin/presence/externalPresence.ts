import type {Activity} from "~/types/api/item/clubDependent/plugin/presence/activity";
import type {TimestampItem} from "~/types/api/timestampItem";
import type {UuidItem} from "~/types/api/uuidItem";
import type {ClubLinkedItem} from "~/types/api/clubLinkedItem";

export interface ExternalPresence extends UuidItem, ClubLinkedItem, TimestampItem {
  activities?: Activity[];
  licence?: string;
  firstname: string;
  lastname: string;
  fullName: string;
  date?: string;
}
