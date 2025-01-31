import {AbstractQuery} from "~/composables/api/query/AbstractQuery";

export abstract class AbstractClubDependentQuery<R, W> extends AbstractQuery<R, W> {
  public override getRootUrl(): string {
    const clubPath = this.getCurrentClubPath()
    return clubPath + "/" + this.rootPath;
  }
}
