import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config';
import * as userService from "../auth/auth.service";
import { User } from './auth.types';
import crypto from 'crypto';

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const access_token = req.headers.authorization?.split(' ')[1];

    if (!access_token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decodedToken = await jwt.verify(access_token, config.security.tokenSecret) as User;

    const user = await userService.getOneById(decodedToken._id).select('-password -refresh_token');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, secret } = req.body;

    const user = await userService.getOneByEmail(identifier).select('-refresh_token');

    const hashedPassword = crypto.pbkdf2Sync(secret, config.security.salt, config.security.iteration, 64, 'sha512').toString('hex');

    if (!user || user.password !== hashedPassword) {
      return res.status(404).json({ message: 'Matching user not found' });
    }
  
    const payloadUser = { 
      email: user.email, 
      createdAt: user.createdAt, 
      updatedAt: user.updatedAt,
      _id: user._id
    }

    const access_token = jwt.sign(payloadUser, config.security.tokenSecret, { expiresIn: '4 hours', algorithm: 'HS256' });
    const refresh_token = jwt.sign(payloadUser, config.security.refreshTokenSecret, { expiresIn: '2 weeks', algorithm: 'HS256' });

    await userService.updateRefreshToken(user._id, refresh_token);

    res.json({ access_token, refresh_token })
  } catch (error) {
    next(error);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, confirmPassword } = req.body;

    const user = await userService.getOneByEmail(email);

    if (user) {
      return res.status(404).json({ message: 'Wrong informations given' });
    }

    if (password !== confirmPassword) {
      return res.status(404).json({ message: 'Wrong informations given' });
    }

    const hashedPassword = crypto.pbkdf2Sync(password, config.security.salt, config.security.iteration, 64, 'sha512').toString('hex');

    await userService.createUser(email, hashedPassword);

    res.send(201);
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const access_token = req.headers.authorization?.split(' ')[1];

    if (!access_token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decodedToken = await jwt.verify(access_token, config.security.tokenSecret) as User;

    await userService.updateRefreshToken(decodedToken._id, undefined);

    res.send(200);
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const refresh_token = req.headers.authorization?.split(' ')[1];

    if (!refresh_token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decodedToken = await jwt.verify(refresh_token, config.security.refreshTokenSecret) as User;

    const user = await userService.getOneById(decodedToken._id).select('-password');

    if (!user || user.refresh_token !== refresh_token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payloadUser = { 
      email: user.email, 
      createdAt: user.createdAt, 
      updatedAt: user.updatedAt,
      _id: user._id
    }

    const new_access_token = jwt.sign(payloadUser, config.security.tokenSecret, { expiresIn: '4 hours', algorithm: 'HS256' });

    res.json({ 
      access_token: new_access_token, 
      refresh_token: refresh_token 
    });

  } catch (error) {
    next(error);
  }
}