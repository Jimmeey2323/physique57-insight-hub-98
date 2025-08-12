
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { TeacherRecurringData } from '@/hooks/useTeacherRecurringData';
import { Calendar, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { RecurringClassMetricTabs, RecurringClassMetricType } from './RecurringClassMetricTabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface RecurringClassMonthOnMonthTableProps {
  data: TeacherRecurringData[];
  onRowClick?: (trainer: string, monthData: any) => void;
}

export const RecurringClassMonthOnMonthTable: React.FC<RecurringClassMonthOnMonthTableProps> = ({
  data,
  onRowClick
}) => {
  const [selectedMetric, setSelectedMetric] = useState<RecurringClassMetricType>('attendance');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { processedData, uniqueMonths } = useMemo(() => {
    if (!data.length) return { processedData: [], uniqueMonths: [] };

    // Get unique months and sort them
    const months = Array.from(new Set(data.map(item => {
      const date = new Date(item.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))).sort().reverse(); // Most recent first

    // Group data by trainer + class + time
    const groupedData = data.reduce((acc, item) => {
      const month = new Date(item.date).toISOString().slice(0, 7); // YYYY-MM format
      const key = `${item.trainer}-${item.class}-${item.time}`;
      
      if (!acc[key]) {
        acc[key] = {
          trainer: item.trainer,
          class: item.class,
          day: item.day,
          time: item.time,
          location: item.location,
          monthlyData: {},
          totalSessions: 0,
          totalAttendance: 0,
          totalRevenue: 0,
          totalCapacity: 0
        };
      }
      
      if (!acc[key].monthlyData[month]) {
        acc[key].monthlyData[month] = {
          sessions: 0,
          attendance: 0,
          revenue: 0,
          capacity: 0,
          emptySessions: 0,
          lateCancellations: 0
        };
      }
      
      acc[key].monthlyData[month].sessions += 1;
      acc[key].monthlyData[month].attendance += item.checkedIn;
      acc[key].monthlyData[month].revenue += item.revenue;
      acc[key].monthlyData[month].capacity += item.capacity;
      acc[key].monthlyData[month].emptySessions += item.emptySessions;
      acc[key].monthlyData[month].lateCancellations += item.lateCancelled;
      
      acc[key].totalSessions += 1;
      acc[key].totalAttendance += item.checkedIn;
      acc[key].totalRevenue += item.revenue;
      acc[key].totalCapacity += item.capacity;
      
      return acc;
    }, {} as Record<string, any>);

    const processedRows = Object.values(groupedData).map((row: any) => ({
      ...row,
      fillRate: row.totalCapacity > 0 ? (row.totalAttendance / row.totalCapacity) * 100 : 0,
      classAverage: row.totalSessions > 0 ? row.totalAttendance / row.totalSessions : 0,
      revenuePerSession: row.totalSessions > 0 ? row.totalRevenue / row.totalSessions : 0
    }));

    return {
      processedData: processedRows,
      uniqueMonths: months
    };
  }, [data]);

  const getMetricValue = (monthData: any, metric: RecurringClassMetricType) => {
    if (!monthData) return 0;
    switch (metric) {
      case 'attendance': return monthData.attendance;
      case 'revenue': return monthData.revenue;
      case 'fillRate': return monthData.capacity > 0 ? (monthData.attendance / monthData.capacity) * 100 : 0;
      case 'classAverage': return monthData.sessions > 0 ? monthData.attendance / monthData.sessions : 0;
      case 'emptySessions': return monthData.emptySessions;
      case 'lateCancellations': return monthData.lateCancellations;
      case 'capacity': return monthData.capacity;
      case 'sessions': return monthData.sessions;
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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...processedData].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue, bValue;
    
    if (sortField === 'trainer') {
      aValue = a.trainer;
      bValue = b.trainer;
    } else if (uniqueMonths.includes(sortField)) {
      aValue = getMetricValue(a.monthlyData[sortField], selectedMetric);
      bValue = getMetricValue(b.monthlyData[sortField], selectedMetric);
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Month-on-Month Performance
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 w-fit">
            {formatNumber(processedData.length)} class schedules
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <RecurringClassMetricTabs
          value={selectedMetric}
          onValueChange={setSelectedMetric}
        />
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <TableHead 
                  className="font-bold text-white cursor-pointer hover:bg-white/10 sticky left-0 bg-blue-600 z-10 min-w-[280px]"
                  onClick={() => handleSort('trainer')}
                >
                  <div className="flex items-center gap-1">
                    Trainer / Class / Schedule
                    {sortField === 'trainer' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </TableHead>
                {uniqueMonths.map((month) => (
                  <TableHead 
                    key={month}
                    className="font-bold text-white text-center cursor-pointer hover:bg-white/10 min-w-[120px]"
                    onClick={() => handleSort(month)}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {sortField === month && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="font-bold text-white text-center min-w-[100px]">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row, index) => (
                <TableRow 
                  key={index} 
                  className="hover:bg-slate-50/80 transition-colors border-b cursor-pointer"
                  onClick={() => onRowClick?.(row.trainer, row)}
                >
                  <TableCell className="sticky left-0 bg-white z-10 border-r">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900">{row.trainer}</div>
                      <div className="text-sm text-blue-600 font-medium">{row.class}</div>
                      <div className="text-xs text-slate-500">{row.day} • {row.time}</div>
                      <div className="text-xs text-slate-400">{row.location}</div>
                    </div>
                  </TableCell>
                  {uniqueMonths.map((month) => {
                    const monthData = row.monthlyData[month];
                    const value = getMetricValue(monthData, selectedMetric);
                    const isGood = selectedMetric === 'emptySessions' || selectedMetric === 'lateCancellations' 
                      ? value < 2 
                      : value > (selectedMetric === 'fillRate' ? 50 : 5);
                    
                    return (
                      <TableCell key={month} className="text-center">
                        {monthData ? (
                          <div className={cn(
                            "font-semibold",
                            isGood ? 'text-green-700' : 'text-red-700'
                          )}>
                            {formatMetricValue(value, selectedMetric)}
                          </div>
                        ) : (
                          <div className="text-slate-400">-</div>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">
                    <div className="font-bold text-slate-700">
                      {formatMetricValue(
                        selectedMetric === 'revenue' ? row.totalRevenue :
                        selectedMetric === 'attendance' ? row.totalAttendance :
                        selectedMetric === 'sessions' ? row.totalSessions :
                        selectedMetric === 'capacity' ? row.totalCapacity :
                        selectedMetric === 'fillRate' ? row.fillRate :
                        selectedMetric === 'classAverage' ? row.classAverage :
                        row.totalSessions,
                        selectedMetric
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
