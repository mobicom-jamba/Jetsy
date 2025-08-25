// client/src/components/Common/Table.tsx
"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyText?: string;
  className?: string;
  onRowClick?: (record: T) => void;
}

export default function Table<T extends { id: string }>({
  data,
  columns,
  loading,
  emptyText = "No data available",
  className,
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">{emptyText}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg",
        className
      )}
    >
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key as string}
                scope="col"
                className={cn(
                  "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                  column.className
                )}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((record) => (
            <tr
              key={record.id}
              onClick={() => onRowClick?.(record)}
              className={cn(
                "hover:bg-gray-50 transition-colors",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((column) => {
                const value = record[column.key as keyof T];
                return (
                  <td
                    key={column.key as string}
                    className={cn(
                      "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                      column.className
                    )}
                  >
                    {column.render
                      ? column.render(value, record)
                      : String(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
