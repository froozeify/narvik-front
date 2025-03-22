import type {UuidItem} from "~/types/api/uuidItem";

export interface File extends UuidItem {
  publicUrl?: string
  publicInlineUrl?: string
  privateUrl?: string
}
