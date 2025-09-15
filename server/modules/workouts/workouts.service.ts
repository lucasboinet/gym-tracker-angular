import WorkoutModel from "./workouts.model";
import { Workout } from "./workouts.types";

export function getAll() {
  return WorkoutModel.find();
}

export function create(workout: Workout) {
  return new WorkoutModel(workout).save();
}

export function update(workout: Workout) {
  return WorkoutModel.findByIdAndUpdate(
    workout._id,
    workout,
    { new: true, runValidators: true }
  );
}

export function deleteById(id: Workout['_id']) {
  return WorkoutModel.findByIdAndDelete(id);
}

export function getActive() {
  return WorkoutModel.findOne({ endTime: { $exists: false } });
}

export function updateActive(workout: Workout) {
  return WorkoutModel.findOneAndUpdate(
    { _id: workout._id },
    workout,
    { new: true, runValidators: true }
  );
}

export function deleteActive(workoutId: Workout['_id']) {
  return WorkoutModel.deleteOne({ _id: workoutId });
}