import { Router } from "express";
import { getCategories, getCategoryById } from "../controllers/category.controller.js";
import { protect } from "../controllers/aurh.controller.js";

const categoryRouter = Router();

categoryRouter.get("/", protect, getCategories);
categoryRouter.get("/:id", protect, getCategoryById)

export default categoryRouter;