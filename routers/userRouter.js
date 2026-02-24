import express from 'express';
import User from '../model/user.js';
import { createUser, loginUser } from '../controller/userController.js'; // Add loginUser here


const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.post("/login", loginUser);


export default userRouter;   