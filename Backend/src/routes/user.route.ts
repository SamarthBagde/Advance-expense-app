import { Router } from "express";
import * as UserController from "../controllers/user.controller.js";
import { protect } from "../controllers/auth.controller.js";

const userRouter = Router();

userRouter.post("/register", UserController.registerUser);
userRouter.post("/login", UserController.login);
userRouter.get("/auth", protect, UserController.getAuthUser);
userRouter.get("/", protect, UserController.getAllUsers);
userRouter.get("/:id", protect, UserController.getUserById);

export default userRouter;