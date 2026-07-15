import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPVerificationEmail = async (email: string, otp: string) => {
  await resend.emails.send({
    from: "Nyekusa <contact@mail.riverpen.com>",
    to: email,
    subject: "Your Verification Code",
    html: `<p>Your verification code is: <strong>${otp}</strong>. It expires in 15 minutes.</p>`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/reset-password?token=${token}`;
  await resend.emails.send({
    from: "Nyekusa <contact@mail.riverpen.com>",
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. If you didn't request this, please ignore this email.</p>`,
  });
};
