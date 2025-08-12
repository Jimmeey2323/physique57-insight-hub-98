
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { TeacherRecurringData } from '@/hooks/useTeacherRecurringData';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { RecurringClassMetricTabs, RecurringClassMetricType } from './RecurringClassMetricTabs';

interface RecurringClassYearOnYearTableProps {
  data: TeacherRecurringData[];
  onRowClick?: (trainer: string, yearData: any) => void;
}

export const RecurringClassYearOnYearTable: React.FC<RecurringClassYearOnYearTableProps> = ({
  data,
  onRowClick
}) => {
  const [selectedMetric, setSelectedMetric] = useState<RecurringClassMetricType>('attendance');

  const yearOnYearData = useMemo(() => {
    if (!data.length) return [];

    // Group data by trainer and year
    const groupedData = data.reduce((acc, item) => {
      const year = new Date(item.date).getFullYear().toString();
      const key = `${item.trainer}-${year}`;
      
      if (!acc[key]) {
        acc[key] = {
          trainer: item.trainer,
          year,
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

    // Convert to array and calculate year-over-year changes
    const result = Object.values(groupedData).map((item: any) => {
      const fillRate = item.totalCapacity > 0 ? (item.totalAttendance / item.totalCapacity) * 100 : 0;
      const classAverage = item.totalSessions > 0 ? item.totalAttendance / item.totalSessions : 0;
      
      return {
        ...item,
        fillRate,
        classAverage,
        revenuePerSession: item.totalSessions > 0 ? item.totalRevenue / item.totalSessions : 0,
        classFormats: item.classes.size
      };
    });

    // Calculate year-over-year changes
    const resultWithChanges = result.map(item => {
      const previousYear = result.find(prev => 
        prev.trainer === item.trainer && 
        parseInt(prev.year) === parseInt(item.year) - 1
      );
      
      let yoyChange = 0;
      if (previousYear) {
        const currentValue = getMetricValue(item, selectedMetric);
        const previousValue = getMetricValue(previousYear, selectedMetric);
        if (previousValue > 0) {
          yoyChange = ((currentValue - previousValue) / previousValue) * 100;
        }
      }
      
      return { ...item, yoyChange };
    });

    return resultWithChanges.sort((a, b) => {
      if (a.trainer !== b.trainer) {
        return a.trainer.localeCompare(b.trainer);
      }
      return parseInt(b.year) - parseInt(a.year);
    });
  }, [data, selectedMetric]);

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
      key: 'year',
      header: 'Year',
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
          ? metricValue < 10 
          : metricValue > (selectedMetric === 'fillRate' ? 70 : 20);
        
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
      key: 'yoyChange',
      header: 'YoY Change',
      render: (value: number, item: any) => {
        if (value === 0) return <div className="text-center text-slate-400">N/A</div>;
        
        const isPositive = value > 0;
        const shouldBePositive = selectedMetric !== 'emptySessions' && selectedMetric !== 'lateCancellations';
        const isGood = shouldBePositive ? isPositive : !isPositive;
        
        return (
          <div className={`text-center font-semibold flex items-center justify-center gap-1 ${
            isGood ? 'text-green-700' : 'text-red-700'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {formatPercentage(value)}
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
    }
  ];

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Year-on-Year Comparison
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 w-fit">
            {formatNumber(yearOnYearData.length)} trainer-years
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <RecurringClassMetricTabs
          value={selectedMetric}
          onValueChange={setSelectedMetric}
        />
        
        <ModernDataTable
          data={yearOnYearData}
          columns={columns}
          headerGradient="from-blue-600 to-blue-700"
          maxHeight="600px"
          stickyHeader
        />
      </CardContent>
    </Card>
  );
};
