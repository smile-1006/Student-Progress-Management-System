const cron = require('node-cron');
const Student = require('../models/Student');
const { syncContestData, syncSubmissionData, checkInactivity } = require('./codeforcesApi');
const { sendInactivityEmail } = require('./emailService');

// Setup cron job for daily sync at 2 AM
const setupCronJobs = () => {
  // Daily sync at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running daily Codeforces data sync...');
    await syncAllStudents();
  });
  
  console.log('Cron jobs set up successfully');
};

// Sync data for all students based on their sync frequency
const syncAllStudents = async () => {
  try {
    const students = await Student.find({ cfHandle: { $exists: true, $ne: '' } });
    console.log(`Found ${students.length} students with Codeforces handles`);
    
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    
    for (const student of students) {
      // Check if we should sync based on frequency
      let shouldSync = false;
      
      switch (student.syncFrequency) {
        case 'daily':
          shouldSync = true;
          break;
        case 'weekly':
          // Sync on Sundays
          shouldSync = day === 0;
          break;
        case 'biweekly':
          // Sync on Sundays and Wednesdays
          shouldSync = day === 0 || day === 3;
          break;
      }
      
      if (shouldSync && student.cfHandle) {
        console.log(`Syncing data for ${student.name} (${student.cfHandle})`);
        await syncStudentData(student._id, student.cfHandle);
        
        // Check inactivity and send email if needed
        const isInactive = await checkInactivity(student._id);
        if (isInactive) {
          console.log(`Student ${student.name} is inactive. Sending email notification.`);
          await sendInactivityEmail(student);
        }
      }
    }
    
    console.log('Sync completed successfully');
  } catch (error) {
    console.error('Error in syncAllStudents:', error.message);
  }
};

// Sync data for a specific student
const syncStudentData = async (studentId, cfHandle) => {
  try {
    // Sync contest data
    await syncContestData(studentId, cfHandle);
    
    // Sync submission data
    await syncSubmissionData(studentId, cfHandle);
    
    // Update last sync time
    await Student.findByIdAndUpdate(studentId, { lastSyncTime: new Date() });
    
    return true;
  } catch (error) {
    console.error(`Error syncing data for student ${studentId}:`, error.message);
    return false;
  }
};

module.exports = {
  setupCronJobs,
  syncAllStudents,
  syncStudentData
};