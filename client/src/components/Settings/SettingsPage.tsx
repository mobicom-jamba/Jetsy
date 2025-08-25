// client/src/components/Settings/SettingsPage.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuthContext";
import { useMetaAccounts, useConnectMetaAccount } from "@/hooks/useAccounts";
import Button from "@/components/Common/Button";
import Input from "@/components/Common/Input";
import ConnectMeta from "@/components/Auth/ConnectMeta";
import {
  UserIcon,
  LinkIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: metaAccounts, isLoading } = useMetaAccounts();
  const connectMeta = useConnectMetaAccount();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", name: "Profile", icon: UserIcon },
    { id: "accounts", name: "Connected Accounts", icon: LinkIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === "profile" && <ProfileSettings user={user} />}

        {activeTab === "accounts" && (
          <ConnectedAccounts
            accounts={metaAccounts || []}
            loading={isLoading}
            onConnect={() => connectMeta.mutate()}
            connecting={connectMeta.isPending}
          />
        )}
      </div>
    </div>
  );
}

function ProfileSettings({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleSave = async () => {
    try {
      // TODO: Implement profile update API call
      console.log("Saving profile:", formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Profile Information
        </h3>
        <Button
          variant={isEditing ? "primary" : "outline"}
          size="sm"
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <UserIcon className="h-10 w-10 text-primary-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Profile Photo</h4>
            <p className="text-sm text-gray-500">
              Upload a profile picture to personalize your account
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              Upload Photo
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!isEditing}
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={!isEditing}
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Account Details
          </h4>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-gray-500">Account Created</dt>
              <dd className="text-gray-900">{formatDate(user?.createdAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Last Login</dt>
              <dd className="text-gray-900">
                {user?.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function ConnectedAccounts({
  accounts,
  loading,
  onConnect,
  connecting,
}: {
  accounts: any[];
  loading: boolean;
  onConnect: () => void;
  connecting: boolean;
}) {
  const handleDisconnect = async (accountId: string) => {
    if (confirm("Are you sure you want to disconnect this account?")) {
      try {
        // TODO: Implement disconnect API call
        console.log("Disconnecting account:", accountId);
      } catch (error) {
        console.error("Failed to disconnect account:", error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Connected Accounts
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage your connected advertising accounts
          </p>
        </div>

        <Button
          onClick={onConnect}
          loading={connecting}
          className="flex items-center"
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Connect Meta Account
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 rounded-lg p-4 h-20"
            ></div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <ConnectMeta />
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">M</span>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">
                    {account.accountName}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>ID: {account.accountId}</span>
                    <span>Currency: {account.currency}</span>
                    <div className="flex items-center space-x-1">
                      {account.accountStatus === "ACTIVE" ? (
                        <>
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-4 w-4 text-red-500" />
                          <span className="text-red-600">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Connected on {formatDate(account.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  Sync
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(account.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Why connect your Meta account?
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Create and manage Facebook & Instagram ad campaigns</li>
          <li>• Access real-time performance metrics and analytics</li>
          <li>• Automate campaign optimization and reporting</li>
          <li>• Sync data across all your advertising accounts</li>
        </ul>
      </div>
    </div>
  );
}
