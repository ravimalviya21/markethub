const { Worker } = require('bullmq');
const nodemailer = require('nodemailer');
const redis = require("../config/redis");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const templates = {
    welcome: (data) => ({
        subject: 'Welcome to our marketplace!',
        html: `<h1>Hi ${data.name}!</h1><p>Thanks for signing up. Start exploring products now.</p>`,
    }),

    'password-reset': (data) => ({
        subject: 'Reset your password',
        html: `
      <h1>Hi ${data.name}</h1>
      <p>You requested a password reset. Click below (expires in 1 hour):</p>
      <a href="${data.resetUrl}">Reset Password</a>
      <p>If you didn't request this, ignore this email.</p>
    `,
    }),
};

const worker = new Worker('email', async (job) => {
    const { to, template, data } = job.data;

    const { subject, html } = templates[template](data);

    await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to,
        subject,
        html,
    });

    console.log(`Email sent: ${template} → ${to}`);
}, {
    connection: { host: redis.options.host, port: redis.options.port },
    concurrency: 10,
});

worker.on('failed', (job, err) => {
    console.error(`Email job ${job.id} failed:`, err.message);
});

module.exports = worker;