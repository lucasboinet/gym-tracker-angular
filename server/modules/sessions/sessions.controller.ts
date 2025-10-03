import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../shared/types/express";
import * as sessionService from "./sessions.service";

export async function getSessions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!._id;

    const sessions = await sessionService.getAllFromUser(userId);

    res.json(sessions);
  } catch (err) {
    next(err);
  }
}

export async function createSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = {
      ...req.body,
      userId: req.user!._id,
    };
    const sessions = await sessionService.create(payload);
    res.status(201).json(sessions);
  } catch (err) {
    next(err);
  }
}

export async function updateSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const workout = await sessionService.updateOneById(req.params.id, req.body);
    res.json(workout);
  } catch (err) {
    next(err);
  }
}

export async function deleteSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await sessionService.deleteOneById(req.params.id);
    res.json(session);
  } catch (err) {
    next(err);
  }
}
