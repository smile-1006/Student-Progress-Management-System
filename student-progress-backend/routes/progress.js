const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

// @route   POST api/progress
// @desc    Create or update progress
// @access  Private
router.post('/', auth, progressController.createOrUpdateProgress);

// @route   GET api/progress/student
// @desc    Get all progress for current student
// @access  Private
router.get('/student', auth, progressController.getStudentProgress);

// @route   GET api/progress/assignment/:assignmentId
// @desc    Get progress for specific assignment
// @access  Private
router.get('/assignment/:assignmentId', auth, progressController.getProgressByAssignment);

// @route   GET api/progress/course/:courseId
// @desc    Get progress for specific course
// @access  Private
router.get('/course/:courseId', auth, progressController.getProgressByCourse);

// @route   GET api/progress/stats
// @desc    Get progress statistics
// @access  Private
router.get('/stats', auth, progressController.getProgressStats);

module.exports = router;