
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeacherRecurringData } from '@/hooks/useTeacherRecurringData';
import { RecurringClassFilterSection } from '@/components/dashboard/RecurringClassFilterSection';
import { RecurringClassMetricCards } from '@/components/dashboard/RecurringClassMetricCards';
import { RecurringClassDetailedDataTable } from '@/components/dashboard/RecurringClassDetailedDataTable';
import { RecurringClassMonthOnMonthTable } from '@/components/dashboard/RecurringClassMonthOnMonthTable';
import { RecurringClassYearOnYearTable } from '@/components/dashboard/RecurringClassYearOnYearTable';
import { RecurringClassTopBottomLists } from '@/components/dashboard/RecurringClassTopBottomLists';
import { RecurringClassFilterOptions } from '@/types/recurringClass';

const ClassAttendance = () => {
  const { data, loading, error } = useTeacherRecurringData();
  const [filteredData, setFilteredData] = useState(data);
  
  const [filters, setFilters] = useState<RecurringClassFilterOptions>({
    dateRange: {
      start: '',
      end: ''
    },
    location: [],
    trainer: [],
    classType: [],
    dayOfWeek: [],
    timeSlot: [],
    minCapacity: undefined,
    maxCapacity: undefined,
    minFillRate: undefined,
    maxFillRate: undefined,
    minRevenue: undefined,
    maxRevenue: undefined,
    showEmptyOnly: false,
    showProblematicOnly: false
  });

  // Apply filters to data
  useEffect(() => {
    let filtered = [...data];

    // Date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // Location filter
    if (filters.location.length > 0) {
      filtered = filtered.filter(item => filters.location.includes(item.location));
    }

    // Trainer filter
    if (filters.trainer.length > 0) {
      filtered = filtered.filter(item => filters.trainer.includes(item.trainer));
    }

    // Class type filter
    if (filters.classType.length > 0) {
      filtered = filtered.filter(item => filters.classType.includes(item.class));
    }

    // Day of week filter
    if (filters.dayOfWeek.length > 0) {
      filtered = filtered.filter(item => filters.dayOfWeek.includes(item.day));
    }

    // Time slot filter
    if (filters.timeSlot.length > 0) {
      const timeSlotMapping: Record<string, [number, number]> = {
        'Early Morning': [5, 8],
        'Morning': [8, 12],
        'Afternoon': [12, 17],
        'Evening': [17, 21],
        'Night': [21, 24]
      };

      filtered = filtered.filter(item => {
        const timeStr = item.time;
        const [hours] = timeStr.split(':').map(Number);
        
        return filters.timeSlot.some(slot => {
          const [start, end] = timeSlotMapping[slot] || [0, 24];
          return hours >= start && hours < end;
        });
      });
    }

    // Capacity filters
    if (filters.minCapacity !== undefined) {
      filtered = filtered.filter(item => item.capacity >= filters.minCapacity!);
    }
    if (filters.maxCapacity !== undefined) {
      filtered = filtered.filter(item => item.capacity <= filters.maxCapacity!);
    }

    // Fill rate filters
    if (filters.minFillRate !== undefined) {
      filtered = filtered.filter(item => {
        const fillRate = item.capacity > 0 ? (item.checkedIn / item.capacity) * 100 : 0;
        return fillRate >= filters.minFillRate!;
      });
    }
    if (filters.maxFillRate !== undefined) {
      filtered = filtered.filter(item => {
        const fillRate = item.capacity > 0 ? (item.checkedIn / item.capacity) * 100 : 0;
        return fillRate <= filters.maxFillRate!;
      });
    }

    // Revenue filters
    if (filters.minRevenue !== undefined) {
      filtered = filtered.filter(item => item.revenue >= filters.minRevenue!);
    }
    if (filters.maxRevenue !== undefined) {
      filtered = filtered.filter(item => item.revenue <= filters.maxRevenue!);
    }

    // Special filters
    if (filters.showEmptyOnly) {
      filtered = filtered.filter(item => item.checkedIn === 0);
    }
    if (filters.showProblematicOnly) {
      filtered = filtered.filter(item => {
        const fillRate = item.capacity > 0 ? (item.checkedIn / item.capacity) * 100 : 0;
        return fillRate < 30 || item.lateCancelled > 3;
      });
    }

    setFilteredData(filtered);
  }, [data, filters]);

  const handleFilterChange = (newFilters: RecurringClassFilterOptions) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading recurring class data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 text-lg font-semibold">Error loading data: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Recurring Class Performance
          </h1>
          <p className="text-slate-600 text-lg">
            Comprehensive analytics for class attendance, trainer performance, and revenue metrics
          </p>
        </div>

        {/* Comprehensive Filter Section */}
        <RecurringClassFilterSection
          data={data}
          onFiltersChange={handleFilterChange}
          className="mb-6"
        />

        {/* Metric Cards */}
        <RecurringClassMetricCards data={filteredData} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="tables" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="tables" className="text-sm font-medium">
              Performance Tables
            </TabsTrigger>
            <TabsTrigger value="rankings" className="text-sm font-medium">
              Rankings & Analysis
            </TabsTrigger>
            <TabsTrigger value="detailed" className="text-sm font-medium">
              Detailed View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tables" className="space-y-6">
            <div className="grid gap-6">
              <RecurringClassMonthOnMonthTable data={filteredData} />
              <RecurringClassYearOnYearTable data={filteredData} />
            </div>
          </TabsContent>

          <TabsContent value="rankings" className="space-y-6">
            <RecurringClassTopBottomLists data={filteredData} />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <RecurringClassDetailedDataTable data={filteredData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClassAttendance;
