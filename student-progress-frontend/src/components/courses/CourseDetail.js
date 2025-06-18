import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        // Fetch course details
        const courseRes = await axios.get(`/api/courses/${id}`);
        setCourse(courseRes.data);
        setAssignments(courseRes.data.assignments || []);

        // Fetch progress for assignments
        if (courseRes.data.assignments && courseRes.data.assignments.length > 0) {
          const progressRes = await axios.get('/api/progress/student');
          
          // Create a map of assignment ID to progress
          const progressMap = {};
          progressRes.data.forEach(item => {
            progressMap[item.assignment] = item;
          });
          
          setProgress(progressMap);
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch course details');
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const getStatusClass = (assignmentId) => {
    if (!progress[assignmentId]) return 'bg-gray-200'; // Not started
    
    const status = progress[assignmentId].status;
    switch (status) {
      case 'completed':
        return 'bg-green-200 text-green-800';
      case 'in_progress':
        return 'bg-blue-200 text-blue-800';
      case 'late':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200';
    }
  };

  const getStatusText = (assignmentId) => {
    if (!progress[assignmentId]) return 'Not Started';
    
    const status = progress[assignmentId].status;
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'late':
        return 'Late';
      default:
        return 'Not Started';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  if (!course) {
    return <div className="text-center py-8">Course not found</div>;
  }

  return (
    <div className="course-detail">
      <div className="mb-6">
        <Link to="/courses" className="text-blue-600 hover:text-blue-800">
          ← Back to Courses
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <p className="text-sm text-gray-500">Instructor: {course.instructor}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Assignments</h2>
          
          {assignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map(assignment => (
                    <tr key={assignment._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(assignment._id)}`}>
                          {getStatusText(assignment._id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment.totalPoints}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/assignments/${assignment._id}`} className="text-blue-600 hover:text-blue-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No assignments available for this course.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;