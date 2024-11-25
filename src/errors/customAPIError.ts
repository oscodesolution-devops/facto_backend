/* eslint-disable @typescript-eslint/ban-types */
interface ErrorStatus {
    code: number;
    success: boolean;
  }
  
  class CustomAPIError extends Error {
    status: ErrorStatus;
    isOperational: boolean;
    path?: string;
    value?: any;
  
    constructor(message: string, statusCode: number = 500) {
      super(message);
      this.name = 'CustomAPIError';
      this.status = { code: statusCode, success: false };
      this.isOperational = true;
      
      // Maintains proper stack trace for TypeScript
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  const createCustomError = (message: string, statusCode: number = 500): CustomAPIError => {
    return new CustomAPIError(message, statusCode);
  };
  
  export { CustomAPIError, createCustomError };