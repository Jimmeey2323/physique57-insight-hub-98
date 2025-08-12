
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TeacherRecurringData } from '@/hooks/useTeacherRecurringData';
import { TrendingUp, TrendingDown, Users, Calendar, Clock, Star, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface RecurringClassInteractiveRankingsProps {
  data: TeacherRecurringData[];
}

type RankingType = 'trainers' | 'classes' | 'formats' | 'problematic';
type MetricType = 'attendance' | 'revenue' | 'fillRate' | 'emptySessions' | 'lateCancellations';

export const RecurringClassInteractiveRankings: React.FC<RecurringClassInteractiveRankingsProps> = ({
  data
}) => {
  const [selectedRanking, setSelectedRanking] = useState<RankingType>('trainers');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('attendance');
  const [showTop, setShowTop] = useState(true);

  const processedRankings = useMemo(() => {
    if (!data.length) return [];

    const groupedData: Record<string, any> = {};

    data.forEach(item => {
      let key: string;
      
      switch (selectedRanking) {
        case 'trainers':
          key = item.trainer;
          break;
        case 'classes':
          key = `${item.class} - ${item.time}`;
          break;
        case 'formats':
          key = item.class;
          break;
        case 'problematic':
          key = `${item.trainer} - ${item.class} - ${item.time}`;
          break;
        default:
          key = item.trainer;
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          name: key,
          trainer: item.trainer,
          class: item.class,
          time: item.time,
          location: item.location,
          totalSessions: 0,
          totalAttendance: 0,
          totalRevenue: 0,
          totalCapacity: 0,
          totalEmpty: 0,
          totalLateCancelled: 0,
          dates: new Set()
        };
      }

      groupedData[key].totalSessions += 1;
      groupedData[key].totalAttendance += item.checkedIn;
      groupedData[key].totalRevenue += item.revenue;
      groupedData[key].totalCapacity += item.capacity;
      groupedData[key].totalEmpty += item.emptySessions;
      groupedData[key].totalLateCancelled += item.lateCancelled;
      groupedData[key].dates.add(item.date);
    });

    // Calculate derived metrics
    const rankings = Object.values(groupedData).map((item: any) => ({
      ...item,
      fillRate: item.totalCapacity > 0 ? (item.totalAttendance / item.totalCapacity) * 100 : 0,
      classAverage: item.totalSessions > 0 ? item.totalAttendance / item.totalSessions : 0,
      revenuePerSession: item.totalSessions > 0 ? item.totalRevenue / item.totalSessions : 0,
      uniqueDates: item.dates.size,
      isProblematic: item.totalCapacity > 0 && ((item.totalAttendance / item.totalCapacity) * 100 < 30) || item.totalEmpty > 5
    }));

    // Filter problematic sessions
    if (selectedRanking === 'problematic') {
      return rankings.filter(item => item.isProblematic);
    }

    // Sort based on selected metric
    const sortedRankings = rankings.sort((a, b) => {
      let aValue, bValue;
      
      switch (selectedMetric) {
        case 'attendance':
          aValue = a.totalAttendance;
          bValue = b.totalAttendance;
          break;
        case 'revenue':
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
          break;
        case 'fillRate':
          aValue = a.fillRate;
          bValue = b.fillRate;
          break;
        case 'emptySessions':
          aValue = a.totalEmpty;
          bValue = b.totalEmpty;
          break;
        case 'lateCancellations':
          aValue = a.totalLateCancelled;
          bValue = b.totalLateCancelled;
          break;
        default:
          aValue = a.totalAttendance;
          bValue = b.totalAttendance;
      }

      // For negative metrics, reverse the sort
      const isNegativeMetric = selectedMetric === 'emptySessions' || selectedMetric === 'lateCancellations';
      if (isNegativeMetric) {
        return showTop ? aValue - bValue : bValue - aValue;
      }
      
      return showTop ? bValue - aValue : aValue - bValue;
    });

    return sortedRankings.slice(0, 10);
  }, [data, selectedRanking, selectedMetric, showTop]);

  const getMetricValue = (item: any) => {
    switch (selectedMetric) {
      case 'attendance': return item.totalAttendance;
      case 'revenue': return item.totalRevenue;
      case 'fillRate': return item.fillRate;
      case 'emptySessions': return item.totalEmpty;
      case 'lateCancellations': return item.totalLateCancelled;
      default: return item.totalAttendance;
    }
  };

  const formatMetricValue = (item: any) => {
    const value = getMetricValue(item);
    switch (selectedMetric) {
      case 'revenue': return formatCurrency(value);
      case 'fillRate': return `${value.toFixed(1)}%`;
      default: return formatNumber(value);
    }
  };

  const getMetricIcon = () => {
    switch (selectedMetric) {
      case 'attendance': return <Users className="w-4 h-4" />;
      case 'revenue': return <TrendingUp className="w-4 h-4" />;
      case 'fillRate': return <Star className="w-4 h-4" />;
      case 'emptySessions': return <AlertTriangle className="w-4 h-4" />;
      case 'lateCancellations': return <Clock className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const isNegativeMetric = selectedMetric === 'emptySessions' || selectedMetric === 'lateCancellations';

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Star className="w-6 h-6 text-purple-600" />
          Interactive Rankings
        </CardTitle>
        
        {/* Ranking Type Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { key: 'trainers', label: 'Trainers', icon: Users },
            { key: 'classes', label: 'Classes', icon: Calendar },
            { key: 'formats', label: 'Formats', icon: Star },
            { key: 'problematic', label: 'Problematic', icon: AlertTriangle }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={selectedRanking === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRanking(key as RankingType)}
              className={cn(
                "flex items-center gap-2",
                selectedRanking === key 
                  ? "bg-purple-600 hover:bg-purple-700" 
                  : "hover:bg-purple-50"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Metric Selection */}
        {selectedRanking !== 'problematic' && (
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { key: 'attendance', label: 'Attendance' },
              { key: 'revenue', label: 'Revenue' },
              { key: 'fillRate', label: 'Fill Rate' },
              { key: 'emptySessions', label: 'Empty Sessions' },
              { key: 'lateCancellations', label: 'Late Cancellations' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={selectedMetric === key ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedMetric(key as MetricType)}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        )}

        {/* Top/Bottom Toggle */}
        {selectedRanking !== 'problematic' && (
          <div className="flex gap-2 mt-3">
            <Button
              variant={showTop ? "default" : "outline"}
              size="sm"
              onClick={() => setShowTop(true)}
              className={cn(
                "flex items-center gap-1",
                showTop && "bg-green-600 hover:bg-green-700"
              )}
            >
              <TrendingUp className="w-3 h-3" />
              Top {isNegativeMetric ? 'Worst' : 'Best'}
            </Button>
            <Button
              variant={!showTop ? "default" : "outline"}
              size="sm"
              onClick={() => setShowTop(false)}
              className={cn(
                "flex items-center gap-1",
                !showTop && "bg-red-600 hover:bg-red-700"
              )}
            >
              <TrendingDown className="w-3 h-3" />
              Bottom {isNegativeMetric ? 'Best' : 'Worst'}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {processedRankings.map((item, index) => (
            <div
              key={item.name}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md",
                index === 0 && "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200",
                index === 1 && "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200",
                index === 2 && "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200",
                index > 2 && "bg-gray-50 border-gray-200"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                  index === 0 && "bg-yellow-500 text-white",
                  index === 1 && "bg-gray-500 text-white",
                  index === 2 && "bg-orange-500 text-white",
                  index > 2 && "bg-slate-400 text-white"
                )}>
                  {index + 1}
                </div>
                
                <div>
                  <div className="font-semibold text-slate-900">{item.name}</div>
                  {selectedRanking === 'classes' && (
                    <div className="text-sm text-slate-600">{item.trainer}</div>
                  )}
                  {selectedRanking === 'problematic' && (
                    <div className="text-sm text-red-600">
                      {item.fillRate.toFixed(1)}% fill rate • {item.totalEmpty} empty sessions
                    </div>
                  )}
                  <div className="text-xs text-slate-500">
                    {item.totalSessions} sessions • {item.location}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  {getMetricIcon()}
                  <span className={cn(
                    "font-bold text-lg",
                    selectedRanking === 'problematic' || (isNegativeMetric && showTop) 
                      ? "text-red-600" 
                      : "text-green-600"
                  )}>
                    {formatMetricValue(item)}
                  </span>
                </div>
                
                {selectedRanking !== 'problematic' && (
                  <div className="text-xs text-slate-500 mt-1">
                    Avg: {item.classAverage.toFixed(1)} per session
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {processedRankings.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No data available for the selected criteria
          </div>
        )}
      </CardContent>
    </Card>
  );
};
