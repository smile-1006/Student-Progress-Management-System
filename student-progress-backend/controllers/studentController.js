const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new student
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if student already exists
    let student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new student
    student = new Student({
      name,
      email,
      password: hashedPassword
    });

    await student.save();

    // Create JWT token
    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login student
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if student exists
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student profile
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id)
      .select('-password')
      .populate('enrolledCourses');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Enroll in a course
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const student = await Student.findById(req.student.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if already enrolled
    if (student.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    student.enrolledCourses.push(courseId);
    await student.save();

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add these functions to your existing studentController.js
const { Parser } = require('json2csv');
const { syncStudentData } = require('../utils/cronJobs');

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const { name, email, cfHandle, emailNotifications } = req.body;
    
    // Check if student exists
    let student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if CF handle changed
    const handleChanged = student.cfHandle !== cfHandle;
    
    // Update student
    student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, cfHandle, emailNotifications },
      { new: true }
    ).select('-password');
    
    // If CF handle changed, trigger sync
    if (handleChanged && cfHandle) {
      // Trigger sync in background
      syncStudentData(student._id, cfHandle).catch(err => {
        console.error(`Error syncing data for ${cfHandle}:`, err.message);
      });
    }
    
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await student.remove();
    
    res.json({ message: 'Student removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Trigger manual sync for a student
exports.triggerSync = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (!student.cfHandle) {
      return res.status(400).json({ message: 'No Codeforces handle set for this student' });
    }
    
    // Trigger sync
    const success = await syncStudentData(student._id, student.cfHandle);
    
    if (success) {
      res.json({ message: 'Sync triggered successfully' });
    } else {
      res.status(500).json({ message: 'Error triggering sync' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update sync config
exports.updateSyncConfig = async (req, res) => {
  try {
    const { syncFrequency } = req.body;
    
    if (!['daily', 'weekly', 'biweekly'].includes(syncFrequency)) {
      return res.status(400).json({ message: 'Invalid sync frequency' });
    }
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { syncFrequency },
      { new: true }
    ).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Download students as CSV
exports.downloadStudentsCSV = async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    
    const fields = [
      'name',
      'email',
      'cfHandle',
      'lastSyncTime',
      'syncFrequency',
      'emailNotifications',
      'emailsSent',
      'lastSubmissionDate',
      'createdAt'
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(students);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('students.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};