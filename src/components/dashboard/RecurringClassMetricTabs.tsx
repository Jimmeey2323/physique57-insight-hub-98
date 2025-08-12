
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type RecurringClassMetricType = 
  | 'attendance' 
  | 'revenue' 
  | 'fillRate' 
  | 'classAverage' 
  | 'emptySessions' 
  | 'lateCancellations'
  | 'capacity'
  | 'sessions';

interface RecurringClassMetricTabsProps {
  value: RecurringClassMetricType;
  onValueChange: (value: RecurringClassMetricType) => void;
  className?: string;
}

export const RecurringClassMetricTabs: React.FC<RecurringClassMetricTabsProps> = ({
  value,
  onValueChange,
  className = ""
}) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-white border border-gray-200 p-1 rounded-xl shadow-sm h-auto gap-1">
        <TabsTrigger
          value="attendance"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          Attendance
        </TabsTrigger>
        <TabsTrigger
          value="revenue"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          Revenue
        </TabsTrigger>
        <TabsTrigger
          value="fillRate"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          Fill Rate
        </TabsTrigger>
        <TabsTrigger
          value="classAverage"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          Class Avg
        </TabsTrigger>
        <TabsTrigger
          value="emptySessions"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          Empty Sessions
        </TabsTrigger>
        <TabsTrigger
          value="lateCancellations"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          Cancellations
        </TabsTrigger>
        <TabsTrigger
          value="capacity"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          Capacity
        </TabsTrigger>
        <TabsTrigger
          value="sessions"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          Sessions
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
