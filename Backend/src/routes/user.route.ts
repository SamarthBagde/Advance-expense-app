import { Router } from "express";
import { registerUser, login, getAllUsers, getUserById } from "../controllers/user.controller.js";

const userRouter = Router();


userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUserById);
userRouter.post("/register", registerUser);
userRouter.post("/login", login);

export default userRouter;