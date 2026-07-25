import { Job, Worker } from "bullmq";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import redis from "../config/redis";

const smtpPort = Number(process.env.SMTP_PORT);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
    },
});

interface EmailData {
    name: string;
    verificationUrl?: string;
    resetUrl?: string;
}

interface EmailJobData {
    to: string;
    template: keyof typeof templates;
    data: EmailData;
}

const templates = {
    welcome: (data: EmailData) => ({
        subject: "Welcome to our marketplace!",
        html: `<h1>Hi ${data.name}!</h1><p>Thanks for signing up. Start exploring products now.</p>`,
    }),

    "email-verification": (data: EmailData) => ({
        subject: "Verify your email address",
        html: `
      <h1>Hi ${data.name}</h1>
      <p>Thanks for signing up. Click below to verify your email address:</p>
      <a href="${data.verificationUrl}">Verify Email</a>
      <p>If you didn't create an account, ignore this email.</p>
    `,
    }),

    "forget-password": (data: EmailData) => ({
        subject: "Reset your password",
        html: `
      <h1>Hi ${data.name}</h1>
      <p>You requested a password reset. Click below (expires in 1 hour):</p>
      <a href="${data.resetUrl}">Reset Password</a>
      <p>If you didn't request this, ignore this email.</p>
    `,
    }),
};

const worker = new Worker(
    "email",
    async (job: Job<EmailJobData>) => {
        const { to, template, data } = job.data;

        const { subject, html } = templates[template](data);

        await transporter.sendMail({
            from: process.env.FROM_EMAIL || process.env.SMTP_USER,
            to,
            subject,
            html,
        });

        console.log(`Email sent: ${template} → ${to}`);
    },
    {
        connection: {
            host: redis.options.host,
            port: redis.options.port,
            password: redis.options.password,
        },
        concurrency: 10,
    }
);

worker.on("failed", (job, err) => {
    console.error(`Email job ${job?.id} failed:`, err.message);
});

export default worker;
