import type {PagedCollection} from "~/types/collection";
import type {FetchAllData, FetchItemData} from "~/types/api";
import type {Ref} from "vue";
import type {View} from "~/types/view";
import type {SubmissionErrors} from "~/types/error";
import type {Item} from "~/types/item";
import mergician from "mergician";
import type {UseApiDataOptions} from "nuxt-api-party/dist/runtime/composables/useApiData";
import {useSelfMemberStore} from "~/stores/useSelfMember";

export const MIME_TYPE = "application/ld+json";
export const MIME_TYPE_JSON = "application/json";
export const MIME_TYPE_JSON_PATCH = "application/merge-patch+json"

const CONTENT_TYPE_FORM_DATA = "multipart/form-data"

async function useApi<T>(path: string, options: UseApiDataOptions<T>, requireLogin: boolean = true) {
  let overloadedOptions = undefined

  if (requireLogin) {
    const selfStore = useSelfMemberStore()
    const jwtToken = await selfStore.enhanceJwtTokenDefined();
    // We throw an error if at this point we still don't have an access token
    if (!jwtToken.value || !jwtToken.value.access) {
      selfStore.displayJwtError("No access token.")
    }
    overloadedOptions = mergician({
      headers: {
        Authorization: `Bearer ${jwtToken.value?.access?.token}`
      }
    }, options);
  }

  overloadedOptions = mergician({
    mode: "cors",
    cache: false,

    headers: {
      Accept: MIME_TYPE,
    },

    onResponseError({ response }) {
      const data = response._data;
      const error = data["hydra:description"] || response.statusText;

      throw new Error(error);
    },
  }, overloadedOptions)

  // We keep the original body for FormData values
  if (options.body instanceof FormData) {
    overloadedOptions.body = options.body
  }

  const response = await useLocalApiData(path, overloadedOptions);

  return response;
}

export async function useLoginUser(email: string, password: string) {
  const { data, error } = await useLocalApiData("auth", {
    method: "POST",
    headers: {
      Accept: MIME_TYPE_JSON,
    },
    body: {
      email: email,
      password: password
    }
  });

  if (error.value) {
    throw error;
  }

  const selfStore = useSelfMemberStore()
  selfStore.setJwtSelfJwtTokenFromApiResponse(data)

  return true;
}

export async function useLoginBadger(loginToken: string) {
  const { data, error } = await useLocalApiData("auth/bdg/" + loginToken, {
    method: "POST",
    headers: {
      Accept: MIME_TYPE_JSON,
    }
  });

  if (error.value) {
    throw error;
  }

  const selfStore = useSelfMemberStore()
  selfStore.setJwtSelfJwtTokenFromApiResponse(data)

  return true;
}




export async function useFetchList<T>(resource: string): Promise<FetchAllData<T>> {
  const items: Ref<T[]> = ref([]);
  const totalItems: Ref<number | undefined> = ref(undefined);
  const view: Ref<View | undefined> = ref(undefined);
  const hubUrl: Ref<URL | undefined> = ref(undefined);

  const { data, pending, error } = await useApi<T>(resource, {

    onResponse({ response }) {
      hubUrl.value = extractHubURL(response);
    },
  });

  const value = data.value as PagedCollection<T>;
  if (value) {
    items.value = value["hydra:member"];
    view.value = value["hydra:view"];
    totalItems.value = value["hydra:totalItems"];
  }

  return {
    items,
    totalItems,
    view,
    isLoading: pending,
    error,
    hubUrl,
  };
}

export async function useFetchItem<T>(path: string, useCache: boolean = false): Promise<FetchItemData<T>> {
  const retrieved: Ref<T | undefined> = ref(undefined);
  const hubUrl: Ref<URL | undefined> = ref(undefined);

  const { data, pending, error } = await useApi<T>(path, {
    cache: useCache,
    onResponse({ response }) {
      retrieved.value = response._data;
      hubUrl.value = extractHubURL(response);
    },
  });

  retrieved.value = data.value as T;

  return {
    retrieved,
    isLoading: pending,
    error,
    hubUrl,
  };
}

export async function useCreateItem<T>(resource: string, payload: Item) {
  const created: Ref<T | undefined> = ref(undefined);
  const violations: Ref<SubmissionErrors | undefined> = ref(undefined);

  const { data, pending, error } = await useApi(resource, {
    method: "POST",
    body: payload,

    onResponseError({ response }) {
      const data = response._data;
      const error = data["hydra:description"] || response.statusText;

      if (!data.violations) throw new Error(error);

      const errors: SubmissionErrors = { _error: error };
      data.violations.forEach(
        (violation: { propertyPath: string; message: string }) => {
          errors[violation.propertyPath] = violation.message;
        }
      );

      violations.value = errors;

      throw new SubmissionError(errors);
    },
  });

  created.value = data.value as T;

  return {
    created,
    isLoading: pending,
    error,
    violations,
  };
}

export async function useUploadFile(resource: string, payload: FormData) {
  const created: Ref<Object | undefined> = ref(undefined);
  const violations: Ref<SubmissionErrors | undefined> = ref(undefined);

  const { data, pending, error } = await useApi(resource, {
    method: "POST",
    headers: {
      Accept: MIME_TYPE_JSON,
    },
    body: payload,

    onResponseError({ response }) {
      const data = response._data;
      const error = data["hydra:description"] || data['detail'] || response.statusText;

      if (!data.violations) throw new Error(error);

      const errors: SubmissionErrors = { _error: error };
      data.violations.forEach(
          (violation: { propertyPath: string; message: string }) => {
            errors[violation.propertyPath] = violation.message;
          }
      );

      violations.value = errors;

      throw new SubmissionError(errors);
    },
  });

  created.value = data.value as Object;

  return {
    created,
    isLoading: pending,
    error,
    violations,
  };
}

export async function useUpdateItem<T>(item: Item, payload: Item) {
  const updated: Ref<T | undefined> = ref(undefined);
  const violations: Ref<SubmissionErrors | undefined> = ref(undefined);

  const { data, pending, error } = await useApi(item["@id"] ?? "", {
    method: "PUT",
    body: payload,
    headers: {
      Accept: MIME_TYPE,
      "Content-Type": MIME_TYPE,
    },

    onResponseError({ response }) {
      const data = response._data;
      const error = data["hydra:description"] || response.statusText;

      if (!data.violations) throw new Error(error);

      const errors: SubmissionErrors = { _error: error };
      data.violations.forEach(
        (violation: { propertyPath: string; message: string }) => {
          errors[violation.propertyPath] = violation.message;
        }
      );

      violations.value = errors;

      throw new SubmissionError(errors);
    },
  });

  updated.value = data.value as T;

  return {
    updated,
    isLoading: pending,
    error,
    violations,
  };
}

export async function usePut(path: string, payload: object) {
  const updated: Ref<object | undefined> = ref(undefined);
  const violations: Ref<SubmissionErrors | undefined> = ref(undefined);

  const { data, pending, error } = await useApi(path, {
    method: "PUT",
    body: payload,
    headers: {
      Accept: MIME_TYPE,
      "Content-Type": MIME_TYPE,
    },

    onResponseError({ response }) {
      const data = response._data;
      const error = data["hydra:description"] || response.statusText;

      if (!data.violations) throw new Error(error);

      const errors: SubmissionErrors = { _error: error };
      data.violations.forEach(
          (violation: { propertyPath: string; message: string }) => {
            errors[violation.propertyPath] = violation.message;
          }
      );

      violations.value = errors;

      throw new SubmissionError(errors);
    },
  });

  updated.value = data.value;

  return {
    updated,
    isLoading: pending,
    error,
    violations,
  };
}


export async function usePatchItem<T>(item: Item, payload: Item) {
  const updated: Ref<T | undefined> = ref(undefined);
  const violations: Ref<SubmissionErrors | undefined> = ref(undefined);

  const { data, pending, error } = await useApi(item["@id"] ?? "", {
    method: "PATCH",
    body: payload,
    headers: {
      Accept: MIME_TYPE,
      "Content-Type": MIME_TYPE_JSON_PATCH,
    },

    onResponseError({ response }) {
      const data = response._data;
      const error = data["hydra:description"] || response.statusText;

      if (!data.violations) throw new Error(error);

      const errors: SubmissionErrors = { _error: error };
      data.violations.forEach(
          (violation: { propertyPath: string; message: string }) => {
            errors[violation.propertyPath] = violation.message;
          }
      );

      violations.value = errors;

      throw new SubmissionError(errors);
    },
  });

  updated.value = data.value as T;

  return {
    updated,
    isLoading: pending,
    error,
    violations,
  };
}

export async function useDeleteItem(item: Item) {
  const error: Ref<string | undefined> = ref(undefined);

  if (!item?.["@id"]) {
    error.value = "No item found. Please reload";
    return {
      error,
    };
  }

  const { pending } = await useApi(item["@id"] ?? "", {
    method: "DELETE",

    onResponseError({ response }) {
      const data = response._data;
      error.value = data["hydra:description"] || response.statusText;
    },
  });

  return {
    isLoading: pending,
    error,
  };
}
