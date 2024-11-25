import { Request, Response, NextFunction } from 'express';
import { DEV_ENVIRONMENT, PROD_ENVIRONMENT } from "@/constants/constants";
import { CustomAPIError } from "@/errors/customAPIError";
import { logger } from '@/server';
// import { logger } from "../server.js";


// Define error status interface
interface ErrorStatus {
  code: number;
  success: boolean;
}

// Define custom error interface
interface CustomError extends Error {
  status?: ErrorStatus;
  isOperational?: boolean;
  name: string;
  code?: number | string;
  path?: string;
  value?: any;
  errmsg?: string;
  errors?: Record<string, any>;
}

const isProd = PROD_ENVIRONMENT.includes(process.env.NODE_ENV || '');
const isDev = DEV_ENVIRONMENT.includes(process.env.NODE_ENV || '');

// Send error response for development
const sendErrorForDev = (err: CustomError, res: Response): void => {
  res.status(err.status?.code || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Send error response for production
const sendErrorForProd = (err: CustomError, res: Response): void => {
  if (err.isOperational) {
    res.status(err.status?.code || 500).json({
      status: err.status,
      error: { message: err.message },
    });
  } else {
    res.status(500).json({
      status: { code: 500, message: "fail" },
      error: { message: "Something went very wrong" },
    });
  }
};

// Handle Cast Error
const handleCastError = (err: CustomError): CustomAPIError => {
  const message = `Cannot find ${err.path}: ${err.value}`;
  return new CustomAPIError(message, 400);
};

// Handle Duplicate Field Error
const handleDuplicateFieldError = (err: CustomError): CustomAPIError => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || '';
  const message = `Duplicate field ${value}. Please use another one`;
  return new CustomAPIError(message, 400);
};

// Handle S3 Error
const handleS3Error = (): CustomAPIError => {
  const message = "Something went very wrong";
  return new CustomAPIError(message, 400);
};

// Handle Validation Error
const handleValidationError = (err: CustomError): CustomAPIError => {
  const errors = err.errors 
    ? Object.values(err.errors).map((error: any) => error.message)
    : [];
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new CustomAPIError(message, 400);
};

// Error Handler Middleware
const errorHandlerMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Set default error status
  err.status = err.status || { code: 500, success: false };
  
  // Set operational status
  err.isOperational = err.isOperational ?? true;

  if (!isDev) {
    let error: CustomError = Object.assign(Object.create(err), err);

    // Handle specific error types
    if (error.name === "CastError") {
      error = handleCastError(err);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldError(err);
    }
    if (error.name === "ValidationError") {
      error = handleValidationError(err);
    }

    // Handle S3-related errors
    if (
      err.code === "SignatureDoesNotMatch" ||
      err.code === "InvalidAccessKeyId" ||
      err.code === "NoSuchBucket"
    ) {
      error = handleS3Error();
    }

    sendErrorForProd(error, res);
  } else {
    sendErrorForDev(err, res);
  }

  // Log the error
  const logError = `StatusCode: ${err.status?.code} | Message: ${err.message} \n${err.stack}`;
  logger.error(logError);
};

export default errorHandlerMiddleware;