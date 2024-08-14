const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'julius.veum@ethereal.email',
            pass: 'CjRDxm2ZAZ4HHJCBmS'
        }
    });

    const mailOptions = {
        from: 'zacharityfeedfoundation@gmail.com',
        to,
        subject,
        text
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
