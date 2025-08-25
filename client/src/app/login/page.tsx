"use client";

import LoginForm from "@/components/Auth/LoginForm";
import AuthLayout from "@/components/Layout/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
