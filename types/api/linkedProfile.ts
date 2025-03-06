import type {Club} from "~/types/api/item/club";
import type {Member} from "~/types/api/item/clubDependent/member";

export interface LinkedProfile {
  id: string;
  displayName: string;

  club: Club;
  member?: Member;
  role: string;
}
