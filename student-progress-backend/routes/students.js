const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');

// @route   POST api/students/register
// @desc    Register a student
// @access  Public
router.post('/register', studentController.registerStudent);

// @route   POST api/students/login
// @desc    Login student
// @access  Public
router.post('/login', studentController.loginStudent);

// @route   GET api/students/profile
// @desc    Get student profile
// @access  Private
router.get('/profile', auth, studentController.getStudentProfile);

// @route   POST api/students/enroll
// @desc    Enroll in a course
// @access  Private
router.post('/enroll', auth, studentController.enrollCourse);

// @route   GET api/students
// @desc    Get all students
// @access  Private
router.get('/', auth, studentController.getAllStudents);

// @route   GET api/students/:id
// @desc    Get student by ID
// @access  Private
router.get('/:id', auth, studentController.getStudentById);

// @route   PUT api/students/:id
// @desc    Update student
// @access  Private
router.put('/:id', auth, studentController.updateStudent);

// @route   DELETE api/students/:id
// @desc    Delete student
// @access  Private
router.delete('/:id', auth, studentController.deleteStudent);

// @route   POST api/students/:id/sync
// @desc    Trigger manual CF sync
// @access  Private
router.post('/:id/sync', auth, studentController.triggerSync);

// @route   PUT api/students/:id/sync-config
// @desc    Update sync time/frequency
// @access  Private
router.put('/:id/sync-config', auth, studentController.updateSyncConfig);

// @route   GET api/students/download
// @desc    Download CSV
// @access  Private
router.get('/download', auth, studentController.downloadStudentsCSV);

module.exports = router;