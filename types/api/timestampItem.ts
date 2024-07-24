import type {Item} from "~/types/api/item";

export interface TimestampItem extends Item {
  createdAt?: string;
  updatedAt?: string;
}
