// client/src/components/Auth/AuthCallback.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuthContext";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    handleCallback();
  }, [searchParams]);

  const handleCallback = async () => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setMessage(getErrorMessage(error));
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
      return;
    }

    if (connected === "true") {
      setStatus("success");
      setMessage("Meta account connected successfully!");

      // Refresh user data to get updated Meta accounts
      try {
        await refreshUser();
      } catch (err) {
        console.error("Failed to refresh user data:", err);
      }

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      return;
    }

    // If no specific status, redirect to dashboard
    router.push("/dashboard");
  };

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "connection_failed":
        return "Failed to connect Meta account. Please try again.";
      case "access_denied":
        return "Access denied. You need to grant permissions to connect your Meta account.";
      case "invalid_request":
        return "Invalid request. Please try connecting again.";
      default:
        return "An error occurred while connecting your Meta account.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        {status === "loading" && (
          <>
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Connection
            </h2>
            <p className="text-gray-600">
              Please wait while we connect your Meta account...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connection Successful!
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </>
        )}
      </div>
    </div>
  );
}
