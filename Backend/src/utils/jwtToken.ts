import jwt from "jsonwebtoken";
import { getEnvVariable } from "./env.js";
import type { IUserResponseDTO } from "../types/user.type.js";
import type { Response } from "express";

export const signToken = (id: number | string) => {
  const expiresIn = getEnvVariable("JWT_EXPIRES_IN");
  // Using user id to create jwt token
  return jwt.sign({ id }, getEnvVariable("JWT_SECRET_KEY"), {
    expiresIn: expiresIn as any,
  });
};

export const sendToken = (
  user: IUserResponseDTO,
  statusCode: number,
  res: Response,
) => {
  const token = signToken(user.id);


  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // this is cookie exp
    httpOnly: true,
  };

  res.status(statusCode).cookie("jwtToken", token, options).json({
    status: "Success",
    token,
    data: {
      user,
    },
  });
};
