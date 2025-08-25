// client/src/components/Layout/AuthLayout.tsx
"use client";

import { ReactNode } from "react";
import Link from "next/link";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary-600">Jetsy</h1>
            <p className="text-gray-500 mt-1">Meta Ads Manager</p>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
