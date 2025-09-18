import { Request, RequestHandler } from 'express';
import { User } from '../../modules/auth/auth.types';


export interface AuthenticatedRequest extends Request {
  user?: User
}

export interface CustomRequestHandler extends RequestHandler {}