// controllers/studentController.js
import Student from '../model/student.js';

export async function createStudent(req, res) {
  try {
    console.log('Creating student with data:', req.body);
    
    const student = new Student(req.body);
    const savedStudent = await student.save();
    
    console.log('Student created:', savedStudent._id);
    
    res.status(201).json({
      message: 'Student created successfully',
      student: savedStudent
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(400).json({ 
      error: error.message 
    });
  }
}

export async function getStudent(req, res) {
  try {
    const students = await Student.find();
    console.log('Found', students.length, 'students');
    
    res.json({
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
}