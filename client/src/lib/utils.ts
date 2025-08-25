// client/src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatNumber(num: number) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString();
}

export function formatPercentage(num: number, decimals = 2) {
  return `${num.toFixed(decimals)}%`;
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "text-green-600 bg-green-100";
    case "paused":
      return "text-yellow-600 bg-yellow-100";
    case "deleted":
    case "archived":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export function calculateCTR(clicks: number, impressions: number) {
  if (impressions === 0) return 0;
  return (clicks / impressions) * 100;
}

export function calculateCPC(spend: number, clicks: number) {
  if (clicks === 0) return 0;
  return spend / clicks;
}

export function calculateCPM(spend: number, impressions: number) {
  if (impressions === 0) return 0;
  return (spend / impressions) * 1000;
}

export function calculateROAS(revenue: number, spend: number) {
  if (spend === 0) return 0;
  return revenue / spend;
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
