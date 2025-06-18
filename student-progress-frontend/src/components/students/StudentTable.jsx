import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import ModalForm from './ModalForm';

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/students');
      setStudents(res.data);
      
      // Prepare CSV data
      const csvData = res.data.map(student => ({
        Name: student.name,
        Email: student.email,
        'CF Handle': student.cfHandle || 'Not set',
        'Last Sync': student.lastSyncTime ? new Date(student.lastSyncTime).toLocaleString() : 'Never',
        'Sync Frequency': student.syncFrequency || 'Daily',
        'Email Notifications': student.emailNotifications ? 'Enabled' : 'Disabled',
        'Emails Sent': student.emailsSent || 0,
        'Last Submission': student.lastSubmissionDate ? new Date(student.lastSubmissionDate).toLocaleString() : 'Never',
        'Created At': new Date(student.createdAt).toLocaleString()
      }));
      setCsvData(csvData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentStudent(null);
    setShowModal(true);
  };

  const handleEditClick = (student) => {
    setCurrentStudent(student);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`/api/students/${id}`);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleSyncClick = async (id) => {
    try {
      await axios.post(`/api/students/${id}/sync`);
      alert('Sync triggered successfully');
    } catch (error) {
      console.error('Error triggering sync:', error);
      alert('Error triggering sync');
    }
  };

  const handleModalClose = (refresh = false) => {
    setShowModal(false);
    if (refresh) {
      fetchStudents();
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="flex space-x-4">
          <CSVLink
            data={csvData}
            filename={"students.csv"}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            target="_blank"
          >
            Export CSV
          </CSVLink>
          <button
            onClick={handleAddClick}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Add Student
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CF Handle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sync</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link to={`/students/${student._id}`} className="text-blue-600 hover:text-blue-900">
                    {student.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.cfHandle || 'Not set'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.lastSyncTime ? new Date(student.lastSyncTime).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleSyncClick(student._id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                    disabled={!student.cfHandle}
                  >
                    Sync
                  </button>
                  <button
                    onClick={() => handleEditClick(student)}
                    className="text-yellow-600 hover:text-yellow-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(student._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ModalForm
          student={currentStudent}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default StudentTable;