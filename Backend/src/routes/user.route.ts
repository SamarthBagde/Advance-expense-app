import { Router } from "express";
import * as UserController from "../controllers/user.controller.js";

const userRouter = Router();


userRouter.get("/", UserController.getAllUsers);
userRouter.get("/:id", UserController.getUserById);
userRouter.post("/register", UserController.registerUser);
userRouter.post("/login", UserController.login);

export default userRouter;