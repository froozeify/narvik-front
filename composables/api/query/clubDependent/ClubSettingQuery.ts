import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";
import type {ClubSetting, WriteClubSetting} from "~/types/api/item/clubDependent/clubSetting";

export default class ClubSettingQuery extends AbstractClubDependentQuery<ClubSetting, WriteClubSetting> {
  rootPath = "settings";
}
