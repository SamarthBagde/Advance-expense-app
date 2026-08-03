import { asyncHandler } from "../middlewares/asyncHandler.js";
import type { NextFunction, Request, Response } from "express";
import { getCategoriesService, getCategoryByIdService } from "../services/category.service.js";
import { sendResponse } from "../utils/sendResponse.js";
import type { ICategoryResponseDTO } from "../types/category.type.js";

export const getCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories: ICategoryResponseDTO[] = await getCategoriesService();
        return sendResponse<ICategoryResponseDTO[]>(res, 200, "Categories fetched successfully", categories);
    } catch (error) {
        next(error);
    }
})

export const getCategoryById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category: ICategoryResponseDTO | null = await getCategoryByIdService(req.params.id as string);
        return sendResponse<ICategoryResponseDTO | null>(res, 200, "Category fetched successfully", category);
    } catch (error) {
        next(error);
    }
})