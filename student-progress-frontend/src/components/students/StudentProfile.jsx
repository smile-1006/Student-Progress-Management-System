import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './CalendarHeatmap.css'; // You'll need to create this CSS file

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [contestStats, setContestStats] = useState(null);
  const [problemStats, setProblemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contests');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch student data
        const studentRes = await api.students.getById(id);
        setStudent(studentRes.data);
        
        // Fetch contest stats
        const contestRes = await api.contests.getContestStats(id);
        setContestStats(contestRes.data);
        
        // Fetch problem stats
        const problemRes = await api.problems.getProblemStats(id);
        setProblemStats(problemRes.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching student data:', error);
        setError('Failed to load student data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleSyncClick = async () => {
    try {
      await api.students.triggerSync(id);
      alert('Sync triggered successfully');
    } catch (error) {
      console.error('Error triggering sync:', error);
      alert('Error triggering sync');
    }
  };

  // Prepare data for calendar heatmap
  const prepareCalendarData = () => {
    if (!problemStats || !problemStats.submissionsByDate) return [];
    
    return Object.entries(problemStats.submissionsByDate).map(([date, count]) => ({
      date,
      count
    }));
  };

  // Prepare data for problem tags chart
  const prepareTagsData = () => {
    if (!problemStats || !problemStats.byTags) return [];
    
    return Object.entries(problemStats.byTags)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 tags
  };

  // Prepare data for problem ratings chart
  const prepareRatingsData = () => {
    if (!problemStats || !problemStats.byRating) return [];
    
    return Object.entries(problemStats.byRating)
      .map(([rating, count]) => ({ rating: Number(rating), count }))
      .sort((a, b) => a.rating - b.rating);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!student) {
    return <div className="text-center text-red-500">Student not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{student.name}</h1>
            <p className="text-gray-600 mb-1">Email: {student.email}</p>
            <p className="text-gray-600 mb-1">Codeforces Handle: {student.cfHandle || 'Not set'}</p>
            <p className="text-gray-600 mb-1">
              Last Sync: {student.lastSyncTime ? new Date(student.lastSyncTime).toLocaleString() : 'Never'}
            </p>
            <p className="text-gray-600">
              Email Notifications: {student.emailNotifications ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          
          <button
            onClick={handleSyncClick}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            disabled={!student.cfHandle}
          >
            Sync Codeforces Data
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'contests' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('contests')}
          >
            Contests
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'problems' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('problems')}
          >
            Problems
          </button>
        </div>
      </div>

      {activeTab === 'contests' && (
        <div>
          {contestStats && contestStats.totalContests > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Total Contests</h3>
                  <p className="text-3xl font-bold">{contestStats.totalContests}</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Highest Rating</h3>
                  <p className="text-3xl font-bold">{contestStats.highestRating}</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
                  <p className="text-3xl font-bold">{Math.round(contestStats.averageRating)}</p>
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Rating History</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={contestStats.ratingHistory}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="contestId" 
                        tick={false}
                        label={{ value: 'Contests', position: 'insideBottomRight', offset: -5 }} 
                      />
                      <YAxis 
                        label={{ value: 'Rating', angle: -90, position: 'insideLeft' }} 
                      />
                      <Tooltip 
                        formatter={(value, name) => [value, 'Rating']}
                        labelFormatter={(contestId) => {
                          const contest = contestStats.ratingHistory.find(c => c.contestId === contestId);
                          return contest ? `${contest.contestName} (${new Date(contest.date).toLocaleDateString()})` : '';
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rating" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Contests</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contest</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contestStats.recentContests.map((contest, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">{contest.contestName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{new Date(contest.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{contest.rank}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{contest.rating}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={contest.change > 0 ? 'text-green-500' : 'text-red-500'}>
                              {contest.change > 0 ? '+' : ''}{contest.change}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <p className="text-gray-500">No contest data available</p>
              {student.cfHandle ? (
                <p className="mt-2 text-sm text-gray-400">Try syncing Codeforces data</p>
              ) : (
                <p className="mt-2 text-sm text-gray-400">Set a Codeforces handle to track contest performance</p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'problems' && (
        <div>
          {problemStats && problemStats.totalProblems > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Total Problems</h3>
                  <p className="text-3xl font-bold">{problemStats.totalProblems}</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Solved Problems</h3>
                  <p className="text-3xl font-bold">{problemStats.solvedProblems}</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
                  <p className="text-3xl font-bold">
                    {Math.round((problemStats.solvedProblems / problemStats.attemptedProblems) * 100)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Problem Tags</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={prepareTagsData()}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="tag" 
                          type="category" 
                          tick={{ fontSize: 12 }} 
                          width={100}
                        />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Problem Ratings</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={prepareRatingsData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rating" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Submission Activity</h2>
                <div className="overflow-x-auto">
                  <CalendarHeatmap
                    startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                    endDate={new Date()}
                    values={prepareCalendarData()}
                    classForValue={(value) => {
                      if (!value || !value.count) return 'color-empty';
                      if (value.count < 3) return 'color-scale-1';
                      if (value.count < 6) return 'color-scale-2';
                      if (value.count < 9) return 'color-scale-3';
                      return 'color-scale-4';
                    }}
                    tooltipDataAttrs={(value) => {
                      if (!value || !value.date) return null;
                      return {
                        'data-tip': `${value.date}: ${value.count || 0} submissions`,
                      };
                    }}
                  />
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {problemStats.recentSubmissions.map((submission, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">{submission.name || submission.problemId}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{submission.rating || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs ${submission.status === 'AC' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {submission.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{new Date(submission.submissionTime).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <p className="text-gray-500">No problem data available</p>
              {student.cfHandle ? (
                <p className="mt-2 text-sm text-gray-400">Try syncing Codeforces data</p>
              ) : (
                <p className="mt-2 text-sm text-gray-400">Set a Codeforces handle to track problem solving</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentProfile;