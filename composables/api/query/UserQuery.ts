import type {Member} from "~/types/api/item/clubDependent/member";
import {
  useFetchItem,
  useFetchList,
  useGetCsv,
  usePost,
  usePostRawJson,
  usePut,
  useUploadFile
} from "~/composables/api/api";
import {AbstractQuery} from "~/composables/api/query/AbstractQuery";
import type {User} from "~/types/api/item/user";

export default class UserQuery extends AbstractQuery<User, User> {
  rootPath = "users";

  async passwordResetInitialise(email: string) {
    return usePostRawJson(`${this.rootPath}/-/initiate-reset-password`, {
      email: email
    });
  }

  async passwordReset(email: string, password: string, securityCode: string) {
    return usePostRawJson(`${this.rootPath}/-/reset-password`, {
      email: email,
      password: password,
      securityCode: securityCode.trim().toUpperCase()
    });
  }

  async self() {
    return useFetchItem<User>('/self');
  }

  async selfUpdatePassword(currentPassword: string, newPassword: string) {
    return usePut('/self/update-password', {current: currentPassword, new: newPassword});
  }

}
