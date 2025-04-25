import type { Item } from "../item";

export enum GlobalSettingPublicEnum {
  LEGALS_LAST_UPDATE = 'LEGALS_LAST_UPDATE'
}

export interface GlobalSetting extends Item {
  name?: string;
  value?: string;
}
