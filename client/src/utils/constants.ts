export const CAMPAIGN_OBJECTIVES = [
  { value: "OUTCOME_AWARENESS", label: "Brand Awareness" },
  { value: "OUTCOME_TRAFFIC", label: "Traffic" },
  { value: "OUTCOME_ENGAGEMENT", label: "Engagement" },
  { value: "OUTCOME_LEADS", label: "Lead Generation" },
  { value: "OUTCOME_APP_PROMOTION", label: "App Promotion" },
  { value: "OUTCOME_SALES", label: "Sales" },
];

export const CAMPAIGN_STATUSES = [
  { value: "ACTIVE", label: "Active", color: "green" },
  { value: "PAUSED", label: "Paused", color: "yellow" },
  { value: "DELETED", label: "Deleted", color: "red" },
  { value: "ARCHIVED", label: "Archived", color: "gray" },
];

export const BUDGET_TYPES = [
  { value: "DAILY", label: "Daily Budget" },
  { value: "LIFETIME", label: "Lifetime Budget" },
];

export const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 days" },
  { value: "last30days", label: "Last 30 days" },
  { value: "custom", label: "Custom range" },
];

export const METRIC_DEFINITIONS = {
  impressions: "The number of times your ads were shown",
  clicks: "The number of clicks on your ads",
  ctr: "Click-through rate - the percentage of people who clicked your ad",
  cpc: "Cost per click - average amount spent for each click",
  cpm: "Cost per thousand impressions",
  spend: "Total amount spent on your ads",
  conversions: "Number of desired actions taken",
  roas: "Return on ad spend - revenue generated per dollar spent",
};
