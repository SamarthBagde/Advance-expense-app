import { asyncHandler } from "../middlewares/asyncHandler.js";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError.js";
import type { IUser, IUserLoginDTO, IUserRegisterDTO, IUserResponseDTO } from "../types/user.type.js";
import * as userService from "../services/user.service.js";
import { sendToken } from "../utils/jwtToken.js";
import { comparePassword } from "../utils/comparePassword.js";
import { sendResponse } from "../utils/sendResponse.js";

export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { username, email, password, phone } = req.body as IUserRegisterDTO;

    if (!username || !email || !password) {
        return next(new AppError("Please fill all the required fields", 400));
    }

    const createdUser: IUserResponseDTO = await userService.createUser({
        username,
        email,
        password,
        phone
    });

    sendToken(createdUser, 201, res);
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body as IUserLoginDTO;

    if (!username || !password) {
        return next(new AppError("Please provide username and password", 400));
    }

    const userResponse: IUser | null = await userService.getUserByUserUserName(username);

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
});
export const getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const users = await userService.getAllUsers();

    if (!users) {
        return next(new AppError("Failed to fetch users", 500));
    }

    return sendResponse(res, 200, "Users fetched successfully", users);
})


export const getUserById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const id = Number(req.params.id);

    if (!id) {
        return next(new AppError("Please provide user id", 400));
    }

    const user = await userService.getUserById(id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    return sendResponse(res, 200, "User fetched successfully", user);
});

export const getAuthUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AppError("User not found", 404));
    }
    return sendResponse(res, 200, "Authenticated user profile fetched successfully", req.user);
});

