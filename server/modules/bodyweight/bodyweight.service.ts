import BodyweightModel from "./bodyweight.model";
import { BodyweightEntry } from "./bodyweight.types";

export function fromUserId(userId: string) {
  return {
    getAll() {
      return BodyweightModel.find({ userId }).sort({ date: 1 });
    },
    getLatest() {
      return BodyweightModel.findOne({ userId }).sort({ date: -1 });
    },
  };
}

export function create(entry: Partial<BodyweightEntry>) {
  return new BodyweightModel(entry).save();
}

export function deleteById(userId: string, entryId: string) {
  return BodyweightModel.deleteOne({ _id: entryId, userId });
}
