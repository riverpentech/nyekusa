"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import prisma from "@/lib/prisma";
import { LoginSchema, RegisterSchema, OTPSchema, ResetPasswordRequestSchema, ResetPasswordSchema } from "@/lib/schemas";
import bcrypt from "bcryptjs";
import { initiateStkPush } from "@/lib/mpesa";
import { sendOTPVerificationEmail, sendPasswordResetEmail } from "@/lib/email";

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const login = async (values: any) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist!" };
  }

  if (!existingUser.isVerified) {
    return { error: "Account not verified! Please complete registration.", unverified: true };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
    return { success: "Logged in!" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error;
  }
};

export const register = async (values: any) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { fullName, email, password, phone, course, yearOfStudy, bio } = validatedFields.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return { error: "Email already in use!" };

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Create user in PENDING state
    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        phone,
        course,
        yearOfStudy,
        bio,
        isVerified: false,
      },
    });

    // Create payment record
    const payment = await prisma.payment.create({
        data: {
            userId: user.id,
            amount: 50.0,
            status: "PENDING",
            checkoutRequestID: `temp_${user.id}_${Date.now()}`, // Will be updated by M-Pesa
            phoneNumber: phone
        }
    })

    // Initiate M-Pesa STK Push
    const mpesaResponse = await initiateStkPush(phone, 50);

    // Update payment with real checkoutRequestID
    await prisma.payment.update({
        where: { id: payment.id },
        data: { checkoutRequestID: mpesaResponse.CheckoutRequestID }
    })

    return { success: "Payment initiated", userId: user.id, checkoutRequestId: mpesaResponse.CheckoutRequestID };
  } catch (error: any) {
    console.error("Registration Error", error);
    return { error: error.message || "Failed to register" };
  }
};

export const verifyPaymentAndSendOTP = async (userId: string) => {
    const payment = await prisma.payment.findUnique({
        where: { userId }
    })

    if (!payment || payment.status !== "COMPLETED") {
        return { error: "Payment not confirmed yet" };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "User not found" };

    const otp = generateOTP();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.verificationToken.create({
        data: {
            email: user.email,
            token: otp,
            expires
        }
    })

    await sendOTPVerificationEmail(user.email, otp);

    return { success: "OTP sent" };
}

export const verifyOTP = async (email: string, otp: string) => {
    const validatedFields = OTPSchema.safeParse({ otp });
    if (!validatedFields.success) return { error: "Invalid OTP" };

    const token = await prisma.verificationToken.findFirst({
        where: { email, token: otp }
    })

    if (!token || token.expires < new Date()) {
        return { error: "Invalid or expired OTP" };
    }

    await prisma.user.update({
        where: { email },
        data: { isVerified: true }
    })

    await prisma.verificationToken.delete({ where: { id: token.id } });

    return { success: "Account verified!" };
}

export const requestPasswordReset = async (values: any) => {
    const validatedFields = ResetPasswordRequestSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid email" };

    const { email } = validatedFields.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "Email not found" };

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
        data: {
            email,
            token,
            expires
        }
    })

    await sendPasswordResetEmail(email, token);

    return { success: "Reset email sent!" };
}

export const resetPassword = async (token: string, values: any) => {
    const validatedFields = ResetPasswordSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid password" };

    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token }
    })

    if (!verificationToken || verificationToken.expires < new Date()) {
        return { error: "Invalid or expired token" };
    }

    const { password } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { email: verificationToken.email },
        data: { password: hashedPassword }
    })

    await prisma.verificationToken.delete({ where: { id: verificationToken.id } });

    return { success: "Password reset successfully!" };
}
