// const nodemailer = require('nodemailer');

// const sendEmail = async (to, subject, text) => {
//     const transporter = nodemailer.createTransport({
//       host: "smtp.ethereal.email",
//       port: 587,
//       auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASS,
//       },
//     });

//     const mailOptions = {
//         from: 'zacharityfeedfoundation@gmail.com',
//         to,
//         subject,
//         text
//     };

//     await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;


const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

const sendEmail = async (subject, recipientEmail, body) => {
  try {
    const mailOptions = {
      from: process.env.DEFAULT_MAIL,
      to: recipientEmail,
      subject: subject,
      html: body,
    };
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

module.exports = { sendEmail };
