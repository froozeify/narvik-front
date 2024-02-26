import type {PagedCollection} from "~/types/collection";
import type {FetchAllData, FetchItemData} from "~/types/api";
import type {View} from "~/types/view";
import type {SubmissionErrors} from "~/types/error";
import type {Item} from "~/types/item";
import {mergician} from 'mergician';
import type {UseApiDataOptions} from "nuxt-api-party/dist/runtime/composables/useApiData";
import {useSelfMemberStore} from "~/stores/useSelfMember";

export const MIME_TYPE = "application/ld+json";
export const MIME_TYPE_JSON = "application/json";
export const MIME_TYPE_JSON_PATCH = "application/merge-patch+json"

const CONTENT_TYPE_FORM_DATA = "multipart/form-data"

async function useApi<T>(path: string, options: UseApiDataOptions<T>, requireLogin: boolean = true) {
  let overloadedOptions = {}

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

  return await $localApi<T>(path, overloadedOptions);
}

export async function useLoginUser(email: string, password: string) {
  const data = await $localApi("auth", {
    method: "POST",
    headers: {
      Accept: MIME_TYPE_JSON,
    },
    body: {
      email: email,
      password: password
    }
  });

  const selfStore = useSelfMemberStore()
  selfStore.setJwtSelfJwtTokenFromApiResponse(data)

  return true;
}

export async function useLoginBadger(loginToken: string) {
  const data = await $localApi("auth/bdg/" + loginToken, {
    method: "POST",
    headers: {
      Accept: MIME_TYPE_JSON,
    }
  });

  const selfStore = useSelfMemberStore()
  selfStore.setJwtSelfJwtTokenFromApiResponse(data)

  return true;
}




export async function useFetchList<T>(resource: string): Promise<FetchAllData<T>> {
  let items: T[] = [];
  let totalItems: number | undefined = undefined;
  let view: View | undefined = undefined;
  let hubUrl: URL | undefined = undefined;
  let error: Error | null = null;

  try {
    const data = await useApi<PagedCollection<T>>(resource, {

      onResponse({ response }) {
        hubUrl = extractHubURL(response);
      },
    });

    items = data["hydra:member"];
    view = data["hydra:view"];
    totalItems = data["hydra:totalItems"];
  } catch (e) {
    error = e as Error;
  }

  return {
    items,
    totalItems,
    view,
    error,
    hubUrl,
  };
}

export async function useFetchItem<T>(path: string, useCache: boolean = false, requireLogin: boolean = true): Promise<FetchItemData<T>> {
  let retrieved: T | undefined = undefined;
  let hubUrl: URL | undefined = undefined;
  let error: Error | null = null;

  try {
    const data = await useApi<T>(path, {
      cache: useCache,
      onResponse({ response }) {
        retrieved = response._data;
        hubUrl = extractHubURL(response);
      },
    }, requireLogin);

    retrieved = data as T;
  } catch (e) {
    error = e as Error;
  }


  return {
    retrieved,
    error,
    hubUrl,
  };
}

export async function useCreateItem<T>(resource: string, payload: Item) {
  let created: T | undefined = undefined;
  let violations: SubmissionErrors | undefined = undefined;
  let error: Error | null = null;

  try {
    const data = await useApi<T>(resource, {
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

        violations = errors;

        throw new SubmissionError(errors);
      },
    });

    created = data as T;
  } catch (e) {
    error = e as Error
  }

  return {
    created,
    error,
    violations,
  };
}

export async function useUploadFile(resource: string, payload: FormData, requireLogin: boolean = true) {
  let created: Object | undefined = undefined;
  let violations: SubmissionErrors | undefined = undefined;
  let error: Error | null = null;

  try {
    const data = await useApi(resource, {
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

        violations = errors;

        throw new SubmissionError(errors);
      },
    }, requireLogin);

    created = data as Object;
  } catch (e) {
    error = e as Error
  }

  return {
    created,
    error,
    violations,
  };
}

export async function useUpdateItem<T>(item: Item, payload: Item) {
  let updated: T | undefined = undefined;
  let violations: SubmissionErrors | undefined = undefined;
  let error: Error | null = null;

  try {
    const data = await useApi<T>(item["@id"] ?? "", {
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

        violations = errors;

        throw new SubmissionError(errors);
      },
    });

    updated = data as T;
  } catch (e) {
    error = e as Error
  }

  return {
    updated,
    error,
    violations,
  };
}

export async function usePost<T>(path: string, payload: object) {
  let item: T | undefined = undefined;
  let violations: SubmissionErrors | undefined = undefined;
  let error: Error | null = null;

  try {
    const data = await useApi<T>(path, {
      method: "POST",
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

        violations = errors;

        throw new SubmissionError(errors);
      },
    });

    item = data as T;
  } catch (e) {
    error = e as Error
  }

  return {
    item,
    error,
    violations,
  };
}

export async function usePut(path: string, payload: object) {
  let updated: object | undefined = undefined;
  let violations: SubmissionErrors | undefined = undefined;
  let error: Error | null = null;

  try {
    const data = await useApi<object>(path, {
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

        violations = errors;

        throw new SubmissionError(errors);
      },
    });

    updated = data;
  } catch (e) {
    error = e as Error
  }

  return {
    updated,
    error,
    violations,
  };
}


export async function usePatchItem<T>(item: Item, payload: Item) {
  let updated: T | undefined = undefined;
  let violations: SubmissionErrors | undefined = undefined;
  let error: Error | null = null;

  try {
    const data = await useApi(item["@id"] ?? "", {
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

        violations = errors;

        throw new SubmissionError(errors);
      },
    });

    updated = data as T;
  } catch (e) {
    error = e as Error
  }

  return {
    updated,
    error,
    violations,
  };
}

export async function useDeleteItem(item: Item) {
  let error: string | undefined = undefined;

  if (!item?.["@id"]) {
    error = "No item found. Please reload";
    return {
      error,
    };
  }

  const data = await useApi(item["@id"] ?? "", {
    method: "DELETE",

    onResponseError({ response }) {
      const data = response._data;
      error = data["hydra:description"] || response.statusText;
    },
  });

  return {
    error,
  };
}
