const Problem = require('../models/Problem');
const Student = require('../models/Student');

// Get all problems for a student
exports.getStudentProblems = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.student.id;
    
    const problems = await Problem.find({ student: studentId })
      .sort({ submissionTime: -1 });
    
    res.json(problems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get problem statistics for a student
exports.getProblemStats = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.student.id;
    
    const problems = await Problem.find({ student: studentId });
    
    if (problems.length === 0) {
      return res.json({
        totalProblems: 0,
        solvedProblems: 0,
        attemptedProblems: 0,
        byStatus: {},
        byTags: {},
        byRating: {},
        submissionsByDate: {},
        recentSubmissions: []
      });
    }
    
    // Count unique problems
    const uniqueProblemIds = new Set(problems.map(p => p.problemId));
    
    // Count solved problems (with AC status)
    const solvedProblemIds = new Set(
      problems
        .filter(p => p.status === 'AC')
        .map(p => p.problemId)
    );
    
    // Count by status
    const byStatus = {};
    problems.forEach(p => {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    });
    
    // Count by tags
    const byTags = {};
    problems.forEach(p => {
      if (p.tags && p.tags.length > 0) {
        p.tags.forEach(tag => {
          byTags[tag] = (byTags[tag] || 0) + 1;
        });
      }
    });
    
    // Count by rating
    const byRating = {};
    problems.forEach(p => {
      if (p.rating) {
        const ratingBucket = Math.floor(p.rating / 100) * 100;
        byRating[ratingBucket] = (byRating[ratingBucket] || 0) + 1;
      }
    });
    
    // Count submissions by date for heatmap
    const submissionsByDate = {};
    problems.forEach(p => {
      const date = p.submissionTime.toISOString().split('T')[0];
      submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
    });
    
    // Get recent submissions
    const recentSubmissions = problems
      .sort((a, b) => b.submissionTime - a.submissionTime)
      .slice(0, 10)
      .map(p => ({
        problemId: p.problemId,
        name: p.name,
        status: p.status,
        submissionTime: p.submissionTime,
        tags: p.tags,
        rating: p.rating
      }));
    
    res.json({
      totalProblems: uniqueProblemIds.size,
      solvedProblems: solvedProblemIds.size,
      attemptedProblems: uniqueProblemIds.size,
      byStatus,
      byTags,
      byRating,
      submissionsByDate,
      recentSubmissions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};