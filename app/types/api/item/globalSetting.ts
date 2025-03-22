import type { Item } from "../item";

export interface GlobalSetting extends Item {
  name?: string;
  value?: string;
}
