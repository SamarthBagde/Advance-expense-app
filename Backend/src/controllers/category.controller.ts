import { asyncHandler } from "../middlewares/asyncHandler.js";
import type { NextFunction, Request, Response } from "express";
import { getCategoriesService, getCategoryByIdService } from "../services/category.service.js";

export const getCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await getCategoriesService();
        res.status(200).json({
            success: true,
            categories,
        });
    } catch (error) {
        next(error);
    }
})

export const getCategoryById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await getCategoryByIdService(req.params.id as string);
        res.status(200).json({
            success: true,
            category,
        });
    } catch (error) {
        next(error);
    }
})