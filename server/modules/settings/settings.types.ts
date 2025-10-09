export type Setting = {
  _id: string;
  userId: string;
  slug: string;
  value: any;
};

export enum SETTINGS {
  HEIGHT = "global.height",
  WEIGHT = "global.weight",
  HEIGHT_UNIT = "global.height.unit",
  WEIGHT_UNIT = "global.weight.unit",
}
