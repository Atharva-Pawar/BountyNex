import { pino } from "pino";
import { pinoHttp } from "pino-http";
import { env, isTest } from "./env.js";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  base: { service: "bountynx-server" },
  transport: isTest
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss" },
      },
});

export const httpLogger = pinoHttp({
  logger,
  autoLogging: isTest ? false : true,
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
});
