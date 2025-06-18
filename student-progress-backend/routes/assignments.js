const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const auth = require('../middleware/auth');

// @route   POST api/assignments
// @desc    Create a new assignment
// @access  Private
router.post('/', auth, assignmentController.createAssignment);

// @route   GET api/assignments
// @desc    Get all assignments
// @access  Private
router.get('/', auth, assignmentController.getAllAssignments);

// @route   GET api/assignments/:id
// @desc    Get assignment by ID
// @access  Private
router.get('/:id', auth, assignmentController.getAssignmentById);

// @route   PUT api/assignments/:id
// @desc    Update assignment
// @access  Private
router.put('/:id', auth, assignmentController.updateAssignment);

// @route   DELETE api/assignments/:id
// @desc    Delete assignment
// @access  Private
router.delete('/:id', auth, assignmentController.deleteAssignment);

// @route   GET api/assignments/course/:courseId
// @desc    Get assignments by course ID
// @access  Private
router.get('/course/:courseId', auth, assignmentController.getAssignmentsByCourse);

module.exports = router;