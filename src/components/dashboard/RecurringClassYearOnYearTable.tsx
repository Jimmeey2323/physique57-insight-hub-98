
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { TeacherRecurringData } from '@/hooks/useTeacherRecurringData';
import { Calendar, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { RecurringClassMetricTabs, RecurringClassMetricType } from './RecurringClassMetricTabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface RecurringClassYearOnYearTableProps {
  data: TeacherRecurringData[];
  onRowClick?: (trainer: string, yearData: any) => void;
}

// Move helper functions outside of component to avoid hoisting issues
const getMetricValue = (yearData: any, metric: RecurringClassMetricType) => {
  if (!yearData) return 0;
  switch (metric) {
    case 'attendance': return yearData.attendance;
    case 'revenue': return yearData.revenue;
    case 'fillRate': return yearData.capacity > 0 ? (yearData.attendance / yearData.capacity) * 100 : 0;
    case 'classAverage': return yearData.sessions > 0 ? yearData.attendance / yearData.sessions : 0;
    case 'emptySessions': return yearData.emptySessions;
    case 'lateCancellations': return yearData.lateCancellations;
    case 'capacity': return yearData.capacity;
    case 'sessions': return yearData.sessions;
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

export const RecurringClassYearOnYearTable: React.FC<RecurringClassYearOnYearTableProps> = ({
  data,
  onRowClick
}) => {
  const [selectedMetric, setSelectedMetric] = useState<RecurringClassMetricType>('attendance');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { processedData, uniqueYears } = useMemo(() => {
    if (!data.length) return { processedData: [], uniqueYears: [] };

    // Get unique years and sort them
    const years = Array.from(new Set(data.map(item => {
      return new Date(item.date).getFullYear().toString();
    }))).sort().reverse(); // Most recent first

    // Group data by trainer + class + time
    const groupedData = data.reduce((acc, item) => {
      const year = new Date(item.date).getFullYear().toString();
      const key = `${item.trainer}-${item.class}-${item.time}`;
      
      if (!acc[key]) {
        acc[key] = {
          trainer: item.trainer,
          class: item.class,
          day: item.day,
          time: item.time,
          location: item.location,
          yearlyData: {},
          totalSessions: 0,
          totalAttendance: 0,
          totalRevenue: 0,
          totalCapacity: 0
        };
      }
      
      if (!acc[key].yearlyData[year]) {
        acc[key].yearlyData[year] = {
          sessions: 0,
          attendance: 0,
          revenue: 0,
          capacity: 0,
          emptySessions: 0,
          lateCancellations: 0
        };
      }
      
      acc[key].yearlyData[year].sessions += 1;
      acc[key].yearlyData[year].attendance += item.checkedIn;
      acc[key].yearlyData[year].revenue += item.revenue;
      acc[key].yearlyData[year].capacity += item.capacity;
      acc[key].yearlyData[year].emptySessions += item.emptySessions;
      acc[key].yearlyData[year].lateCancellations += item.lateCancelled;
      
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
      uniqueYears: years
    };
  }, [data]);

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
    } else if (uniqueYears.includes(sortField)) {
      aValue = getMetricValue(a.yearlyData[sortField], selectedMetric);
      bValue = getMetricValue(b.yearlyData[sortField], selectedMetric);
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const calculateYoYChange = (currentYear: string, previousYear: string, row: any) => {
    const currentValue = getMetricValue(row.yearlyData[currentYear], selectedMetric);
    const previousValue = getMetricValue(row.yearlyData[previousYear], selectedMetric);
    
    if (previousValue === 0) return 0;
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Year-on-Year Performance
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
                {uniqueYears.map((year) => (
                  <TableHead 
                    key={year}
                    className="font-bold text-white text-center cursor-pointer hover:bg-white/10 min-w-[120px]"
                    onClick={() => handleSort(year)}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {year}
                      {sortField === year && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </TableHead>
                ))}
                {uniqueYears.length >= 2 && (
                  <TableHead className="font-bold text-white text-center min-w-[100px]">
                    YoY Change
                  </TableHead>
                )}
                <TableHead className="font-bold text-white text-center min-w-[100px]">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row, index) => {
                const yoyChange = uniqueYears.length >= 2 
                  ? calculateYoYChange(uniqueYears[0], uniqueYears[1], row)
                  : 0;
                
                return (
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
                    {uniqueYears.map((year) => {
                      const yearData = row.yearlyData[year];
                      const value = getMetricValue(yearData, selectedMetric);
                      const isGood = selectedMetric === 'emptySessions' || selectedMetric === 'lateCancellations' 
                        ? value < 5 
                        : value > (selectedMetric === 'fillRate' ? 60 : 10);
                      
                      return (
                        <TableCell key={year} className="text-center">
                          {yearData ? (
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
                    {uniqueYears.length >= 2 && (
                      <TableCell className="text-center">
                        <div className={cn(
                          "font-semibold flex items-center justify-center gap-1",
                          yoyChange >= 0 ? 'text-green-700' : 'text-red-700'
                        )}>
                          {yoyChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {formatPercentage(yoyChange)}
                        </div>
                      </TableCell>
                    )}
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
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
