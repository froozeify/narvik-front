import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {Activity} from "~/types/api/item/activity";
import {useCreateItem} from "~/composables/api/api";

export default class ActivityQuery extends AbstractQuery<Activity> {
    rootPath = "activities";

    async mergeTo(id: string, target: string) {
        return useCreateItem<Activity>(this.rootPath  + '/' + id + '/merge-to/' + target, {})
    }

}
