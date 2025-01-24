import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Activity} from "~/types/api/item/clubDependent/plugin/presence/activity";
import {useCreateItem} from "~/composables/api/api";
import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";

export default class ActivityQuery extends AbstractClubDependentQuery<Activity> {
    rootPath = "activities";

    async mergeTo(id: string, target: string) {
        return useCreateItem<Activity>(this.getRootUrl()  + '/' + id + '/merge-to/' + target, {})
    }

}
