import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import {useSelfUserStore} from "~/stores/useSelfUser";

export abstract class AbstractClubDependentQuery<T> extends AbstractQuery<T> {
  protected override getRootUrl(): string {
    const selfStore = useSelfUserStore()
    const profile = selfStore.selectedProfile
    if (profile === undefined) {
      throw new Error("No profile selected")
    }

    return profile.club["@id"] + "/" + this.rootPath;
  }
}
