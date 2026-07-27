import { Router } from "express";
import * as CategoryController from "../controllers/category.controller.js";
import { protect } from "../controllers/auth.controller.js";

const categoryRouter = Router();

categoryRouter.get("/", protect, CategoryController.getCategories);
categoryRouter.get("/:id", protect, CategoryController.getCategoryById)

export default categoryRouter;