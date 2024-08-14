const sgMail = require('@sendgrid/mail');
const winston = require("winston");



// Set your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
  });


const sendEmail = async (email, subject, text, html) => {
    const msg = {
        to: email,
        from: 'praduman1414@gmail.com', // Make sure this is your verified sender email
        subject: subject,
        text: text,
        html: html,
    };
    try {
        await sgMail.send(msg);
        logger.info("Email sent successfully");

    } catch (error) {
        logger.error('Error sending email:', error);
    }
};
module.exports = { sendEmail };
