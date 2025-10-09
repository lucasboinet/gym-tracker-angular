import SettingModel from "./settings.model";
import { Setting } from "./settings.types";

export function fromUserId(userId: string) {
  return {
    getAll() {
      return SettingModel.find({ userId }).sort({ slug: 1 });
    },
  };
}

export function updateOne(payload: Partial<Setting>) {
  return SettingModel.findOneAndUpdate(
    { _id: payload._id },
    { $set: { ...payload } },
    { new: true }
  );
}

export function create(setting: Partial<Setting>) {
  return new SettingModel(setting).save();
}

export function deleteById(settingId: string) {
  return SettingModel.deleteOne({ _id: settingId });
}
