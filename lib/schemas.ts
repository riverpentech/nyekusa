import { z } from "zod";

export const emailRegex = /^[a-zA-Z0-9._%+-]+@(students\.)?dkut\.ac\.ke$/;

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").regex(emailRegex, "Email must be a @dkut.ac.ke or @students.dkut.ac.ke address"),
  password: z.string().min(1, "Password is required"),
});

export const RegisterSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address").regex(emailRegex, "Email must be a @dkut.ac.ke or @students.dkut.ac.ke address"),
  phone: z.string().regex(/^(?:\+254|0)[17]\d{8}$/, "Invalid Kenyan phone number (e.g., 07... or +254...)"),
  course: z.string().min(2, "Course is required"),
  yearOfStudy: z.string().min(1, "Year of study is required"),
  bio: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const OTPSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const ResetPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address").regex(emailRegex, "Email must be a @dkut.ac.ke or @students.dkut.ac.ke address"),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
