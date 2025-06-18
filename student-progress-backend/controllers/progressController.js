const Progress = require('../models/Progress');
const Assignment = require('../models/Assignment');
const nodemailer = require('nodemailer');

// Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, submissionText } = req.body;
    const studentId = req.student.id;

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if already submitted
    let progress = await Progress.findOne({ student: studentId, assignment: assignmentId });
    
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const status = now > dueDate ? 'late' : 'completed';

    if (progress) {
      // Update existing progress
      progress.status = status;
      progress.submissionDate = now;
      progress.submissionText = submissionText;
    } else {
      // Create new progress
      progress = new Progress({
        student: studentId,
        assignment: assignmentId,
        status,
        submissionDate: now,
        submissionText
      });
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get progress for a student
exports.getStudentProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ student: req.student.id })
      .populate('assignment')
      .sort({ submissionDate: -1 });
    
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get progress for an assignment
exports.getAssignmentProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      student: req.student.id,
      assignment: req.params.assignmentId
    });
    
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Grade assignment (for instructors)
exports.gradeAssignment = async (req, res) => {
  try {
    const { progressId, score, feedback } = req.body;

    const progress = await Progress.findById(progressId);
    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }

    progress.score = score;
    progress.feedback = feedback;

    await progress.save();

    // Send email notification to student
    // This would require setting up nodemailer with proper credentials
    // sendGradingNotification(progress);

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to send email notification
const sendGradingNotification = async (progress) => {
  try {
    // This is a placeholder for actual email sending logic
    // You would need to set up nodemailer with proper credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Get student and assignment details
    const student = await Student.findById(progress.student);
    const assignment = await Assignment.findById(progress.assignment);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: `Your assignment "${assignment.title}" has been graded`,
      text: `
        Hello ${student.name},

        Your assignment "${assignment.title}" has been graded.
        Score: ${progress.score}/${assignment.totalPoints}

        Feedback: ${progress.feedback || 'No feedback provided.'}

        Best regards,
        Student Progress Management System
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email notification error:', error);
  }
};