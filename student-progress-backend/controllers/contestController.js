const Contest = require('../models/Contest');
const Student = require('../models/Student');

// Get all contests for a student
exports.getStudentContests = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.student.id;
    
    const contests = await Contest.find({ student: studentId })
      .sort({ date: -1 });
    
    res.json(contests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get contest statistics for a student
exports.getContestStats = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.student.id;
    
    const contests = await Contest.find({ student: studentId })
      .sort({ date: 1 });
    
    if (contests.length === 0) {
      return res.json({
        totalContests: 0,
        highestRating: 0,
        lowestRating: 0,
        averageRating: 0,
        ratingHistory: [],
        recentContests: []
      });
    }
    
    // Calculate statistics
    const ratings = contests.map(c => c.newRating).filter(r => r !== undefined);
    const highestRating = Math.max(...ratings);
    const lowestRating = Math.min(...ratings);
    const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    
    // Prepare rating history for chart
    const ratingHistory = contests.map(c => ({
      contestId: c.contestId,
      contestName: c.contestName,
      date: c.date,
      rating: c.newRating,
      change: c.ratingChange
    }));
    
    // Get recent contests
    const recentContests = contests.slice(0, 5).map(c => ({
      contestId: c.contestId,
      contestName: c.contestName,
      date: c.date,
      rank: c.rank,
      rating: c.newRating,
      change: c.ratingChange
    }));
    
    res.json({
      totalContests: contests.length,
      highestRating,
      lowestRating,
      averageRating,
      ratingHistory,
      recentContests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};