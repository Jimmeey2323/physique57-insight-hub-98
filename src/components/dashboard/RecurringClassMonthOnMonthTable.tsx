
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { TeacherRecurringData } from '@/hooks/useTeacherRecurringData';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { RecurringClassMetricTabs, RecurringClassMetricType } from './RecurringClassMetricTabs';

interface RecurringClassMonthOnMonthTableProps {
  data: TeacherRecurringData[];
  onRowClick?: (trainer: string, monthData: any) => void;
}

export const RecurringClassMonthOnMonthTable: React.FC<RecurringClassMonthOnMonthTableProps> = ({
  data,
  onRowClick
}) => {
  const [selectedMetric, setSelectedMetric] = useState<RecurringClassMetricType>('attendance');

  const monthOnMonthData = useMemo(() => {
    if (!data.length) return [];

    // Group data by trainer and month
    const groupedData = data.reduce((acc, item) => {
      const monthYear = new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const key = `${item.trainer}-${monthYear}`;
      
      if (!acc[key]) {
        acc[key] = {
          trainer: item.trainer,
          monthYear,
          location: item.location,
          totalSessions: 0,
          totalAttendance: 0,
          totalRevenue: 0,
          totalCapacity: 0,
          totalEmpty: 0,
          totalLateCancelled: 0,
          classes: new Set()
        };
      }
      
      acc[key].totalSessions += 1;
      acc[key].totalAttendance += item.checkedIn;
      acc[key].totalRevenue += item.revenue;
      acc[key].totalCapacity += item.capacity;
      acc[key].totalEmpty += item.emptySessions;
      acc[key].totalLateCancelled += item.lateCancelled;
      acc[key].classes.add(item.class);
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and calculate derived metrics
    const result = Object.values(groupedData).map((item: any) => ({
      ...item,
      fillRate: item.totalCapacity > 0 ? (item.totalAttendance / item.totalCapacity) * 100 : 0,
      classAverage: item.totalSessions > 0 ? item.totalAttendance / item.totalSessions : 0,
      revenuePerSession: item.totalSessions > 0 ? item.totalRevenue / item.totalSessions : 0,
      classFormats: item.classes.size
    }));

    // Sort by trainer name and then by month
    return result.sort((a, b) => {
      if (a.trainer !== b.trainer) {
        return a.trainer.localeCompare(b.trainer);
      }
      return new Date(a.monthYear).getTime() - new Date(b.monthYear).getTime();
    });
  }, [data]);

  const getMetricValue = (item: any, metric: RecurringClassMetricType) => {
    switch (metric) {
      case 'attendance': return item.totalAttendance;
      case 'revenue': return item.totalRevenue;
      case 'fillRate': return item.fillRate;
      case 'classAverage': return item.classAverage;
      case 'emptySessions': return item.totalEmpty;
      case 'lateCancellations': return item.totalLateCancelled;
      case 'capacity': return item.totalCapacity;
      case 'sessions': return item.totalSessions;
      default: return 0;
    }
  };

  const formatMetricValue = (value: number, metric: RecurringClassMetricType) => {
    switch (metric) {
      case 'revenue': return formatCurrency(value);
      case 'fillRate': return `${value.toFixed(1)}%`;
      case 'classAverage': return value.toFixed(1);
      default: return formatNumber(value);
    }
  };

  const columns = [
    {
      key: 'trainer',
      header: 'Trainer',
      render: (value: string, item: any) => (
        <div className="space-y-1">
          <div className="font-semibold text-slate-900">{value}</div>
          <div className="text-xs text-slate-500">{item.location}</div>
          <Badge variant="outline" className="text-xs">
            {item.classFormats} formats
          </Badge>
        </div>
      ),
      className: 'min-w-[180px]',
      sortable: true
    },
    {
      key: 'monthYear',
      header: 'Month',
      render: (value: string) => (
        <div className="text-center">
          <div className="font-medium text-slate-800">{value}</div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'totalSessions',
      header: 'Sessions',
      render: (value: number) => (
        <div className="text-center font-semibold text-blue-700">
          {formatNumber(value)}
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: selectedMetric,
      header: selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1),
      render: (value: number, item: any) => {
        const metricValue = getMetricValue(item, selectedMetric);
        const isGood = selectedMetric === 'emptySessions' || selectedMetric === 'lateCancellations' 
          ? metricValue < 5 
          : metricValue > (selectedMetric === 'fillRate' ? 70 : 10);
        
        return (
          <div className={`text-center font-bold ${isGood ? 'text-green-700' : 'text-red-700'}`}>
            {formatMetricValue(metricValue, selectedMetric)}
          </div>
        );
      },
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'fillRate',
      header: 'Fill Rate',
      render: (value: number) => {
        const colorClass = value >= 80 ? 'text-green-700' : value >= 60 ? 'text-yellow-700' : 'text-red-700';
        return (
          <div className={`text-center font-semibold ${colorClass}`}>
            {value.toFixed(1)}%
          </div>
        );
      },
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'revenuePerSession',
      header: 'Revenue/Session',
      render: (value: number) => (
        <div className="text-center font-semibold text-purple-700">
          {formatCurrency(value)}
        </div>
      ),
      align: 'center' as const,
      sortable: true
    }
  ];

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Month-on-Month Performance
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 w-fit">
            {formatNumber(monthOnMonthData.length)} trainer-months
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <RecurringClassMetricTabs
          value={selectedMetric}
          onValueChange={setSelectedMetric}
        />
        
        <ModernDataTable
          data={monthOnMonthData}
          columns={columns}
          headerGradient="from-blue-600 to-blue-700"
          maxHeight="600px"
          stickyHeader
        />
      </CardContent>
    </Card>
  );
};
