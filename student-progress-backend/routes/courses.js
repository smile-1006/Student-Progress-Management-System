const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');

// @route   POST api/courses
// @desc    Create a new course
// @access  Private (Admin only in a real app)
router.post('/', auth, courseController.createCourse);

// @route   GET api/courses
// @desc    Get all courses
// @access  Public
router.get('/', courseController.getAllCourses);

// @route   GET api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', courseController.getCourseById);

// @route   PUT api/courses/:id
// @desc    Update course
// @access  Private (Admin only in a real app)
router.put('/:id', auth, courseController.updateCourse);

// @route   DELETE api/courses/:id
// @desc    Delete course
// @access  Private (Admin only in a real app)
router.delete('/:id', auth, courseController.deleteCourse);

module.exports = router;