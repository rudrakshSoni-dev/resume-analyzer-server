import nodemailer from "nodemailer";

// ENV VALIDATION
if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  throw new Error("Missing EMAIL_USER or EMAIL_APP_PASSWORD in env");
}

// TRANSPORTER
const transporter = nodemailer.createTransport({
  pool: true,
  maxConnections: 5,
  maxMessages: 100,

  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // STARTTLS (Gmail)

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },

  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

// VERIFY SMTP ON START
transporter.verify((err) => {
  if (err) {
    console.error("SMTP ERROR:", err);
  } else {
    console.log("SMTP READY");
  }
});

// FROM EMAIL
const FROM_EMAIL =
  process.env.EMAIL_FROM || process.env.EMAIL_USER as string;

// RETRY WRAPPER
const sendWithRetry = async (mailOptions: any, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await transporter.sendMail(mailOptions);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`Retrying email... (${i + 1})`);
    }
  }
  throw new Error("Failed to send email after retries");
};

// OTP EMAIL
export async function sendVerificationOTP(email: string, otp: string) {
  try {
    console.log("Sending OTP to:", email);

    const info = await sendWithRetry({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your Email",
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto">
          <h2>Email Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing:6px;">${otp}</h1>
          <p>This OTP expires in 10 minutes.</p>
        </div>
      `,
    });

    console.log("OTP SENT:", info.messageId);
    return info;
  } catch (err) {
    console.error("OTP EMAIL ERROR:", err);
    throw err;
  }
}

// GENERIC EMAIL
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  try {
    console.log("Sending email to:", to);

    const info = await sendWithRetry({
      from: FROM_EMAIL,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });

    console.log("EMAIL SENT:", info.messageId);
    return info;
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    throw err;
  }
}