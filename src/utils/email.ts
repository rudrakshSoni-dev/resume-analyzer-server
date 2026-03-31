// src/utils/email.ts

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // simpler than host/port
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  try {
    const info = await transporter.sendMail({
      from: `"ATS Analyzer" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });

    console.log("EMAIL SENT:", info.messageId);

    return info;
  } catch (error: any) {
    console.error("EMAIL ERROR:", error);
    throw new Error("Failed to send email");
  }
}