// routes/studentRouter.js (or routers/studentRouter.js)
import express from 'express';
import { createStudent, getStudent } from '../controller/studentController.js';
const studentRouter = express.Router();

// POST a new student
studentRouter.post('/', createStudent);

// GET all students
studentRouter.get('/', getStudent);

export default studentRouter;