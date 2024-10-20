import type {MemberPresence} from "~/types/api/item/memberPresence";
import type {UuidItem} from "~/types/api/uuidItem";

export interface Activity extends UuidItem {
  name: string;
  isEnabled: boolean;
  memberPresences?: MemberPresence[];
}
