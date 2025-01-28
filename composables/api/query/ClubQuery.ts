import type {Member} from "~/types/api/item/clubDependent/member";
import {
  useFetchItem,
  useFetchList,
  useGetCsv, usePatch, usePatchItem,
  usePost,
  usePostRawJson,
  usePut,
  useUploadFile
} from "~/composables/api/api";
import type {MemberPresence} from "~/types/api/item/clubDependent/plugin/presence/memberPresence";
import type {MemberSeason} from "~/types/api/item/clubDependent/memberSeason";
import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";
import type {Club, ClubRole} from "~/types/api/item/club";
import type {ExternalPresence} from "~/types/api/item/clubDependent/plugin/presence/externalPresence";
import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {FetchItemData} from "~/types/api/api";
import {useSelfUserStore} from "~/stores/useSelfUser";

export default class ClubQuery extends AbstractQuery<Club> {
  rootPath = "clubs";

  async getCurrentClub(useCache: boolean = false) {
    return useFetchItem<Club>(this.getCurrentClubPath(), useCache, true);
  }
}
