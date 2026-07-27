import { Router } from "express";
import { addExpense, getAllExpense, getExpenseById, deleteExpense } from "../controllers/expense.controller.js";
import { protect } from "../controllers/auth.controller.js";

const expenseRouter = Router();

expenseRouter.get("/", protect, getAllExpense);
expenseRouter.post("/add", protect, addExpense);
expenseRouter.get("/:id", protect, getExpenseById);
expenseRouter.delete("/delete/:id", protect, deleteExpense);

export default expenseRouter;
