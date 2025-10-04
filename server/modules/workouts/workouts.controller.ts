import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../shared/types/express";
import * as workoutService from "./workouts.service";

export async function getWorkouts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const date = req.query.date
      ? new Date(req.query.date as string)
      : undefined;

    const workouts = await workoutService.getAllFromUser(req.user!._id, date);
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

    const stats = await workoutService.getStats(req.user!._id, limit);
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
    const workout = await workoutService.update(req.body);
    res.status(201).json(workout);
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

    const activeWorkout = await workoutService.getActive(req.user!._id);

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
    const workout = await workoutService.getActive(req.user!._id);
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
