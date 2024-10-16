import type {PagedCollection} from "~/types/api/collection";
import type {FetchAllData, FetchItemData} from "~/types/api/api";
import type {View} from "~/types/api/view";
import type {Item} from "~/types/api/item";
import {mergician} from 'mergician';
import type {UseApiDataOptions} from "nuxt-api-party/dist/runtime/composables/useApiData";
import {useSelfMemberStore} from "~/stores/useSelfMember";
import type {NuxtError} from "#app";

export const MIME_TYPE = "application/ld+json";
export const MIME_TYPE_JSON = "application/json";
export const MIME_TYPE_JSON_PATCH = "application/merge-patch+json"
export const MIME_TYPE_CSV = "text/csv"

const CONTENT_TYPE_FORM_DATA = "multipart/form-data"

async function useApi<T>(path: string, options: UseApiDataOptions<T>, requireLogin: boolean = true) {
  let overloadedOptions = {}

  if (requireLogin) {
    const selfStore = useSelfMemberStore()
    const jwtToken = await selfStore.enhanceJwtTokenDefined();
    // We throw an error if at this point we still don't have an access token
    if (!jwtToken.value || !jwtToken.value.access) {
      selfStore.logJwtError("No access token.")
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
    timeout: 30000, // Default timeout after 30s

    headers: {
      Accept: MIME_TYPE,
    },
  }, overloadedOptions)

  // We keep the original body for FormData values
  if (options.body instanceof FormData) {
    overloadedOptions.body = options.body
  }

  return await $localApi<T>(path, overloadedOptions);
}

export async function useLoginUser(email: string, password: string) {
  const { data, error } = await usePostRawJson("auth", {
    email: email,
    password: password
  });

  if (data) {
    const selfStore = useSelfMemberStore()
    selfStore.setJwtSelfJwtTokenFromApiResponse(data)
  }

  return { error };
}

export async function useLoginBadger(loginToken: string) {
  const { data } = await usePostRawJson("auth/bdg/" + loginToken);

  const selfStore = useSelfMemberStore()
  selfStore.setJwtSelfJwtTokenFromApiResponse(data)

  return true;
}




export async function usePostRawJson(path: string, payload?: object) {
  let data: any | undefined = undefined;
  let error: NuxtError | undefined = undefined;

  try {
    data = await $localApi(path, {
      method: "POST",
      headers: {
        Accept: MIME_TYPE_JSON,
      },
      body: payload
    });

  } catch (e) {
    error = e as NuxtError
  }

  return {
    data,
    error,
  };
}


export async function useFetchList<T>(resource: string): Promise<FetchAllData<T>> {
  let items: T[] = [];
  let totalItems: number | undefined = undefined;
  let view: View | undefined = undefined;
  let hubUrl: URL | undefined = undefined;
  let error: NuxtError | undefined = undefined;

  try {
    const data = await useApi<PagedCollection<T>>(resource, {

      onResponse({ response }) {
        hubUrl = extractHubURL(response);
      },
    });

    items = data["member"];
    view = data["view"];
    totalItems = data["totalItems"];
  } catch (e) {
    error = e as NuxtError;
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
  let error: NuxtError | undefined = undefined;

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
    error = e as NuxtError;
  }


  return {
    retrieved,
    error,
    hubUrl,
  };
}

export async function useCreateItem<T>(resource: string, payload: Item) {
  let created: T | undefined = undefined;
  let error: NuxtError | undefined = undefined;

  try {
    const data = await useApi<T>(resource, {
      method: "POST",
      body: payload,
    });

    created = data as T;
  } catch (e) {
    error = e as NuxtError
  }

  return {
    created,
    error,
  };
}

export async function useUploadFile(resource: string, payload: FormData, requireLogin: boolean = true) {
  let created: Object | undefined = undefined;
  let error: NuxtError | undefined = undefined;

  try {
    const data = await useApi(resource, {
      method: "POST",
      timeout: null, // No timeout for file upload
      headers: {
        Accept: MIME_TYPE_JSON,
      },
      body: payload,
    }, requireLogin);

    created = data as Object;
  } catch (e) {
    error = e as NuxtError
  }

  return {
    created,
    error,
  };
}

export async function useUpdateItem<T>(item: Item, payload: Item) {
  let updated: T | undefined = undefined;
  let error: NuxtError | undefined = undefined;

  try {
    const data = await useApi<T>(item["@id"] ?? "", {
      method: "PUT",
      body: payload,
      headers: {
        Accept: MIME_TYPE,
        "Content-Type": MIME_TYPE,
      },
    });

    updated = data as T;
  } catch (e) {
    error = e as NuxtError
  }

  return {
    updated,
    error,
  };
}

export async function useGetCsv(path: string) {
  let data = null;
  let error: NuxtError | undefined = undefined;

  try {
    data = await useApi(path, {
      method: "GET",
      headers: {
        Accept: MIME_TYPE_CSV,
      },
    });
  } catch (e) {
    error = e as NuxtError
  }

  return {
    data,
    error,
  };
}

export async function usePost<T>(path: string, payload: object) {
  let item: T | undefined = undefined;
  let error: NuxtError | undefined = undefined;

  try {
    const data = await useApi<T>(path, {
      method: "POST",
      timeout: 10000, // Timeout after 10s
      body: payload,
      headers: {
        Accept: MIME_TYPE,
        "Content-Type": MIME_TYPE,
      },
    });

    item = data as T;
  } catch (e) {
    error = e as NuxtError
  }

  return {
    item,
    error,
  };
}

export async function usePut(path: string, payload: object) {
  let updated: object | undefined = undefined;
  let error: NuxtError | undefined = undefined;

  try {
    updated = await useApi<object>(path, {
      method: "PUT",
      body: payload,
      headers: {
        Accept: MIME_TYPE,
        "Content-Type": MIME_TYPE,
      },
    });
  } catch (e) {
    error = e as NuxtError
  }

  return {
    updated,
    error,
  };
}


export async function usePatchItem<T>(item: Item, payload: Item) {
  let updated: T | undefined = undefined;
  let error: NuxtError | undefined = undefined;

  try {
    const data = await useApi(item["@id"] ?? "", {
      method: "PATCH",
      body: payload,
      headers: {
        Accept: MIME_TYPE,
        "Content-Type": MIME_TYPE_JSON_PATCH,
      },
    });

    updated = data as T;
  } catch (e) {
    error = e as NuxtError
  }

  return {
    updated,
    error,
  };
}

export async function useDeleteItem(item?: Item | null) {
  let error: Error | undefined = undefined;

  if (!item || !item["@id"]) {
    error = new Error("No item found. Please reload");
    return {
      error,
    };
  }

  try {
    const data = await useApi(item["@id"] ?? "", {
      method: "DELETE",
    });
  } catch (e) {
    error = e as Error
  }

  return {
    error,
  };
}
