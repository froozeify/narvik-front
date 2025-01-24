import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import {useSelfMemberStore} from "~/stores/useSelfMember";

export abstract class AbstractClubDependentQuery<T> extends AbstractQuery<T> {
  protected override getRootUrl(): string {
    const selfStore = useSelfMemberStore()
    const club = selfStore.club
    if (club === undefined) {
      throw new Error("No club selected")
    }

    return club["@id"] + "/" + this.rootPath;
  }
}
