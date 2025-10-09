import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../shared/types/express";
import { getUserWeightInKg } from "../settings/settings.function";
import * as settingService from "../settings/settings.service";
import { Setting, SETTINGS } from "../settings/settings.types";
import {
  compareWorkouts,
  computeWorkoutStats,
  estimateWorkoutCalories,
  getWorkoutInsights,
} from "./workouts.functions";
import * as workoutService from "./workouts.service";
import { Workout } from "./workouts.types";

export async function getWorkouts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const date = req.query.date
      ? new Date(req.query.date as string)
      : undefined;

    const workouts = await workoutService
      .fromUserId(req.user!._id)
      .getAll(date);
    res.json(workouts);
  } catch (error) {
    next(error);
  }
}

export async function getWorkoutsStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const stats = await workoutService
      .fromUserId(req.user!._id)
      .getStats(limit);
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

export async function saveWorkout(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const weightSetting = (await settingService
      .fromUserId(req.user!._id)
      .getOneFromSlug(SETTINGS.WEIGHT)) as Setting;

    const weightUnitSetting = (await settingService
      .fromUserId(req.user!._id)
      .getOneFromSlug(SETTINGS.WEIGHT)) as Setting;

    const userWeightKg = getUserWeightInKg(
      weightSetting,
      weightUnitSetting?.value
    );

    const calories = estimateWorkoutCalories(
      userWeightKg,
      req.body.exercises || []
    );

    const workout = (await workoutService.update({
      ...req.body,
      calories,
    })) as Workout;

    const lastWorkout = await workoutService
      .fromUserId(req.user!._id)
      .getLastSimilareWorkout(workout);

    if (lastWorkout) {
      const compute = computeWorkoutStats(workout as Workout);
      const lastCompute = computeWorkoutStats(lastWorkout as Workout);

      const compare = compareWorkouts(compute, lastCompute);

      const insights = getWorkoutInsights(compare);
      res.status(201).json({ workout, insights });
      return;
    }

    res.status(201).json({
      workout,
      insights: {
        highlights: [],
        improvements: [],
        regressions: [],
        suggestions: [],
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createWorkout(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = {
      ...req.body,
      userId: req.user!._id,
    };

    const activeWorkout = await workoutService
      .fromUserId(req.user!._id)
      .getActive();

    if (!!activeWorkout && !payload.endTime) {
      return res.status(400).json({
        message:
          "An active workout already exists. Please end the current workout before starting a new one.",
      });
    }

    const workout = await workoutService.create(payload);
    res.status(201).json(workout);
  } catch (error) {
    next(error);
  }
}

export async function deleteWorkout(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const workout = await workoutService.deleteById(req.params.id);
    res.json(workout);
  } catch (error) {
    next(error);
  }
}

export async function getCurrentWorkout(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const workout = await workoutService.fromUserId(req.user!._id).getActive();
    res.json(workout);
  } catch (error) {
    next(error);
  }
}

export async function updateCurrentWorkout(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const workout = await workoutService.update(req.body);
    res.json(workout);
  } catch (error) {
    next(error);
  }
}

export async function clearCurrentWorkout(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const workout = await workoutService.deleteById(req.body.workoutId);
    res.json(workout);
  } catch (error) {
    next(error);
  }
}
