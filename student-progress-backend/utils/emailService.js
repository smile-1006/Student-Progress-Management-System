const nodemailer = require('nodemailer');
const Student = require('../models/Student');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send inactivity notification
const sendInactivityEmail = async (student) => {
  try {
    // Skip if notifications are disabled
    if (!student.emailNotifications) return false;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: 'Coding Inactivity Reminder',
      html: `
        <h2>Hello ${student.name},</h2>
        <p>We noticed you haven't solved any problems on Codeforces in the last 7 days.</p>
        <p>Regular practice is key to improving your coding skills. Why not solve a problem today?</p>
        <p>Visit <a href="https://codeforces.com/">Codeforces</a> to find interesting problems to solve.</p>
        <p>Happy coding!</p>
        <p>Student Progress Management System</p>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // Update email count
    await Student.findByIdAndUpdate(student._id, {
      $inc: { emailsSent: 1 }
    });
    
    return true;
  } catch (error) {
    console.error(`Error sending email to ${student.email}:`, error.message);
    return false;
  }
};

module.exports = {
  sendInactivityEmail
};