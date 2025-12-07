import mongoose, { Schema } from "mongoose";
import { Workout } from "./workouts.types";

export const SetSchema = new mongoose.Schema(
  {
    weight: { type: Number, required: true },
    reps: { type: Number, required: true },
  },
  { _id: false }
);

export const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: [SetSchema], required: true },
  notes: { type: String, required: false, default: "" },
});

const WorkoutSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      default: undefined,
    },
    calories: { type: Number },
    startTime: { type: String, required: true },
    endTime: { type: String, required: false },
    exercises: { type: [ExerciseSchema], required: true },
  },
  { timestamps: true }
);

const WorkoutModel = mongoose.model<Workout>("Workout", WorkoutSchema);

export default WorkoutModel;
