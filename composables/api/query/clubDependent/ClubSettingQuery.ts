import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";
import type {ClubSetting, WriteClubSetting} from "~/types/api/item/clubDependent/clubSetting";
import {useUploadFile} from "~/composables/api/api";

export default class ClubSettingQuery extends AbstractClubDependentQuery<ClubSetting, WriteClubSetting> {
  rootPath = "settings";

  async importLogo(item: ClubSetting, formData: FormData) {
    return useUploadFile(`${item["@id"]}/logo`, formData)
  }
}
