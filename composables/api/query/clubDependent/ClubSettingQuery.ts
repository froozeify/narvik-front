import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";
import type {ClubSetting} from "~/types/api/item/clubDependent/clubSetting";

export default class ClubSettingQuery extends AbstractClubDependentQuery<ClubSetting> {
  rootPath = "settings";
}
