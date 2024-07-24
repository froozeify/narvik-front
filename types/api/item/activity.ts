import type { Item } from "../item";
import type {MemberPresence} from "~/types/api/item/memberPresence";

export interface Activity extends Item {
  name: string;
  isEnabled: boolean;
  memberPresences?: MemberPresence[];
}
