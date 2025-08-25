export interface Metrics {
  id: string;
  campaignId: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  Campaign?: {
    name: string;
    objective: string;
    MetaAccount?: {
      accountName: string;
      currency: string;
    };
  };
}

export interface MetricsSummary {
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  totalConversions: number;
  averageCTR: number;
  averageCPC: number;
  averageCPM: number;
  averageROAS: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface AnalyticsFilters {
  campaignId?: string;
  campaignIds?: string[];
  dateRange?: DateRange;
  limit?: number;
}
