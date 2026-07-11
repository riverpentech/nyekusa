"use server";

import { LoginSchema, RegisterSchema, OTPSchema, ResetPasswordRequestSchema, ResetPasswordSchema } from "@/lib/schemas";
import { serverAuthService } from "@/modules/auth/auth.service";
import type * as z from "zod";

export const login = async (
  values: z.infer<typeof LoginSchema>
): Promise<{ success?: string; error?: string; unverified?: boolean }> => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  try {
    return await serverAuthService.login(email, password);
  } catch (error: any) {
    // Re-throw redirect errors so Next.js handles the client redirection correctly
    if (error.message === "NEXT_REDIRECT" || error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: error.message || "Failed to log in" };
  }
};

export const register = async (
  values: z.infer<typeof RegisterSchema>
): Promise<{ success?: string; error?: string; userId?: string; checkoutRequestId?: string }> => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { fullName, email, password, phone, course, yearOfStudy, bio } = validatedFields.data;

  try {
    return await serverAuthService.register({
      fullName,
      email,
      password,
      phone,
      course,
      yearOfStudy,
      bio,
    });
  } catch (error: any) {
    console.error("Registration Error", error);
    return { error: error.message || "Failed to register" };
  }
};

export const verifyPaymentAndSendOTP = async (
  userId: string
): Promise<{ success?: string; error?: string }> => {
  try {
    return await serverAuthService.verifyPaymentAndSendOTP(userId);
  } catch (error: any) {
    return { error: error.message || "Failed to send OTP" };
  }
};

export const verifyOTP = async (
  email: string,
  otp: string
): Promise<{ success?: string; error?: string }> => {
  const validatedFields = OTPSchema.safeParse({ otp });
  if (!validatedFields.success) return { error: "Invalid OTP" };

  try {
    return await serverAuthService.verifyOTP(email, otp);
  } catch (error: any) {
    return { error: error.message || "Failed to verify OTP" };
  }
};

export const requestPasswordReset = async (
  values: z.infer<typeof ResetPasswordRequestSchema>
): Promise<{ success?: string; error?: string }> => {
  const validatedFields = ResetPasswordRequestSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Invalid email" };

  const { email } = validatedFields.data;

  try {
    return await serverAuthService.requestPasswordReset(email);
  } catch (error: any) {
    return { error: error.message || "Failed to request password reset" };
  }
};

export const resetPassword = async (
  token: string,
  values: z.infer<typeof ResetPasswordSchema>
): Promise<{ success?: string; error?: string }> => {
  const validatedFields = ResetPasswordSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Invalid password" };

  if (!token) {
    return { error: "Missing token!" };
  }

  const { password } = validatedFields.data;

  try {
    return await serverAuthService.resetPassword(token, password);
  } catch (error: any) {
    return { error: error.message || "Failed to reset password" };
  }
};
