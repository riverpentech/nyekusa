import { AuthCard } from "@/components/auth/AuthCard";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCard />
    </Suspense>
  );
}