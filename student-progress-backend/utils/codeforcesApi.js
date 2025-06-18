const axios = require('axios');
const Student = require('../models/Student');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');

// Base URL for Codeforces API
const CF_API_BASE = 'https://codeforces.com/api';

// Fetch user rating history
const fetchUserRating = async (handle) => {
  try {
    const response = await axios.get(`${CF_API_BASE}/user.rating?handle=${handle}`);
    if (response.data.status === 'OK') {
      return response.data.result;
    }
    return [];
  } catch (error) {
    console.error(`Error fetching rating for ${handle}:`, error.message);
    return [];
  }
};

// Fetch user submissions
const fetchUserSubmissions = async (handle) => {
  try {
    const response = await axios.get(`${CF_API_BASE}/user.status?handle=${handle}`);
    if (response.data.status === 'OK') {
      return response.data.result;
    }
    return [];
  } catch (error) {
    console.error(`Error fetching submissions for ${handle}:`, error.message);
    return [];
  }
};

// Sync contest data for a student
const syncContestData = async (studentId, handle) => {
  try {
    const ratingHistory = await fetchUserRating(handle);
    
    // Process each contest
    for (const contest of ratingHistory) {
      await Contest.findOneAndUpdate(
        { student: studentId, contestId: contest.contestId },
        {
          student: studentId,
          contestId: contest.contestId,
          contestName: contest.contestName,
          rank: contest.rank,
          oldRating: contest.oldRating,
          newRating: contest.newRating,
          ratingChange: contest.newRating - contest.oldRating,
          date: new Date(contest.ratingUpdateTimeSeconds * 1000)
        },
        { upsert: true, new: true }
      );
    }
    
    return ratingHistory.length;
  } catch (error) {
    console.error(`Error syncing contest data for ${handle}:`, error.message);
    throw error;
  }
};

// Map Codeforces verdict to our status enum
const mapVerdict = (verdict) => {
  switch (verdict) {
    case 'OK': return 'AC';
    case 'WRONG_ANSWER': return 'WA';
    case 'TIME_LIMIT_EXCEEDED': return 'TLE';
    case 'MEMORY_LIMIT_EXCEEDED': return 'MLE';
    case 'RUNTIME_ERROR': return 'RE';
    case 'COMPILATION_ERROR': return 'CE';
    default: return 'OTHER';
  }
};

// Sync submission data for a student
const syncSubmissionData = async (studentId, handle) => {
  try {
    const submissions = await fetchUserSubmissions(handle);
    let lastSubmissionDate = null;
    
    // Process each submission
    for (const submission of submissions) {
      const submissionTime = new Date(submission.creationTimeSeconds * 1000);
      
      // Update last submission date
      if (!lastSubmissionDate || submissionTime > lastSubmissionDate) {
        lastSubmissionDate = submissionTime;
      }
      
      // Create problem record
      await Problem.findOneAndUpdate(
        { student: studentId, submissionId: submission.id },
        {
          student: studentId,
          problemId: `${submission.problem.contestId}${submission.problem.index}`,
          contestId: submission.problem.contestId,
          name: submission.problem.name,
          tags: submission.problem.tags,
          rating: submission.problem.rating,
          status: mapVerdict(submission.verdict),
          submissionId: submission.id,
          submissionTime: submissionTime
        },
        { upsert: true, new: true }
      );
    }
    
    // Update student's last submission date
    if (lastSubmissionDate) {
      await Student.findByIdAndUpdate(studentId, { lastSubmissionDate });
    }
    
    return submissions.length;
  } catch (error) {
    console.error(`Error syncing submission data for ${handle}:`, error.message);
    throw error;
  }
};

// Check if student is inactive (no submissions in last 7 days)
const checkInactivity = async (studentId) => {
  try {
    const student = await Student.findById(studentId);
    if (!student.lastSubmissionDate) return true;
    
    const now = new Date();
    const lastSubmission = new Date(student.lastSubmissionDate);
    const diffDays = Math.floor((now - lastSubmission) / (1000 * 60 * 60 * 24));
    
    return diffDays >= 7;
  } catch (error) {
    console.error(`Error checking inactivity for student ${studentId}:`, error.message);
    return false;
  }
};

module.exports = {
  fetchUserRating,
  fetchUserSubmissions,
  syncContestData,
  syncSubmissionData,
  checkInactivity
};