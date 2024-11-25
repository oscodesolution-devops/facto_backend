import { Request, Response, NextFunction } from 'express';
import { createCustomError, CustomAPIError } from '@/errors/customAPIError';

const notFound = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const notFoundError: CustomAPIError = createCustomError(
    `Cannot find ${req.originalUrl} at this server`, 
    404
  );
  next(notFoundError);
};

export default notFound;