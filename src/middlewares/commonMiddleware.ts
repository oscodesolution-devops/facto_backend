import httpContext from "express-http-context";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";
import { logger } from "@/server";

// Generate Request ID Middleware
const generateRequestId = (
    req: Request, 
    res: Response, 
    next: NextFunction
): void => {
    httpContext.set("requestId", uuidv4());
    next();
};

// Log Request Middleware
const logRequest = (
    req: Request, 
    res: Response, 
    next: NextFunction
): void => {
    const headers = JSON.stringify({}, null, 2);
    logger.info(
        `${req.protocol.toUpperCase()}-${req.httpVersion} ${req.method} ${req.url}, ` +
        `headers: ${headers}, ` +
        `query: ${JSON.stringify(req.query, null, 2)}, ` +
        `params: ${JSON.stringify(req.params, null, 2)}, ` +
        `body: ${JSON.stringify(req.body, null, 2)}`
    );
    next();
};

// Log Response Middleware
const logResponse = (
    req: Request, 
    res: Response, 
    next: NextFunction
): void => {
    res.on("finish", () => {
        logger.info("Request completed.");
    });
    next();
};

export { generateRequestId, logRequest, logResponse };