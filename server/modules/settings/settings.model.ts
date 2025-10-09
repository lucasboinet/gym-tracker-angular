import mongoose, { Schema } from "mongoose";
import { Setting } from "./settings.types";

const SettingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    slug: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

const SettingModel = mongoose.model<Setting>("Setting", SettingSchema);

export default SettingModel;
