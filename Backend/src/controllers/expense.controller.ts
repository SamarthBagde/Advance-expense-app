import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import type { Response, Request, NextFunction } from "express";
import fs from "fs";
import * as expenseService from "../services/expense.service.js";
import { sendResponse } from "../utils/sendResponse.js";
import { extracText } from "../services/ocr.service.js";
import { getStructuredExpenseFromText } from "../services/gemini.service.js";
import { transcribeAudioWithVosk } from "../services/vosk.service.js";
import type Expense from "../models/expense.model.js";
import type { IExpenseFilterDTO, IExtractedExpense, SortByField, SortOrder } from "../types/expense.type.js";

export const addExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { categoryId, title, amount, type, expenseDate, paymentMethod, note } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return next(new AppError("Unauthorized", 401));
    }

    if (!categoryId || !title || !amount || !paymentMethod) {
        throw new AppError("Missing required fields", 400);
    }

    const expense: Expense = await expenseService.createExpense({ userId, categoryId, title, amount, type, expenseDate, paymentMethod, note });

    if (!expense) {
        return next(new AppError("Failed to create expense", 500));
    }

    return sendResponse<Expense>(res, 201, "Expense created successfully", expense);
})

export const getAllExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const userId = req.user?.id;

    if (!userId) {
        return next(new AppError("Unauthorized", 401));
    }

    const { categoryId, startDate, endDate, expenseDate, sortBy, sortOrder } = req.query;

    const filters: IExpenseFilterDTO = {};
    if (categoryId) filters.categoryId = Number(categoryId);
    if (startDate) filters.startDate = String(startDate);
    if (endDate) filters.endDate = String(endDate);
    if (expenseDate) filters.expenseDate = String(expenseDate);
    if (sortBy) filters.sortBy = String(sortBy) as SortByField;
    if (sortOrder) filters.sortOrder = String(sortOrder) as SortOrder;

    const expenses: Expense[] = await expenseService.getAllExpense(Number(userId), filters);

    if (!expenses) {
        return next(new AppError("Failed to fetch expenses", 500));
    }

    return sendResponse<Expense[]>(res, 200, "Expenses fetched successfully", expenses);
})

export const getExpenseById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;

    if (!id) {
        throw new AppError("Please provide expense id", 400);
    }

    const expense: Expense = await expenseService.getExpenseById(Number(id));

    if (!expense) {
        return next(new AppError("Failed to fetch expense", 500));
    }

    return sendResponse<Expense>(res, 200, "Expense fetched successfully", expense);
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

    return sendResponse(res, 204, "Expense deleted successfully");
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

    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const expense: Expense = await expenseService.updateExpense(Number(id), userId, updateData);

    if (!expense) {
        return next(new AppError("Failed to update expense", 500));
    }

    return sendResponse<Expense>(res, 200, "Expense updated successfully", expense);
});

export const extracExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const file = req.file;

    if (!file) {
        return next(new AppError("Please provide expense image", 400));
    }

    const imagePath = file.path;
    const text: string = await extracText(imagePath);

    if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
    }

    if (!text) {
        return next(new AppError("Failed to extract text from image", 500));
    }

    const expenseDraft: IExtractedExpense = await getStructuredExpenseFromText(text);

    return sendResponse<IExtractedExpense>(res, 200, "Expense extracted successfully", expenseDraft);
});

export const extracExpenseFromText = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { text } = req.body;

    if (!text) {
        return next(new AppError("Please provide expense text", 400));
    }

    const expenseDraft: IExtractedExpense = await getStructuredExpenseFromText(text)

    if (!expenseDraft) {
        return next(new AppError("Failed to extract expense from text", 500));
    }

    return sendResponse<IExtractedExpense>(res, 200, "Expense extracted successfully", expenseDraft);
})

export const extractExpenseFromAudioHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;

    if (!file) {
        return next(new AppError("Please provide audio file", 400));
    }

    const transcript = await transcribeAudioWithVosk(file.path);
    console.log(`Transcript: ${transcript}`)

    if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
    }

    if (!transcript) {
        return next(new AppError("Could not transcribe audio speech", 400));
    }

    const expense = await getStructuredExpenseFromText(transcript);

    return sendResponse<IExtractedExpense>(
        res,
        200,
        "Audio expense extracted successfully",
        expense
    );
});