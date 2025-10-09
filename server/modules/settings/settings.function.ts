import { Setting } from "./settings.types";

export const LBS_BASE = 0.45359237;

export function getUserWeightInKg(
  setting?: Setting,
  unit: string = "kg"
): number {
  if (!setting || !setting.value) return 0;

  if (unit === "lbs") {
    return parseFloat(setting.value) * 0.45359237;
  }

  return parseFloat(setting.value);
}
