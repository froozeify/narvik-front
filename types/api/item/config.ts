import type { Item } from "../item";

export interface Config extends Item {
  id: string;
  appVersion?: string;
  logo?: string;
  modules?: object;
}
