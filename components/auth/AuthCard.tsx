"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoginSchema, RegisterSchema, OTPSchema, ResetPasswordRequestSchema, ResetPasswordSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { login, register, verifyOTP, requestPasswordReset, resetPassword, verifyPaymentAndSendOTP } from "@/actions/auth";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import { toast } from "sonner";

type AuthMode = "LOGIN" | "REGISTER" | "PAYMENT" | "OTP" | "FORGOT" | "RESET";

export const AuthCard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isRegisterPage = pathname.includes("/join");
  const [mode, setMode] = useState<AuthMode>(isRegisterPage ? "REGISTER" : "LOGIN");
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | undefined>("");
  const [userId, setUserId] = useState<string | undefined>("");
  const [email, setEmail] = useState<string | undefined>("");

  useEffect(() => {
    if (pathname.includes("/join")) {
        setMode("REGISTER");
    } else if (pathname.includes("/signin")) {
        setMode("LOGIN");
    }
  }, [pathname]);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setMode("RESET");
    }
  }, [searchParams]);

  const onLogin = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      login(values).then((data) => {
        if (data?.error) {
            setError(data.error);
            toast.error(data.error);
        }
        if (data?.success) {
            setSuccess(data.success);
            toast.success(data.success, {
              description: "Redirecting to your dashboard...",
            });
            router.push("/dashboard");
        }
      });
    });
  };

  const onRegister = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      register(values).then((data) => {
        if (data?.error) {
            setError(data.error);
            toast.error(data.error);
        }
        if (data?.success) {
          setCheckoutRequestId(data.checkoutRequestId);
          setUserId(data.userId);
          setEmail(values.email);
          setSuccess(data.success);
          toast.success(data.success, {
            description: "Please complete the M-Pesa payment to continue.",
          });
          setMode("PAYMENT");
        }
      });
    });
  };

  const onOTP = (values: z.infer<typeof OTPSchema>) => {
    setError("");
    setSuccess("");
    if (!email) return;
    startTransition(() => {
      verifyOTP(email, values.otp).then((data) => {
        if (data?.error) {
            setError(data.error);
            toast.error(data.error);
        }
        if (data?.success) {
          setSuccess(data.success);
          toast.success(data.success, {
            description: "Your account is now verified! Redirecting to login...",
          });
          setTimeout(() => setMode("LOGIN"), 2000);
        }
      });
    });
  };

  const onForgot = (values: z.infer<typeof ResetPasswordRequestSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      requestPasswordReset(values).then((data) => {
        if (data?.error) {
            setError(data.error);
            toast.error(data.error);
        }
        if (data?.success) {
            setSuccess(data.success);
            toast.success(data.success);
        }
      });
    });
  };

  const onReset = (values: z.infer<typeof ResetPasswordSchema>) => {
    const token = searchParams.get("token");
    if (!token) {
        setError("Missing token!");
        toast.error("Missing token!");
        return;
    }
    setError("");
    setSuccess("");
    startTransition(() => {
      resetPassword(token, values).then((data) => {
        if (data?.error) {
            setError(data.error);
            toast.error(data.error);
        }
        if (data?.success) {
          setSuccess(data.success);
          toast.success(data.success, {
            description: "Your password has been reset! Redirecting to login...",
          });
          setTimeout(() => setMode("LOGIN"), 2000);
        }
      });
    });
  };

  // Polling for payment status
  useEffect(() => {
    if (mode === "PAYMENT" && checkoutRequestId) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/v1/payments/status?checkoutRequestId=${checkoutRequestId}`);
          const data = await res.json();
          if (data.status === "COMPLETED") {
            clearInterval(interval);
            setSuccess("Payment confirmed!");
            toast.success("Payment confirmed!");
            // Automatically trigger OTP sending
            if (userId) {
                const otpRes = await verifyPaymentAndSendOTP(userId);
                if (otpRes.success) {
                    toast.success("OTP sent to your email");
                    setMode("OTP");
                } else {
                    setError(otpRes.error);
                    toast.error(otpRes.error);
                }
            }
          } else if (data.status === "FAILED") {
            clearInterval(interval);
            setError("Payment failed. Please try again.");
            toast.error("Payment failed. Please try again.");
            setMode("REGISTER");
          }
        } catch (err) {
          console.error(err);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [mode, checkoutRequestId, userId]);

  return (
    <div className="bg-card p-8 rounded-3xl shadow-2xl border border-border/50">
      <AnimatePresence mode="wait">
        {mode === "LOGIN" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h2 className="text-3xl font-bold text-primary mb-2">Welcome Back</h2>
            <p className="text-muted-foreground mb-6">Log in to your account</p>
            <LoginForm onSubmit={onLogin} isPending={isPending} />
            <div className="mt-6 flex flex-col gap-2 text-sm text-center">
              <button onClick={() => setMode("FORGOT")} className="text-primary hover:underline">Forgot password?</button>
              <p>Don&apos;t have an account? <Link href="/join" className="text-primary font-bold hover:underline">Register</Link></p>
            </div>
          </motion.div>
        )}

        {mode === "REGISTER" && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h2 className="text-3xl font-bold text-primary mb-2">Create Account</h2>
            <p className="text-muted-foreground mb-6">Join the Nyekusa community</p>
            <RegisterForm onSubmit={onRegister} isPending={isPending} />
            <p className="mt-6 text-sm text-center">Already have an account? <Link href="/signin" className="text-primary font-bold hover:underline">Log in</Link></p>
          </motion.div>
        )}

        {mode === "PAYMENT" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="text-center"
          >
            <div className="mb-6 flex justify-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Awaiting Payment</h2>
            <p className="text-muted-foreground mb-4">Please check your phone and enter your M-Pesa PIN for the <strong>KES 50</strong> registration fee.</p>
            <p className="text-xs text-muted-foreground">Checkout Request ID: {checkoutRequestId}</p>
          </motion.div>
        )}

        {mode === "OTP" && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-2xl font-bold text-primary mb-2">Verify Email</h2>
            <p className="text-muted-foreground mb-6">Enter the 6-digit OTP sent to <strong>{email}</strong></p>
            <OTPForm onSubmit={onOTP} isPending={isPending} />
          </motion.div>
        )}

        {mode === "FORGOT" && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h2 className="text-2xl font-bold text-primary mb-2">Reset Password</h2>
            <p className="text-muted-foreground mb-6">Enter your email to receive a reset link</p>
            <ForgotForm onSubmit={onForgot} isPending={isPending} />
            <button onClick={() => setMode("LOGIN")} className="mt-6 text-sm text-primary hover:underline w-full text-center">Back to Login</button>
          </motion.div>
        )}

        {mode === "RESET" && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-2xl font-bold text-primary mb-2">New Password</h2>
              <p className="text-muted-foreground mb-6">Create a secure new password</p>
              <ResetForm onSubmit={onReset} isPending={isPending} />
            </motion.div>
          )}
      </AnimatePresence>

      {(error || success) && (
        <div className="mt-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 text-emerald-600 text-sm rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LoginForm = ({ onSubmit, isPending }: { onSubmit: (v: any) => void; isPending: boolean }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input {...register("email")} placeholder="Institutional Email" disabled={isPending} />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <Input {...register("password")} type="password" placeholder="Password" disabled={isPending} />
        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full rounded-xl h-12" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : "Sign In"}
      </Button>
    </form>
  );
};

const RegisterForm = ({ onSubmit, isPending }: { onSubmit: (v: any) => void; isPending: boolean }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input {...register("fullName")} placeholder="Full Name" disabled={isPending} />
          {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
        </div>
        <div>
          <Input {...register("phone")} placeholder="Phone (e.g. 07...)" disabled={isPending} />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
        </div>
      </div>
      <div>
        <Input {...register("email")} placeholder="Institutional Email" disabled={isPending} />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input {...register("course")} placeholder="Course" disabled={isPending} />
          {errors.course && <p className="text-xs text-destructive mt-1">{errors.course.message}</p>}
        </div>
        <div>
          <Input {...register("yearOfStudy")} placeholder="Year of Study (e.g. 4.1)" disabled={isPending} />
          {errors.yearOfStudy && <p className="text-xs text-destructive mt-1">{errors.yearOfStudy.message}</p>}
        </div>
      </div>
      <textarea 
        {...register("bio")} 
        placeholder="Bio (optional)" 
        disabled={isPending}
        className="w-full min-h-[80px] rounded-lg border border-b-input bg-transparent p-2 text-sm outline-none focus:border-b-ring"
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input {...register("password")} type="password" placeholder="Password" disabled={isPending} />
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <Input {...register("confirmPassword")} type="password" placeholder="Confirm Password" disabled={isPending} />
          {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
        </div>
      </div>
      <Button type="submit" className="w-full rounded-xl h-12" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : "Pay & Register (KES 50)"}
      </Button>
    </form>
  );
};

const OTPForm = ({ onSubmit, isPending }: { onSubmit: (v: any) => void; isPending: boolean }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof OTPSchema>>({
    resolver: zodResolver(OTPSchema),
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-center">
      <Input {...register("otp")} placeholder="000000" className="text-center text-2xl tracking-[1rem]" maxLength={6} disabled={isPending} />
      {errors.otp && <p className="text-xs text-destructive">{errors.otp.message}</p>}
      <Button type="submit" className="w-full rounded-xl h-12" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : "Verify OTP"}
      </Button>
    </form>
  );
};

const ForgotForm = ({ onSubmit, isPending }: { onSubmit: (v: any) => void; isPending: boolean }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof ResetPasswordRequestSchema>>({
    resolver: zodResolver(ResetPasswordRequestSchema),
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input {...register("email")} placeholder="Institutional Email" disabled={isPending} />
      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      <Button type="submit" className="w-full rounded-xl h-12" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
      </Button>
    </form>
  );
};

const ResetForm = ({ onSubmit, isPending }: { onSubmit: (v: any) => void; isPending: boolean }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof ResetPasswordSchema>>({
      resolver: zodResolver(ResetPasswordSchema),
    });
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input {...register("password")} type="password" placeholder="New Password" disabled={isPending} />
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <Input {...register("confirmPassword")} type="password" placeholder="Confirm New Password" disabled={isPending} />
          {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" className="w-full rounded-xl h-12" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : "Reset Password"}
        </Button>
      </form>
    );
  };
