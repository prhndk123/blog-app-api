import express  from "express";
import { createUserController, deleteUserController, getUserController, getUsersController, updateUserController } from "../controllers/user.controller.js";
import { createUserValidator } from "../validators/user.validator.js";

const userRouter = express.Router();

userRouter.get("/", getUsersController)
userRouter.get("/:id", getUserController)
userRouter.post("/", createUserValidator,createUserController)
userRouter.patch("/:id", updateUserController)
userRouter.delete("/:id", deleteUserController)
// url params = (/,/:id,dst)

export {userRouter};