
import { Resend } from "resend";

export const sendPasswordResetOtp = async (email, otp) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "CareerPilot - Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px;">
        <h2 style="color: #7c3aed;">CareerPilot</h2>
        <h3>Password Reset Request</h3>
        <p>Use this OTP to reset your password:</p>
        <h1 style="letter-spacing: 8px; color: #7c3aed;">${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message || "Unable to send OTP email");
  }

  return data;
};
