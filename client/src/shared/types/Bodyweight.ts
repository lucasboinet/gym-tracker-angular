export interface BodyweightEntry {
  _id?: string;
  userId?: string;
  /** Weight normalized to kilograms. */
  value: number;
  date: string | Date;
  createdAt?: string | Date;
}
