const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
   
    const transporter = nodemailer.createTransport({
        service: 'gmail',  
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS 
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER, 
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html 
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
