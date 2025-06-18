const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

// Create a new assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, courseId, totalPoints } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const assignment = new Assignment({
      title,
      description,
      dueDate,
      course: courseId,
      totalPoints
    });

    await assignment.save();

    // Add assignment to course
    course.assignments.push(assignment._id);
    await course.save();

    res.status(201).json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('course', 'title')
      .sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, totalPoints } = req.body;

    let assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate || assignment.dueDate;
    assignment.totalPoints = totalPoints || assignment.totalPoints;

    await assignment.save();
    res.json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Remove assignment from course
    await Course.findByIdAndUpdate(assignment.course, {
      $pull: { assignments: assignment._id }
    });

    await assignment.remove();
    res.json({ message: 'Assignment removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get assignments by course
exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};