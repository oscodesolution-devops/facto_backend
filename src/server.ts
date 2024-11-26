import winston from "winston";
import './config/module-alias';
import http from "http";
import express from "express";
import app from "@/app";
import { configDotenv } from "dotenv";

configDotenv()
const { combine, timestamp, printf, colorize, align } = winston.format;

interface LoggerConfig {
  level: string;
  format: winston.Logform.Format;
  transports: winston.transports.ConsoleTransportInstance[];
}

const logger: winston.Logger = winston.createLogger({
  level: 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    align(),
    printf((info): string => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console()],
} as LoggerConfig);

const server: http.Server = http.createServer(app);

server.listen(app.get("port"), (): void => {
  logger.info(
    ` App is running at http://localhost:${app.get("port")} in ${
      app.get("dev")} mode`
  );
  logger.info("  Press CTRL-C to stop");
});

function shutDown(): void {
  logger.info("Received kill signal, shutting down gracefully");
  logger.info("Shutting down schedulers gracefully");

  server.close((): void => {
    logger.info("Closed out remaining connections");
    process.exit(0);
  });
}

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);

export { server, logger };