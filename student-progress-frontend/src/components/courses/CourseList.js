import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch all courses
        const coursesRes = await axios.get('/api/courses');
        setCourses(coursesRes.data);

        // Fetch enrolled courses
        const profileRes = await axios.get('/api/students/profile');
        setEnrolledCourses(profileRes.data.enrolledCourses.map(course => course._id));
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch courses');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const enrollCourse = async (courseId) => {
    try {
      await axios.post('/api/students/enroll', { courseId });
      setEnrolledCourses([...enrolledCourses, courseId]);
    } catch (err) {
      setError(err.response.data.message || 'Failed to enroll in course');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="courses-list">
      <h1 className="text-3xl font-bold mb-6">Available Courses</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          const isEnrolled = enrolledCourses.includes(course._id);
          
          return (
            <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <p className="text-sm text-gray-500 mb-4">Instructor: {course.instructor}</p>
                
                {isEnrolled ? (
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-medium">Enrolled</span>
                    <Link 
                      to={`/courses/${course._id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                    >
                      View Course
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => enrollCourse(course._id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {courses.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No courses available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default CourseList;