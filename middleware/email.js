const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: 'Plan Your Plants <' + process.env.EMAIL_USER + '>',
    to: options.emailTo,
    subject: options.subject,
    html: options.html 
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;