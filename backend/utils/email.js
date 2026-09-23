const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const sendVerificationEmail = async (to, code) => {
    await transporter.sendMail({
        from: `"ClassPulse" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your ClassPulse verification code',
        html: `
      <p>Your verification code is:</p>
      <h2 style="letter-spacing: 4px;">${code}</h2>
      <p>This code expires in 1 hour.</p>
    `
    });
};

const sendResetEmail = async (to, code) => {
    await transporter.sendMail({
        from: `"ClassPulse" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your ClassPulse password reset code',
        html: `
      <p>Your password reset code is:</p>
      <h2 style="letter-spacing: 4px;">${code}</h2>
      <p>This code expires in 1 hour.</p>
    `
    });
};

module.exports = { sendVerificationEmail, sendResetEmail };