import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../shared/types/express";
import * as settingService from "./settings.service";
import { Setting } from "./settings.types";

export async function getUsersSetting(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;

    const settings = await settingService.fromUserId(user!._id).getAll();
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function saveSetting(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const payload: Partial<Setting> = {
      ...req.body,
      userId: req.user?._id,
    };

    if (!payload._id) {
      const setting = await settingService.create(payload);
      res.json(setting);
      return;
    }

    const setting = await settingService.updateOne(payload);
    res.json(setting);
  } catch (err) {
    next(err);
  }
}

export async function deleteSetting(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const settingId = req.query.settingId as string;

    const setting = await settingService.deleteById(settingId);
    res.json(setting);
  } catch (err) {
    next(err);
  }
}
