import { AppError } from "../utils/appError.js";
import type { Request, Response, NextFunction } from "express";

const sendError = (err: AppError, res: Response) => {
  // Operational (client‑side) errors are safe to expose
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Unexpected errors → hide details, log for developers
    console.error("❗️ Unexpected error:", err);
    if (process.env.NODE_ENV !== "production") {
      console.error(err.stack);
    }
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

/* -------------------------------------------------
   DB‑specific error converters – they return AppError
--------------------------------------------------- */
const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((e: any) => e.message);
  const message = `Invalid input data. ${errors.join(", ")}`;
  return new AppError(message, 400);
};

const handleSequelizeUniqueConstraintError = (err: any) => {
  const errors = Object.values(err.errors).map((e: any) => e.message);
  const message = `Invaid input data. ${errors.join(", ")}`;
  return new AppError(message, 400);
};

const handleJWTError = (): AppError =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = (): AppError =>
  new AppError("Your token has expired! Please log in again.", 401);

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = err;

  if (error.name === "CastError") {
    error = handleCastErrorDB(error);
  }
  if (error.name === "SequelizeUniqueConstraintError") {
    error = handleSequelizeUniqueConstraintError(err);
  }
  if (error.name === "ValidationError") {
    error = handleValidationErrorDB(error);
  }
  if (error.name === "JsonWebTokenError") {
    error = handleJWTError();
  }
  if (error.name === "TokenExpiredError") {
    error = handleJWTExpiredError();
  }
  sendError(error, res);
};
