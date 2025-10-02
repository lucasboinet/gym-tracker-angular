import mongoose from "mongoose";
import config from "../config";
import WorkoutModel from "../modules/workouts/workouts.model";

async function run() {
  try {
    await mongoose.connect(config.database.url);

    await WorkoutModel.aggregate([
      {
        $addFields: {
          firstExercise: { $arrayElemAt: ["$exercises.name", 0] },
        },
      },
      {
        $lookup: {
          from: "sessions",
          let: { firstExercise: "$firstExercise", userId: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
            { $unwind: "$exercises" },
            {
              $match: {
                $expr: { $eq: ["$exercises.name", "$$firstExercise"] },
              },
            },
            { $limit: 1 },
          ],
          as: "matchedSession",
        },
      },
      {
        $addFields: {
          sessionId: { $arrayElemAt: ["$matchedSession._id", 0] },
        },
      },
      {
        $project: {
          firstExercise: 0,
          matchedSession: 0,
        },
      },
      {
        $merge: {
          into: "workouts",
          on: "_id",
          whenMatched: "merge",
          whenNotMatched: "discard",
        },
      },
    ]);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
