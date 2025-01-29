import type {Member} from "~/types/api/item/clubDependent/member";
import type {MemberSeason} from "~/types/api/item/clubDependent/memberSeason";
import {AbstractClubDependentQuery} from "~/composables/api/query/AbstractClubDependentQuery";

export default class MemberSeasonQuery extends AbstractClubDependentQuery<MemberSeason> {
  rootPath = "seasons";
  protected activeMember: Member;

  constructor(activeMember: Member) {
    super();
    this.activeMember = activeMember;
  }

  private getActiveMemberIri(): string {
    if (!this.activeMember["@id"]) {
      throw new Error("Missing @id for defined member")
    }

    return this.activeMember["@id"]
  }

  protected override getRootUrl(): string {
    return `${this.getActiveMemberIri()}/${this.rootPath}` ;
  }
}
