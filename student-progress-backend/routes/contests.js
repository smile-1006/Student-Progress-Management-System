const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const auth = require('../middleware/auth');

// @route   GET api/contests
// @desc    Get contests for current student
// @access  Private
router.get('/', auth, contestController.getStudentContests);

// @route   GET api/contests/stats
// @desc    Get contest statistics for current student
// @access  Private
router.get('/stats', auth, contestController.getContestStats);

// @route   GET api/contests/student/:studentId
// @desc    Get contests for a specific student
// @access  Private
router.get('/student/:studentId', auth, contestController.getStudentContests);

// @route   GET api/contests/stats/student/:studentId
// @desc    Get contest statistics for a specific student
// @access  Private
router.get('/stats/student/:studentId', auth, contestController.getContestStats);

module.exports = router;