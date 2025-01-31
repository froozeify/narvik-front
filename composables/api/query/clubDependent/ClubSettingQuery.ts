import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";
import type { ReadClubSetting, WriteClubSetting } from "~/types/api/item/clubDependent/clubSetting";

export default class ClubSettingQuery extends AbstractClubDependentQuery<ReadClubSetting, WriteClubSetting> {
  rootPath = "settings";
}
