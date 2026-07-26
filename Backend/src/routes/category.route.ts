import { Router } from "express";
import { getCategories, getCategoryById } from "../controllers/category.controller.js";

const categoryRouter = Router();

categoryRouter.get("/", getCategories);
categoryRouter.get("/:id", getCategoryById)

export default categoryRouter;