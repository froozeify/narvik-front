import {AbstractQuery} from "~/composables/api/query/AbstractQuery";

export abstract class AbstractClubDependentQuery<T> extends AbstractQuery<T> {
  protected override getRootUrl(): string {
    const clubPath = this.getCurrentClubPath()
    return clubPath + "/" + this.rootPath;
  }
}
