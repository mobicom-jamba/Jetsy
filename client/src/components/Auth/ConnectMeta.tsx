// client/src/components/Auth/ConnectMeta.tsx
"use client";

import { useConnectMetaAccount } from "@/hooks/useAccounts";
import Button from "@/components/Common/Button";
import { LinkIcon } from "@heroicons/react/24/outline";

interface ConnectMetaProps {
  className?: string;
}

export default function ConnectMeta({ className }: ConnectMetaProps) {
  const connectMeta = useConnectMetaAccount();

  const handleConnect = () => {
    connectMeta.mutate();
  };

  return (
    <div className={`text-center ${className}`}>
      <div className="bg-primary-50 rounded-lg p-6">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LinkIcon className="h-6 w-6 text-primary-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Connect Your Meta Account
        </h3>
        <p className="text-gray-600 mb-4">
          Connect your Meta (Facebook) advertising account to start creating and
          managing campaigns.
        </p>
        <Button
          onClick={handleConnect}
          loading={connectMeta.isPending}
          className="inline-flex items-center"
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Connect Meta Account
        </Button>
      </div>
    </div>
  );
}
