import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import type { Response, Request, NextFunction } from "express";
import * as expenseService from "../services/expense.service.js";
import { sendResponse } from "../utils/sendResponse.js";
import { extracText } from "../services/ocr.service.js";
import { getStructuredExpenseFromText } from "../services/gemini.service.js";

export const addExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { categoryId, title, amount, expenseDate, paymentMethod, note } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return next(new AppError("Unauthorized", 401));
    }

    if (!categoryId || !title || !amount || !paymentMethod) {
        throw new AppError("Missing required fields", 400);
    }

    const expense = await expenseService.createExpense({ userId, categoryId, title, amount, expenseDate, paymentMethod, note });

    if (!expense) {
        return next(new AppError("Failed to create expense", 500));
    }

    return sendResponse(res, 201, "Expense created successfully", expense);
})

export const getAllExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const userId = req.user?.id;

    if (!userId) {
        return next(new AppError("Unauthorized", 401));
    }

    const expenses = await expenseService.getAllExpense(Number(userId));

    if (!expenses) {
        return next(new AppError("Failed to fetch expenses", 500));
    }

    return sendResponse(res, 200, "Expenses fetched successfully", expenses);
})

export const getExpenseById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;

    if (!id) {
        throw new AppError("Please provide expense id", 400);
    }

    const expense = await expenseService.getExpenseById(Number(id));

    if (!expense) {
        return next(new AppError("Failed to fetch expense", 500));
    }

    return sendResponse(res, 200, "Expense fetched successfully", expense);
})

export const deleteExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return next(new AppError("Unauthorized", 401));
    }

    if (!id) {
        throw new AppError("Please provide expense id", 400);
    }

    const expense = await expenseService.deleteExpense(Number(id), userId);

    if (!expense) {
        return next(new AppError("Failed to delete expense", 500));
    }

    return sendResponse(res, 200, "Expense deleted successfully");
})

export const updateExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return next(new AppError("Unauthorized", 401));
    }

    if (!id) {
        throw new AppError("Please provide expense id", 400);
    }

    const expense = await expenseService.updateExpense(Number(id), userId, req.body);

    if (!expense) {
        return next(new AppError("Failed to update expense", 500));
    }

    return sendResponse(res, 200, "Expense updated successfully", expense);
});

export const extracExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const file = req.file;

    if (!file) {
        return next(new AppError("Please provide expense image", 400));
    }

    const imagePath = file.path;
    const text = await extracText(imagePath);

    if (!text) {
        return next(new AppError("Failed to extract text from image", 500));
    }

    const expenseDraft = await getStructuredExpenseFromText(text)

    return sendResponse(res, 200, "Expense extracted successfully", expenseDraft);
})