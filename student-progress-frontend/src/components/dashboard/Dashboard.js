import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const Dashboard = () => {
  const { auth } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch progress statistics
        const statsRes = await axios.get('/api/progress/stats');
        setStats(statsRes.data);

        // Fetch recent courses
        const coursesRes = await axios.get('/api/courses');
        setRecentCourses(coursesRes.data.slice(0, 3)); // Get first 3 courses

        // Fetch upcoming assignments
        const assignmentsRes = await axios.get('/api/assignments');
        const now = new Date();
        const upcoming = assignmentsRes.data
          .filter(assignment => new Date(assignment.dueDate) > now)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5); // Get 5 upcoming assignments
        setUpcomingAssignments(upcoming);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare data for pie chart
  const prepareStatusData = () => {
    if (!stats) return [];
    
    return [
      { name: 'Completed', value: stats.completed },
      { name: 'In Progress', value: stats.inProgress },
      { name: 'Not Started', value: stats.notStarted },
      { name: 'Late', value: stats.late }
    ];
  };

  // Prepare data for calendar heatmap
  const prepareCalendarData = () => {
    if (!stats || !stats.progressByDay) return [];
    
    return Object.entries(stats.progressByDay).map(([date, count]) => ({
      date,
      count
    }));
  };

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Student Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {auth.student?.name}</h2>
        <p className="text-gray-600">Email: {auth.student?.email}</p>
        <p className="text-gray-600">Enrolled Courses: {auth.student?.enrolledCourses?.length || 0}</p>
      </div>
      
      {/* Progress Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Progress Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Assignment Progress</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {prepareStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</p>
              </div>
            </div>
          </div>
          
          {/* Activity Heatmap */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Activity (Last 30 Days)</h2>
            <CalendarHeatmap
              startDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
              endDate={new Date()}
              values={prepareCalendarData()}
              classForValue={(value) => {
                if (!value || value.count === 0) return 'color-empty';
                return `color-scale-${Math.min(value.count, 4)}`;
              }}
            />
            <div className="flex justify-center mt-2">
              <div className="flex items-center text-xs">
                <span>Less</span>
                <div className="flex mx-1">
                  <div className="w-3 h-3 bg-gray-100 mr-1"></div>
                  <div className="w-3 h-3 bg-green-200 mr-1"></div>
                  <div className="w-3 h-3 bg-green-300 mr-1"></div>
                  <div className="w-3 h-3 bg-green-400 mr-1"></div>
                  <div className="w-3 h-3 bg-green-500"></div>
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Courses and Upcoming Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Courses</h2>
          {recentCourses.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentCourses.map(course => (
                <li key={course._id} className="py-3">
                  <Link to={`/courses/${course._id}`} className="block hover:bg-gray-50">
                    <h3 className="text-lg font-medium text-blue-600">{course.title}</h3>
                    <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No courses available.</p>
          )}
          <div className="mt-4">
            <Link to="/courses" className="text-blue-500 hover:text-blue-700">View all courses →</Link>
          </div>
        </div>
        
        {/* Upcoming Assignments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Assignments</h2>
          {upcomingAssignments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {upcomingAssignments.map(assignment => (
                <li key={assignment._id} className="py-3">
                  <Link to={`/assignments/${assignment._id}`} className="block hover:bg-gray-50">
                    <h3 className="text-lg font-medium text-blue-600">{assignment.title}</h3>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Course: {assignment.course.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No upcoming assignments.</p>
          )}
          <div className="mt-4">
            <Link to="/assignments" className="text-blue-500 hover:text-blue-700">View all assignments →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;