import mongoose, { Schema } from "mongoose";
import { Workout } from "./workouts.types";

const SetSchema = new mongoose.Schema(
  {
    weight: { type: Number, required: true },
    reps: { type: Number, required: true },
  },
);

const ExerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sets: { type: [SetSchema], required: true },
  },
);

const WorkoutSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: false },
    exercises: { type: [ExerciseSchema], required: true },
  },
  { timestamps: true }
);

const WorkoutModel = mongoose.model<Workout>("Workout", WorkoutSchema);

export default WorkoutModel;