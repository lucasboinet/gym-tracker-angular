import WorkoutModel from "./workouts.model";
import { Workout } from "./workouts.types";

export function getAll() {
  return WorkoutModel.find().sort({ createdAt: -1 });
}

export function getAllFromUser(userId: string) {
  return WorkoutModel.find({ userId }).sort({ createdAt: -1 });
}

export function getStats(userId: string, limit: number) {
  return WorkoutModel.aggregate([
    { $match: { userId: userId } },
    { $limit: limit },
    { $unwind: "$exercises" },
    { $unwind: "$exercises.sets" },
    {
      $project: {
        exerciseName: "$exercises.name",
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        weight: "$exercises.sets.weight",
      },
    },
    {
      $group: {
        _id: "$exerciseName",
        weights: {
          $push: { k: "$date", v: "$weight" },
        },
      },
    },
    {
      $project: {
        _id: 0,
        exerciseName: "$_id",
        weights: { $arrayToObject: "$weights" },
      },
    },
  ]);
}

export function create(workout: Workout) {
  return new WorkoutModel(workout).save();
}

export function update(workout: Workout) {
  return WorkoutModel.findByIdAndUpdate(
    workout._id,
    {
      $set: {
        ...workout,
      },
    },
    { new: true, runValidators: true }
  );
}

export function deleteById(id: Workout["_id"]) {
  return WorkoutModel.findByIdAndDelete(id);
}

export function getActive(userId: string) {
  return WorkoutModel.findOne({ userId, endTime: { $exists: false } });
}
