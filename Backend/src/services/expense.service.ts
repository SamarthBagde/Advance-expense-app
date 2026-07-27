import Expense from "../models/expense.model.js";
import { AppError } from "../utils/appError.js";
import type { ICreateExpenseDTO } from "../types/expense.type.js";

export const createExpense = async (data: ICreateExpenseDTO): Promise<Expense> => {
    const { userId, categoryId, title, amount, paymentMethod } = data;

    if (!userId || !categoryId || !title || amount == null || !paymentMethod) {
        throw new AppError("Missing required expense fields", 400);
    }

    const expense = await Expense.create({
        ...data,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
    } as any);

    return expense;
};


export const getAllExpense = async (userId: number): Promise<Expense[]> => {

    if (!userId) {
        throw new AppError("User not found", 404);
    }

    const expenses = await Expense.findAll({ where: { userId } });

    return expenses;
}

export const getExpenseById = async (expenseId: number): Promise<Expense> => {

    if (!expenseId) {
        throw new AppError("Please provide expense id", 404);
    }

    const expense = await Expense.findByPk(expenseId);

    if (!expense) {
        throw new AppError("Expense not found", 404);
    }

    return expense;
}

export const deleteExpense = async (expenseId: number): Promise<Expense> => {

    if (!expenseId) {
        throw new AppError("Please provide expense id", 404);
    }

    const expense = await Expense.findByPk(expenseId);

    if (!expense) {
        throw new AppError("Expense not found", 404);
    }

    await expense.destroy();
    return expense;
}

// export const updateExpense = async (expenseId: number, data: ICreateExpenseDTO): Promise<Expense> => {

//     if (!expenseId) {
//         throw new AppError("Please provide expense id", 404);
//     }

//     const expense = await Expense.findByPk(expenseId);

//     if (!expense) {
//         throw new AppError("Expense not found", 404);
//     }

//     await expense.update(data);
//     return expense;
// }