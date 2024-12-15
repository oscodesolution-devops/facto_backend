import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createCustomError } from '@/errors/customAPIError';
import { StatusCode } from '@/constants/constants';
import { db } from '@/models';


export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log(token)
    if (!token) {
      return next(createCustomError('No token provided', StatusCode.UNAUTH));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    
    const user = await db.User.findById(decoded.userId);

    if (!user) {
      return next(createCustomError('User not found', StatusCode.UNAUTH));
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error)
    next(createCustomError('Invalid token', StatusCode.UNAUTH));
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      next(createCustomError('Access denied. Admin rights required.', StatusCode.UNAUTH));
    }
  };
