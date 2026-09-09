export type BodyweightEntry = {
  _id: string;
  userId: string;
  /** Weight normalized to kilograms. */
  value: number;
  /** Date the measurement refers to. */
  date: Date;
  createdAt: Date;
};
