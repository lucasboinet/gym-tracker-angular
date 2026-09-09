import mongoose, { Schema } from "mongoose";
import { BodyweightEntry } from "./bodyweight.types";

const BodyweightSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    value: { type: Number, required: true },
    date: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

BodyweightSchema.index({ userId: 1, date: 1 });

const BodyweightModel = mongoose.model<BodyweightEntry>(
  "Bodyweight",
  BodyweightSchema
);

export default BodyweightModel;
