const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const auth = require('../middleware/auth');

// @route   GET api/problems
// @desc    Get problems for current student
// @access  Private
router.get('/', auth, problemController.getStudentProblems);

// @route   GET api/problems/stats
// @desc    Get problem statistics for current student
// @access  Private
router.get('/stats', auth, problemController.getProblemStats);

// @route   GET api/problems/student/:studentId
// @desc    Get problems for a specific student
// @access  Private
router.get('/student/:studentId', auth, problemController.getStudentProblems);

// @route   GET api/problems/stats/student/:studentId
// @desc    Get problem statistics for a specific student
// @access  Private
router.get('/stats/student/:studentId', auth, problemController.getProblemStats);

module.exports = router;