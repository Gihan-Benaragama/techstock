import express from 'express';
import User from '../model/user.js';
import { createUser, loginUser, googleLogin, getAllUsers } from '../controller/userController.js'; // Add loginUser here


const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.post("/login", loginUser);
userRouter.post("/google-login", googleLogin);
userRouter.get("/", getAllUsers);


export default userRouter;   
