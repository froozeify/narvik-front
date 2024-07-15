import type {Item} from "~/types/item";

export interface TimestampItem extends Item {
  createdAt?: string;
  updatedAt?: string;
}
