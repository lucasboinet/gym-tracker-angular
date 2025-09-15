import { NextFunction, Request, Response } from "express";
import * as workoutService from "./workouts.service";

export async function getWorkouts(req: Request, res: Response, next: NextFunction) {
  try {
    const workouts = await workoutService.getAll();
    res.json(workouts);
  } catch(error) {
    next(error);
  }
}

export async function saveWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const workout = await workoutService.update(req.body);
    res.status(201).json(workout);
  } catch(error) {
    next(error);
  }
}

export async function createWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const workout = await workoutService.create(req.body); 
    res.status(201).json(workout);
  } catch(error) {
    next(error);
  }
}

export async function deleteWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const workout = await workoutService.deleteById(req.params.id);
    res.json(workout);
  } catch(error) {
    next(error);
  }
}

export async function getCurrentWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const workout = await workoutService.getActive();
    res.json(workout);
  } catch(error) {
    next(error);
  }
}

export async function updateCurrentWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const workout = await workoutService.updateActive(req.body);
    res.json(workout);
  } catch(error) {
    next(error);
  }
}

export async function clearCurrentWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const workout = await workoutService.deleteActive(req.body.workoutId);
    res.json(workout);
  } catch(error) {
    next(error);
  }
}