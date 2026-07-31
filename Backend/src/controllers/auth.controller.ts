import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import type { NextFunction, Request, Response } from "express";
import { getEnvVariable } from "../utils/env.js";
import { getUserById } from "../services/user.service.js";

type TokenPayload = JwtPayload & { id: number };


export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.jwtToken) {
      token = req.cookies.jwtToken;
    }

    if (!token) {
      return next(
        new AppError("You are not logged in please log in to get access", 401),
      );
    }

    const jwtSecret = getEnvVariable("JWT_SECRET_KEY");
    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

    const userData = await getUserById(Number(decoded.id));

    if (!userData) {
      return next(
        new AppError("The user belonging to this token does no longer exist", 401)
      );
    }

    req.user = userData;

    next();
  },
);
