// client/src/components/Campaigns/BulkActions.tsx
"use client";

import { useState } from "react";
import { Campaign } from "@/types/campaign";
import { useUpdateCampaignStatus } from "@/hooks/useCampaigns";
import Button from "@/components/Common/Button";
import Select from "@/components/Common/Select";
import Modal from "@/components/Common/Modal";
import {
  PlayIcon,
  PauseIcon,
  TrashIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

interface BulkActionsProps {
  selectedCampaigns: Campaign[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

const BULK_ACTIONS = [
  {
    value: "ACTIVE",
    label: "Activate",
    icon: PlayIcon,
    color: "text-green-600",
  },
  {
    value: "PAUSED",
    label: "Pause",
    icon: PauseIcon,
    color: "text-yellow-600",
  },
  {
    value: "ARCHIVED",
    label: "Archive",
    icon: ArchiveBoxIcon,
    color: "text-gray-600",
  },
  { value: "DELETED", label: "Delete", icon: TrashIcon, color: "text-red-600" },
];

export default function BulkActions({
  selectedCampaigns,
  onClearSelection,
  onActionComplete,
}: BulkActionsProps) {
  const [selectedAction, setSelectedAction] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const updateCampaignStatus = useUpdateCampaignStatus();

  if (selectedCampaigns.length === 0) {
    return null;
  }

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    if (action === "DELETED") {
      setShowConfirmModal(true);
    } else {
      executeBulkAction(action);
    }
  };

  const executeBulkAction = async (action: string) => {
    setIsProcessing(true);

    try {
      const promises = selectedCampaigns.map((campaign) =>
        updateCampaignStatus.mutateAsync({ id: campaign.id, status: action })
      );

      await Promise.all(promises);

      onActionComplete();
      onClearSelection();

      // Show success message
      const actionLabel = BULK_ACTIONS.find(
        (a) => a.value === action
      )?.label.toLowerCase();
      alert(
        `Successfully ${actionLabel}d ${selectedCampaigns.length} campaign(s)`
      );
    } catch (error) {
      console.error("Bulk action failed:", error);
      alert("Some actions failed. Please try again.");
    } finally {
      setIsProcessing(false);
      setShowConfirmModal(false);
      setSelectedAction("");
    }
  };

  const selectedActionData = BULK_ACTIONS.find(
    (action) => action.value === selectedAction
  );

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{selectedCampaigns.length}</span>{" "}
              campaign(s) selected
            </div>

            <div className="flex items-center space-x-2">
              {BULK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.value}
                    size="sm"
                    variant="outline"
                    onClick={() => handleActionSelect(action.value)}
                    disabled={isProcessing}
                    className={`${action.color} border-current hover:bg-current hover:bg-opacity-10`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={onClearSelection}
            disabled={isProcessing}
          >
            Clear Selection
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Bulk Delete"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <TrashIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Delete {selectedCampaigns.length} Campaign(s)
              </h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-md p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Campaigns to be deleted:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {selectedCampaigns.slice(0, 5).map((campaign) => (
                <li key={campaign.id} className="truncate">
                  • {campaign.name}
                </li>
              ))}
              {selectedCampaigns.length > 5 && (
                <li className="text-gray-500">
                  ... and {selectedCampaigns.length - 5} more
                </li>
              )}
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => executeBulkAction("DELETED")}
              loading={isProcessing}
            >
              Delete Campaigns
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
