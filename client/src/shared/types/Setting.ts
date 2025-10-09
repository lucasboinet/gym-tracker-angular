export interface Setting {
  _id?: string;
  userId?: string;
  slug: SETTINGS;
  value: any;
}

export enum SETTINGS {
  HEIGHT = 'global.height',
  WEIGHT = 'global.weight',
  HEIGHT_UNIT = 'global.height.unit',
  WEIGHT_UNIT = 'global.weight.unit',
}

export const SETTINGS_DEFAULT_VALUES: Record<SETTINGS, any> = {
  [SETTINGS.HEIGHT]: 0,
  [SETTINGS.WEIGHT]: 0,
  [SETTINGS.HEIGHT_UNIT]: 'cm',
  [SETTINGS.WEIGHT_UNIT]: 'kg',
};

export const SETTINGS_INPUT_LABELS: Record<SETTINGS, string> = {
  [SETTINGS.HEIGHT]: 'Height',
  [SETTINGS.WEIGHT]: 'Weight',
  [SETTINGS.HEIGHT_UNIT]: 'Height Unit',
  [SETTINGS.WEIGHT_UNIT]: 'Weight Unit',
};
