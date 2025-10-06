import mongoose, { Schema } from "mongoose";
import { ExerciseSchema } from "../workouts/workouts.model";
import { Session } from "./sessions.types";

const SessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    color: { type: String, required: true, default: "#f3e8ff" },
    exercises: { type: [ExerciseSchema], required: true },
  },
  { timestamps: true }
);

const SessionModel = mongoose.model<Session>("Session", SessionSchema);

export default SessionModel;
