export const LBS_PER_KG = 0.45359237;

/** Convert a value expressed in `unit` to kilograms. */
export function toKg(value: number, unit: string): number {
  if (unit === 'lbs') return value * LBS_PER_KG;
  return value;
}

/** Convert a value in kilograms to the given unit. */
export function fromKg(valueKg: number, unit: string): number {
  if (unit === 'lbs') return valueKg / LBS_PER_KG;
  return valueKg;
}

/** Round to one decimal place. */
export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
