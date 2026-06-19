import { AuthCard } from "@/components/auth/AuthCard";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCard />
    </Suspense>
  );
}