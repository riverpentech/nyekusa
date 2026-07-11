import { memberRepository } from "@/modules/members/members.repository";
import { authRepository } from "@/modules/auth/auth.repository";
import { paymentRepository } from "@/modules/payments/payments.repository";
import bcrypt from "bcryptjs";
import { initiateStkPush } from "@/lib/mpesa";
import { sendOTPVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { ValidationError, NotFoundError } from "@/lib/shared/errors";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const serverAuthService = {
    async login(email: string, password: string): Promise<{ success?: string; error?: string; unverified?: boolean }> {
        const existingUser = await memberRepository.findByEmail(email);
        if (!existingUser || !existingUser.email || !existingUser.password) {
            throw new ValidationError("Email does not exist!");
        }

        if (!existingUser.isVerified) {
            throw new ValidationError("Account not verified! Please complete registration.");
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
                        throw new ValidationError("Invalid credentials!");
                    default:
                        throw new ValidationError("Something went wrong!");
                }
            }
            throw error;
        }
    },

    async register(data: {
        fullName: string;
        email: string;
        password: string;
        phone: string;
        course: string;
        yearOfStudy: string;
        bio?: string | null;
    }): Promise<{ success?: string; error?: string; userId?: string; checkoutRequestId?: string }> {
        const existingUser = await memberRepository.findByEmail(data.email);
        if (existingUser) throw new ValidationError("Email already in use!");

        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user in PENDING state
        const user = await memberRepository.create({
            name: data.fullName,
            email: data.email,
            password: hashedPassword,
            phone: data.phone,
            course: data.course,
            yearOfStudy: data.yearOfStudy,
            bio: data.bio,
            isVerified: false,
        });

        // Create payment record
        const payment = await paymentRepository.create({
            user: { connect: { id: user.id } },
            amount: 50.0,
            status: "PENDING",
            checkoutRequestID: `temp_${user.id}_${Date.now()}`,
            phoneNumber: data.phone,
        });

        // Initiate M-Pesa STK Push
        const mpesaResponse = await initiateStkPush(data.phone, 50);

        // Update payment with real checkoutRequestID
        await paymentRepository.update(payment.id, {
            checkoutRequestID: mpesaResponse.CheckoutRequestID
        });

        return {
            success: "Payment initiated",
            userId: user.id,
            checkoutRequestId: mpesaResponse.CheckoutRequestID
        };
    },

    async verifyPaymentAndSendOTP(userId: string): Promise<{ success?: string; error?: string }> {
        const payment = await paymentRepository.findByUserId(userId);
        if (!payment || payment.status !== "COMPLETED") {
            throw new ValidationError("Payment not confirmed yet");
        }

        const user = await memberRepository.findById(userId);
        if (!user) throw new NotFoundError("User not found");

        const otp = generateOTP();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await authRepository.createVerificationToken({
            email: user.email,
            token: otp,
            expires
        });

        await sendOTPVerificationEmail(user.email, otp);

        return { success: "OTP sent" };
    },

    async verifyOTP(email: string, otp: string): Promise<{ success?: string; error?: string }> {
        const token = await authRepository.findVerificationTokenByEmailAndToken(email, otp);
        if (!token || token.expires < new Date()) {
            throw new ValidationError("Invalid or expired OTP");
        }

        const user = await memberRepository.findByEmail(email);
        if (!user) throw new NotFoundError("User not found");

        await memberRepository.update(user.id, { isVerified: true });
        await authRepository.deleteVerificationToken(token.id);

        return { success: "Account verified!" };
    },

    async requestPasswordReset(email: string): Promise<{ success?: string; error?: string }> {
        const user = await memberRepository.findByEmail(email);
        if (!user) throw new NotFoundError("Email not found");

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await authRepository.createVerificationToken({
            email,
            token,
            expires
        });

        await sendPasswordResetEmail(email, token);

        return { success: "Reset email sent!" };
    },

    async resetPassword(token: string, password: string): Promise<{ success?: string; error?: string }> {
        const verificationToken = await authRepository.findVerificationTokenByToken(token);
        if (!verificationToken || verificationToken.expires < new Date()) {
            throw new ValidationError("Invalid or expired token");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await memberRepository.findByEmail(verificationToken.email);
        if (!user) throw new NotFoundError("User not found");

        await memberRepository.update(user.id, { password: hashedPassword });
        await authRepository.deleteVerificationToken(verificationToken.id);

        return { success: "Password reset successfully!" };
    },

    async getUserDashboardData(userId: string) {
        const user = await memberRepository.findById(userId);
        if (!user) throw new NotFoundError("User not found");

        const payment = await paymentRepository.findByUserId(userId);

        return {
            name: user.name,
            email: user.email,
            course: user.course,
            yearOfStudy: user.yearOfStudy,
            role: user.role,
            isVerified: user.isVerified,
            payment: payment ? {
                amount: payment.amount,
                status: payment.status,
                mpesaReceiptCode: payment.mpesaReceiptCode,
            } : null,
        };
    }
};
export const authService = serverAuthService;
