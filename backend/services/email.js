const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter with Gmail service
    const transporter = nodemailer.createTransport({
        service: 'gmail',  // Using Gmail service instead of custom SMTP
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // Use Gmail App Password
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER, // Use EMAIL_USER as the from address
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html // Add support for HTML emails
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Email error:', error);
        throw new Error('Failed to send email');
    }
};

module.exports = sendEmail; 
