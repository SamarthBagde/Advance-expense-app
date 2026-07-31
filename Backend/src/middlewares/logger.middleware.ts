import type { Request, Response, NextFunction } from "express";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toLocaleString();
    const { method, originalUrl } = req;
    const { statusCode } = res;

    // ANSI Color formatting for terminal logging
    const reset = "\x1b[0m";
    const bold = "\x1b[1m";
    const cyan = "\x1b[36m";
    const green = "\x1b[32m";
    const yellow = "\x1b[33m";
    const red = "\x1b[31m";

    let statusColor = green;
    if (statusCode >= 400 && statusCode < 500) {
      statusColor = yellow;
    } else if (statusCode >= 500) {
      statusColor = red;
    }

    console.log(
      `[${timestamp}] ${bold}${cyan}${method}${reset} ${originalUrl} ${statusColor}${statusCode}${reset} - ${duration}ms`
    );
  });

  next();
};
