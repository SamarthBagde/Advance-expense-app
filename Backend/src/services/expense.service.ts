import Expense from "../models/expense.model.js";
import Category from "../models/category.model.js";
import { AppError } from "../utils/appError.js";
import type { ICreateExpenseDTO, IUpdateExpenseDTO } from "../types/expense.type.js";

export const createExpense = async (data: ICreateExpenseDTO): Promise<Expense> => {
    const { userId, categoryId, title, amount, paymentMethod } = data;

    if (!userId || !categoryId || !title || amount == null || !paymentMethod) {
        throw new AppError("Missing required expense fields", 400);
    }

    const expense = await Expense.create({
        ...data,
        type: data.type || "DEBITED",
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
    } as any);

    return expense;
};


export const getAllExpense = async (userId: number): Promise<Expense[]> => {

    if (!userId) {
        throw new AppError("User not found", 404);
    }

    const expenses = await Expense.findAll({
        where: { userId },
        include: [
            {
                model: Category,
                as: "category",
                attributes: ["id", "title"],
            },
        ],
    });

    return expenses;
}

export const getExpenseById = async (expenseId: number): Promise<Expense> => {

    if (!expenseId) {
        throw new AppError("Please provide expense id", 404);
    }

    const expense = await Expense.findByPk(expenseId, {
        include: [
            {
                model: Category,
                as: "category",
                attributes: ["id", "title"],
            },
        ],
    });

    if (!expense) {
        throw new AppError("Expense not found", 404);
    }

    return expense;
}

export const deleteExpense = async (expenseId: number, userId: number): Promise<Expense> => {

    if (!expenseId) {
        throw new AppError("Please provide expense id", 400);
    }

    const expense = await Expense.findByPk(expenseId);

    if (!expense) {
        throw new AppError("Expense not found", 404);
    }

    if (expense.userId !== userId) {
        throw new AppError("You do not have permission to delete this expense", 403);
    }

    await expense.destroy();
    return expense;
}

export const updateExpense = async (expenseId: number, userId: number, data: IUpdateExpenseDTO): Promise<Expense> => {
    if (!expenseId) {
        throw new AppError("Please provide expense id", 400);
    }

    const expense = await Expense.findByPk(expenseId);

    if (!expense) {
        throw new AppError("Expense not found", 404);
    }

    if (expense.userId !== userId) {
        throw new AppError("You do not have permission to update this expense", 403);
    }

    // Whitelist allowed fields to prevent modifying critical info (id, userId, createdAt, updatedAt)
    const allowedFields = ["title", "amount", "categoryId", "type", "expenseDate", "paymentMethod", "note"];
    const sanitizedData: Record<string, any> = {};

    for (const key of allowedFields) {
        if (key in (data as any) && (data as any)[key] !== undefined) {
            sanitizedData[key] = (data as any)[key];
        }
    }

    await expense.update(sanitizedData);
    return expense;
};