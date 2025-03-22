import type { Item } from "../item";

export interface Image extends Item {
  id: string;
  name: string;
  base64: string;
  mimeType: string;
}
