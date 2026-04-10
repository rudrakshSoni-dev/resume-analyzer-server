import nodemailer from "nodemailer";

// 🚀 Initialize Nodemailer with Google SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // e.g., your.email@gmail.com
    pass: process.env.EMAIL_APP_PASSWORD, // 16-character Google App Password
  },
});

const FROM_EMAIL = process.env.EMAIL_FROM || process.env.EMAIL_USER;

// 🔐 OTP EMAIL
export async function sendVerificationOTP(email: string, otp: string) {
  try {
    console.log("SENDING OTP TO:", email);

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your Email",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      `,
    });

    console.log("NODEMAILER OTP RESPONSE:", info.messageId);

    return info;
  } catch (err) {
    console.error("EMAIL OTP ERROR:", err);
    throw err;
  }
}

// 📧 GENERIC EMAIL
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  try {
    console.log("SENDING EMAIL TO:", to);

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      text: text, // Nodemailer handles plaintext fallbacks well if you provide 'text'
      html: html || `<p>${text}</p>`,
    });

    console.log("NODEMAILER EMAIL RESPONSE:", info.messageId);

    return info;
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    throw err;
  }
}