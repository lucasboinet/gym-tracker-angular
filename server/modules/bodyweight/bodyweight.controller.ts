import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../shared/types/express";
import * as bodyweightService from "./bodyweight.service";

export async function getEntries(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const entries = await bodyweightService.fromUserId(req.user!._id).getAll();
    res.json(entries);
  } catch (err) {
    next(err);
  }
}

export async function createEntry(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const value = Number(req.body.value);

    if (!value || value <= 0) {
      res.status(400).json({ message: "A positive weight value is required." });
      return;
    }

    const entry = await bodyweightService.create({
      value,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      userId: req.user!._id,
    });

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

export async function deleteEntry(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const entry = await bodyweightService.deleteById(
      req.user!._id,
      req.params.id
    );
    res.json(entry);
  } catch (err) {
    next(err);
  }
}
