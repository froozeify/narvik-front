import type {Member} from "~/types/api/item/clubDependent/member";
import {
  useDelete,
  useDeleteItem,
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

  async registerInitialise(email: string) {
    return usePostRawJson(`${this.rootPath}/-/initiate-register`, {
      email: email
    });
  }

  async register(securityCode: string, email: string, password: string, firstname: string, lastname: string) {
    return usePostRawJson(`${this.rootPath}/-/register`, {
      securityCode: securityCode.trim().toUpperCase(),
      email: email,
      password: password,
      firstname: firstname,
      lastname: lastname
    });
  }

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

  async selfDelete() {
    return useDelete('/self');
  }

}
