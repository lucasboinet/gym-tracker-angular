import WorkoutModel from "./workouts.model";
import { Workout } from "./workouts.types";

export function getAll() {
  return WorkoutModel.find();
}

export function getAllFromUser(userId: string) {
  return WorkoutModel.find({ userId });
}

export function create(workout: Workout) {
  return new WorkoutModel(workout).save();
}

export function update(workout: Workout) {
  return WorkoutModel.findByIdAndUpdate(
    workout._id,
    { $set: {
        ...workout
      }
    },
    { new: true, runValidators: true }
  );
}

export function deleteById(id: Workout['_id']) {
  return WorkoutModel.findByIdAndDelete(id);
}

export function getActive(userId: string) {
  return WorkoutModel.findOne({ userId, endTime: { $exists: false } });
}