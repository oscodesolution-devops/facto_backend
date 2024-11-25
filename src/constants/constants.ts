// Environments
export const PROD_ENVIRONMENT = ["prod", "PROD"];
export const DEV_ENVIRONMENT = ["dev", "DEV"];

// Pagination default values.
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NUMBER = 1;

export enum StatusCode {
    BAD_REQ = 400,
    OK = 200,
    INT_SER_ERR = 500,
    NOT_FOUND = 404,
    UNAUTH = 401,
    CREATED = 201,
  }