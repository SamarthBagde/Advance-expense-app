import { Router } from "express";
import { registerUser, login } from "../controllers/user.controller.js";

const userRouter = Router();


userRouter.post("/register", registerUser);
userRouter.post("/login", login);

export default userRouter;