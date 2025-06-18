const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { setupCronJobs } = require('./utils/cronJobs');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const assignmentRoutes = require('./routes/assignments');
const progressRoutes = require('./routes/progress');
const contestRoutes = require('./routes/contests');
const problemRoutes = require('./routes/problems');

// Use routes
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/problems', problemRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  // Setup cron jobs after DB connection is established
  setupCronJobs();
})
.catch(err => console.error('Could not connect to MongoDB', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});