import { asyncHandler } from "../middlewares/asyncHandler.js";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError.js";
import type { IUser, IUserLoginDTO, IUserRegisterDTO, IUserResponseDTO } from "../types/user.type.js";
import { createUser, getUserByUserUserName } from "../services/user.service.js";
import { sendToken } from "../utils/jwtToken.js";
import { comparePassword } from "../utils/comparePassword.js";

export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { username, email, password, phone } = req.body as IUserRegisterDTO;

    if (!username || !email || !password) {
        return next(new AppError("Please fill all the required fields", 400));
    }

    const createdUser = await createUser({
        username,
        email,
        password,
        phone
    });

    const userResponse: IUserResponseDTO = {
        id: createdUser.id!,
        username: createdUser.username,
        email: createdUser.email,
        phone: createdUser.phone,
    };

    sendToken(userResponse, 201, res);
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body as IUserLoginDTO;

    if (!username || !password) {
        return next(new AppError("Please provide username and password", 400));
    }

    const userResponse: IUser | null = await getUserByUserUserName(username);

    if (!userResponse) {
        return next(new AppError("Invalid credentials", 401));
    }

    const isAuthenticate = await comparePassword(password, userResponse.password)
    if (!isAuthenticate) {
        return next(new AppError("Invalid credentials", 401));
    }

    sendToken({
        id: userResponse.id!,
        username: userResponse.username,
        email: userResponse.email,
        phone: userResponse.phone,
    } as IUserResponseDTO, 200, res);
})