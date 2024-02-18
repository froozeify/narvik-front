import type { Item } from "./item";
import type {Activity} from "~/types/activity";

export interface ExternalPresence extends Item {
  activities?: Activity[];
  licence?: string;
  firstname: string;
  lastname: string;
  fullName: string;
  date?: string;
  createdAt?: string;
}
