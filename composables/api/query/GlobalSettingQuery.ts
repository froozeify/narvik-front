import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {GlobalSetting} from "~/types/globalsetting";

export default class GlobalSettingQuery extends AbstractQuery<GlobalSetting> {
    rootPath = "global-settings";
}
