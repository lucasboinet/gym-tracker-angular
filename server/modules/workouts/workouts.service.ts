import WorkoutModel from "./workouts.model";
import { Workout } from "./workouts.types";

export function getAll() {
  return WorkoutModel.find().sort({ createdAt: -1 });
}

export function getAllFromUser(userId: string, date?: Date) {
  if (date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    return WorkoutModel.find({
      userId,
      createdAt: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    }).sort({ createdAt: -1 });
  }

  return WorkoutModel.find({ userId }).sort({ createdAt: -1 });
}

export function getStats(userId: string, limit: number) {
  return WorkoutModel.aggregate([
    { $match: { userId: userId } },
    { $sort: { createdAt: -1 } },
    { $limit: limit },
    { $unwind: "$exercises" },
    { $unwind: "$exercises.sets" },
    {
      $addFields: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      },
    },
    {
      $group: {
        _id: {
          exercise: "$exercises.name",
          date: "$date",
        },
        sets: {
          $push: {
            weight: "$exercises.sets.weight",
            reps: "$exercises.sets.reps",
          },
        },
      },
    },
    {
      $project: {
        exercise: "$_id.exercise",
        date: "$_id.date",
        heaviestSet: {
          $first: {
            $sortArray: { input: "$sets", sortBy: { weight: -1 } },
          },
        },
      },
    },
    {
      $group: {
        _id: "$exercise",
        history: {
          $push: {
            date: "$date",
            weight: "$heaviestSet.weight",
            reps: "$heaviestSet.reps",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        exerciseName: "$_id",
        history: {
          $sortArray: { input: "$history", sortBy: { createdAt: 1 } }, // oldest → newest
        },
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
