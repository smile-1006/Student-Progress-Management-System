import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle specific error codes
    if (error.response) {
      // Handle 401 Unauthorized errors (token expired)
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        // You could redirect to login page here
        // window.location.href = '/login';
      }
      
      // Handle 500 server errors
      if (error.response.status >= 500) {
        console.error('Server Error:', error.response.data);
      }
    } else if (error.request) {
      // Network error (server not responding)
      console.error('Network Error:', error.request);
    } else {
      // Other errors
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API service object with methods for different endpoints
const apiService = {
  // Auth endpoints
  auth: {
    register: (userData) => api.post('/students/register', userData),
    login: (credentials) => api.post('/students/login', credentials),
    getProfile: () => api.get('/students/profile'),
  },
  
  // Students endpoints
  students: {
    getAll: () => api.get('/students'),
    getById: (id) => api.get(`/students/${id}`),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
    triggerSync: (id) => api.post(`/students/${id}/sync`),
    updateSyncConfig: (id, config) => api.put(`/students/${id}/sync-config`, config),
  },
  
  // Courses endpoints
  courses: {
    getAll: () => api.get('/courses'),
    getById: (id) => api.get(`/courses/${id}`),
    create: (data) => api.post('/courses', data),
    update: (id, data) => api.put(`/courses/${id}`, data),
    delete: (id) => api.delete(`/courses/${id}`),
    enroll: (courseId) => api.post('/students/enroll', { courseId }),
  },
  
  // Assignments endpoints
  assignments: {
    getAll: () => api.get('/assignments'),
    getById: (id) => api.get(`/assignments/${id}`),
    getByCourse: (courseId) => api.get(`/assignments/course/${courseId}`),
    create: (data) => api.post('/assignments', data),
    update: (id, data) => api.put(`/assignments/${id}`, data),
    delete: (id) => api.delete(`/assignments/${id}`),
  },
  
  // Progress endpoints
  progress: {
    getAll: () => api.get('/progress'),
    getByAssignment: (assignmentId) => api.get(`/progress/assignment/${assignmentId}`),
    getStats: () => api.get('/progress/stats'),
    submit: (data) => api.post('/progress', data),
    update: (id, data) => api.put(`/progress/${id}`, data),
  },
  
  // Contests endpoints
  contests: {
    getStudentContests: (studentId) => api.get(`/contests/student/${studentId || 'me'}`),
    getContestStats: (studentId) => api.get(`/contests/stats/student/${studentId || 'me'}`),
  },
  
  // Problems endpoints
  problems: {
    getStudentProblems: (studentId) => api.get(`/problems/student/${studentId || 'me'}`),
    getProblemStats: (studentId) => api.get(`/problems/stats/student/${studentId || 'me'}`),
  },
};

export default apiService;