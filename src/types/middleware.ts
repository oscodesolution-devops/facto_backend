import { Request, Response, NextFunction } from 'express';

// Request Handler Type
export type RequestHandler = (
    req: Request, 
    res: Response, 
    next: NextFunction
) => void | Promise<void>;

// Error Request Handler Type
export type ErrorRequestHandler = (
    err: Error, 
    req: Request, 
    res: Response, 
    next: NextFunction
) => void | Promise<void>;