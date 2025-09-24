export interface SetType {
  weight: number;
  reps: number;
}

export interface IUpdateSet {
  id: string;
  index: number;
  type: 'reps' | 'weight';
  value: number;
}

export interface IRemoveSet {
  id: string;
  index: number;
}
