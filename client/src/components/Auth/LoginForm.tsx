// ================================================================
// CLIENT COMPONENTS - AUTH
// ================================================================

// client/src/components/Auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuthContext";
import { useForm } from "react-hook-form";
import { LoginCredentials } from "@/types/auth";
import Button from "@/components/Common/Button";
import Input from "@/components/Common/Input";
import Link from "next/link";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const { login, error, clearError } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setLoading(true);
    clearError();

    try {
      await login(data);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            href="/register"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <div className="mt-1">
            <Input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="mt-1">
            <Input
              {...register("password", { required: "Password is required" })}
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
          loading={loading}
        >
          Sign in
        </Button>
      </form>
    </div>
  );
}
