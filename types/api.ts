import type {SubmissionErrors} from "./error";
import type {View} from "./view";

export interface FetchAllData<T> {
  items: T[];
  totalItems: number | undefined
  view: View | undefined;
  error: Error | null;
  hubUrl: URL | undefined;
}

export interface FetchItemData<T> {
  retrieved: T | undefined;
  error: Error | null;
  hubUrl: URL | undefined;
}

export interface CreateItemData<T> {
  created: T | undefined;
  error: Error | null;
}

export interface UpdateItemData<T> {
  updated: T | undefined;
  error: Error | null;
}
