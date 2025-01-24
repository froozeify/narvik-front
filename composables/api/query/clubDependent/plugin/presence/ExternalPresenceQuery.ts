import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {FetchAllData} from "~/types/api/api";
import {useFetchList} from "~/composables/api/api";
import type {ExternalPresence} from "~/types/api/item/clubDependent/plugin/presence/externalPresence";
import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";

export default class ExternalPresenceQuery extends AbstractClubDependentQuery<ExternalPresence> {
    rootPath = "external-presences";

    async getPresentToday(): Promise<FetchAllData<ExternalPresence>> {
        return useFetchList<ExternalPresence>(this.getRootUrl() + "/-/today");
    }
}
