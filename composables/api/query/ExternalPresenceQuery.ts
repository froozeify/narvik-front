import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {FetchAllData} from "~/types/api";
import {useFetchList} from "~/composables/api/api";
import type {ExternalPresence} from "~/types/externalpresence";

export default class ExternalPresenceQuery extends AbstractQuery<ExternalPresence> {
    rootPath = "external-presences";

    async getPresentToday(): Promise<FetchAllData<ExternalPresence>> {
        return useFetchList<ExternalPresence>(this.rootPath + "/-/today");
    }
}
