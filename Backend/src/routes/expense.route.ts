import { Router } from "express";
import * as ExpenseController from "../controllers/expense.controller.js";
import { protect } from "../controllers/auth.controller.js";

const expenseRouter = Router();

expenseRouter.get("/", protect, ExpenseController.getAllExpense);
expenseRouter.post("/add", protect, ExpenseController.addExpense);
expenseRouter.get("/:id", protect, ExpenseController.getExpenseById);
expenseRouter.put("/update/:id", protect, ExpenseController.updateExpense);
expenseRouter.delete("/delete/:id", protect, ExpenseController.deleteExpense);

export default expenseRouter;
