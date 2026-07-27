import { asyncHandler } from "../middlewares/asyncHandler.js";
import type { NextFunction, Request, Response } from "express";
import { getCategoriesService, getCategoryByIdService } from "../services/category.service.js";
import { sendResponse } from "../utils/sendResponse.js";

export const getCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await getCategoriesService();
        return sendResponse(res, 200, "Categories fetched successfully", categories);
    } catch (error) {
        next(error);
    }
})

export const getCategoryById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await getCategoryByIdService(req.params.id as string);
        return sendResponse(res, 200, "Category fetched successfully", category);
    } catch (error) {
        next(error);
    }
})