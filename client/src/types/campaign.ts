export interface Campaign {
  id: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  budgetType: "DAILY" | "LIFETIME";
  budget?: number;
  startTime?: string;
  endTime?: string;
  metaCampaignId?: string;
  configuration?: any;
  MetaAccount?: {
    id: string;
    accountName: string;
    currency: string;
  };
  AdSets?: AdSet[];
  createdAt: string;
  updatedAt: string;
}

export type CampaignObjective =
  | "OUTCOME_AWARENESS"
  | "OUTCOME_TRAFFIC"
  | "OUTCOME_ENGAGEMENT"
  | "OUTCOME_LEADS"
  | "OUTCOME_APP_PROMOTION"
  | "OUTCOME_SALES";

export type CampaignStatus = "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";

export interface AdSet {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "DELETED";
  budget?: number;
  budgetType?: "DAILY" | "LIFETIME";
  targeting?: any;
  placements?: any;
  optimization?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignData {
  metaAccountId: string;
  name: string;
  objective: CampaignObjective;
  budget?: number;
  budgetType?: "DAILY" | "LIFETIME";
  startTime?: string;
  endTime?: string;
  configuration?: any;
}
