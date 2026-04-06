import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";

// 🔐 OTP EMAIL
export async function sendVerificationOTP(email: string, otp: string) {
  try {
    console.log("SENDING OTP TO:", email);

    const { data, error } = await resend.emails.send({
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

    console.log("RESEND OTP RESPONSE:", { data, error });

    if (error) {
      throw new Error(error.message || "Failed to send OTP email");
    }

    return data;
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

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: html || `<p>${text}</p>`,
    });

    console.log("RESEND EMAIL RESPONSE:", { data, error });

    if (error) {
      throw new Error(error.message || "Failed to send email");
    }

    return data;
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    throw err;
  }
}