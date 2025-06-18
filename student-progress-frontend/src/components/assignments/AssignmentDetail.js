import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submissionText, setSubmissionText] = useState('');

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        // Fetch assignment details
        const assignmentRes = await axios.get(`/api/assignments/${id}`);
        setAssignment(assignmentRes.data);

        // Fetch course details
        const courseRes = await axios.get(`/api/courses/${assignmentRes.data.course}`);
        setCourse(courseRes.data);

        // Fetch progress for this assignment
        const progressRes = await axios.get(`/api/progress/assignment/${id}`);
        if (progressRes.data) {
          setProgress(progressRes.data);
          setSubmissionText(progressRes.data.submissionText || '');
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch assignment details');
        setLoading(false);
      }
    };

    fetchAssignmentDetails();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/progress/submit', {
        assignmentId: id,
        submissionText
      });
      setProgress(res.data);
      alert('Assignment submitted successfully!');
    } catch (err) {
      setError(err.response.data.message || 'Failed to submit assignment');
    }
  };

  const getStatusBadge = () => {
    if (!progress) return <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">Not Started</span>;
    
    switch (progress.status) {
      case 'completed':
        return <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs">Completed</span>;
      case 'in_progress':
        return <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">In Progress</span>;
      case 'late':
        return <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs">Late</span>;
      default:
        return <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">Not Started</span>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  if (!assignment) {
    return <div className="text-center py-8">Assignment not found</div>;
  }

  return (
    <div className="assignment-detail">
      <div className="mb-6">
        <Link to={`/courses/${assignment.course}`} className="text-blue-600 hover:text-blue-800">
          ← Back to Course
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
              <p className="text-gray-600 mb-4">{assignment.description}</p>
              <p className="text-sm text-gray-500 mb-2">Course: {course?.title}</p>
              <p className="text-sm text-gray-500 mb-2">Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500 mb-4">Points: {assignment.totalPoints}</p>
              <div className="mb-4">{getStatusBadge()}</div>
            </div>
            
            {progress && progress.score !== undefined && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-1">Your Score</h3>
                <p className="text-3xl font-bold text-blue-600">{progress.score} / {assignment.totalPoints}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Submit Your Work</h2>
          
          {progress && progress.status === 'completed' ? (
            <div>
              <h3 className="text-lg font-medium mb-2">Your Submission</h3>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p>{progress.submissionText}</p>
              </div>
              
              {progress.feedback && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Instructor Feedback</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p>{progress.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="submission">
                  Your Answer
                </label>
                <textarea
                  id="submission"
                  rows="6"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Submit Assignment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;