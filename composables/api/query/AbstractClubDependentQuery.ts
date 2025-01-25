import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import {useSelfMemberStore} from "~/stores/useSelfMember";

export abstract class AbstractClubDependentQuery<T> extends AbstractQuery<T> {
  protected override getRootUrl(): string {
    const selfStore = useSelfMemberStore()
    const profile = selfStore.selectedProfile
    if (profile === undefined) {
      throw new Error("No profile selected")
    }

    return profile.club["@id"] + "/" + this.rootPath;
  }
}
