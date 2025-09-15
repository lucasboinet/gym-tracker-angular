import { Request, RequestHandler } from 'express';
// import { IStoredUser } from '../../modules/users/users.model';


export interface CustomRequest extends Request {
  // user?: IStoredUser
}

export interface CustomRequestHandler extends RequestHandler {}