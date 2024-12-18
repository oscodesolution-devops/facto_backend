import * as dotenv from "dotenv";
import compression from "compression";
import cors from "cors";
import express, { Express, Request, Response, NextFunction } from "express";
import httpContext from "express-http-context";

// Import type definitions for custom middleware and error handlers
import { RequestHandler, ErrorRequestHandler } from "./types/middleware.js";
// import notFound from "./errors/notFound.js";
import errorHandlerMiddleware from "@/middlewares/errorHandler";
// import {
    // generateRequestId,

// } from "./middlewares/commonMiddleware.js";
import { connectDB } from "@/config/db";
import notFound from "@/errors/notFound";
import { generateRequestId,    logRequest,
    logResponse,} from "@/middlewares/commonMiddleware";
import router from "@/routes";
// import { connectDB } from "./config/db.js";

// Define CORS options with explicit typing
const corsOptions: cors.CorsOptions = {
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
};

// Load environment variables
dotenv.config({ path: `.env` });

// Create Express application
const app: Express = express();

connectDB()

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("dev", process.env.NODE_ENV || "development");

// Middleware configuration
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// CORS configuration
app.use(cors(corsOptions));
app.options("*", cors());


app.use(httpContext.middleware);
app.use(generateRequestId as RequestHandler);

// Request logging middleware
app.use(logRequest as RequestHandler);
app.use(logResponse as RequestHandler);

app.use(router);

// Error handling middleware
app.use(notFound as RequestHandler);
app.use(errorHandlerMiddleware as ErrorRequestHandler);

export default app;