import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Activity} from "~/types/api/item/clubDependent/plugin/presence/activity";
import {useCreateItem, usePatch} from "~/composables/api/api";
import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";

export default class ActivityQuery extends AbstractClubDependentQuery<Activity, Activity> {
    rootPath = "activities";

    async mergeTo(id: string, target: string) {
        return usePatch(this.getRootUrl()  + '/' + id + '/merge', {
          target: target
        })
    }

}
