import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const ProgressReport = () => {
  const [progressData, setProgressData] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch progress data
        const progressRes = await axios.get('/api/progress/student');
        setProgressData(progressRes.data);

        // Fetch assignments
        const assignmentsRes = await axios.get('/api/assignments');
        setAssignments(assignmentsRes.data);

        // Fetch courses
        const coursesRes = await axios.get('/api/courses');
        setCourses(coursesRes.data);

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch progress data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for pie chart
  const statusCounts = progressData.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = [
    { name: 'Completed', value: statusCounts.completed || 0, color: '#4CAF50' },
    { name: 'In Progress', value: statusCounts.in_progress || 0, color: '#2196F3' },
    { name: 'Late', value: statusCounts.late || 0, color: '#F44336' },
    { name: 'Not Started', value: statusCounts.not_started || 0, color: '#9E9E9E' }
  ];

  // Prepare data for heatmap
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(today.getMonth() - 5);

  const heatmapData = progressData
    .filter(item => item.submissionDate)
    .map(item => ({
      date: item.submissionDate.split('T')[0],
      count: 1
    }));

  // Group by date
  const heatmapDataGrouped = heatmapData.reduce((acc, item) => {
    acc[item.date] = (acc[item.date] || 0) + item.count;
    return acc;
  }, {});

  // Convert to array format for heatmap
  const heatmapValues = Object.keys(heatmapDataGrouped).map(date => ({
    date,
    count: heatmapDataGrouped[date]
  }));

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  return (
    <div className="progress-report">
      <h1 className="text-3xl font-bold mb-6">Progress Report</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Assignment Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Submission Activity</h2>
          <div className="mt-4">
            <CalendarHeatmap
              startDate={startDate}
              endDate={today}
              values={heatmapValues}
              classForValue={(value) => {
                if (!value) return 'color-empty';
                return `color-scale-${Math.min(value.count, 4)}`;
              }}
              tooltipDataAttrs={(value) => {
                if (!value || !value.date) return null;
                return {
                  'data-tip': `${value.date}: ${value.count} submission(s)`
                };
              }}
            />
            <div className="flex justify-end mt-2 text-xs text-gray-500">
              <div className="flex items-center">
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
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Assignment Progress</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {progressData.map(progress => {
                const assignment = assignments.find(a => a._id === progress.assignment);
                if (!assignment) return null;
                
                const course = courses.find(c => c._id === assignment.course);
                
                return (
                  <tr key={progress._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{course ? course.title : 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(progress.status)}`}>
                        {getStatusText(progress.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {progress.score !== undefined ? `${progress.score} / ${assignment.totalPoints}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/assignments/${assignment._id}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-200 text-green-800';
    case 'in_progress':
      return 'bg-blue-200 text-blue-800';
    case 'late':
      return 'bg-red-200 text-red-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In Progress';
    case 'late':
      return 'Late';
    case 'not_started':
      return 'Not Started';
    default:
      return 'Unknown';
  }
};

export default ProgressReport;