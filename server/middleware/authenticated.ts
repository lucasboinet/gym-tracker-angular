import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../shared/types/express";
import { getOneById } from "../modules/auth/auth.service";
import jwt from 'jsonwebtoken';
import config from "../config";
import { User } from "../modules/auth/auth.types";

export default async function authenticated(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decodedToken = await jwt.verify(token, config.security.tokenSecret) as User;

    const user = await getOneById(decodedToken._id)

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
}