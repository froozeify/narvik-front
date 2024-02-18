import type { Item } from "./item";
import type {Activity} from "~/types/activity";
import type {Member} from "~/types/member";

export interface MemberPresence extends Item {
  activities?: Activity[];
  member?: Member;
  date?: string;
  createdAt?: string;
}
