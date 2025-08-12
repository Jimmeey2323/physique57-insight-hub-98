
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeacherRecurringData } from '@/hooks/useTeacherRecurringData';
import { TrendingUp, TrendingDown, Users, Calendar, Clock, Star, AlertTriangle, Filter } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface RecurringClassInteractiveRankingsProps {
  data: TeacherRecurringData[];
}

type RankingType = 'trainers' | 'classes' | 'formats' | 'problematic';
type MetricType = 'classAverage' | 'fillRate' | 'revenue' | 'revenuePerSession' | 'totalSessions' | 'emptySessions' | 'lateCancellations' | 'consistency';

interface FilterOptions {
  minSessions: number;
  maxSessions: number;
  minCheckedIn: number;
  maxCheckedIn: number;
  excludedClasses: string[];
}

export const RecurringClassInteractiveRankings: React.FC<RecurringClassInteractiveRankingsProps> = ({
  data
}) => {
  const [selectedRanking, setSelectedRanking] = useState<RankingType>('trainers');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('classAverage');
  const [showTop, setShowTop] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    minSessions: 1,
    maxSessions: 1000,
    minCheckedIn: 0,
    maxCheckedIn: 1000,
    excludedClasses: []
  });

  const uniqueClasses = useMemo(() => {
    return Array.from(new Set(data.map(item => item.class))).sort();
  }, [data]);

  const processedRankings = useMemo(() => {
    if (!data.length) return [];

    // Apply filters first
    const filteredData = data.filter(item => {
      return !filters.excludedClasses.includes(item.class);
    });

    const groupedData: Record<string, any> = {};

    filteredData.forEach(item => {
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
          totalCheckedIn: 0,
          totalRevenue: 0,
          totalCapacity: 0,
          totalEmpty: 0,
          totalLateCancelled: 0,
          dates: new Set(),
          attendanceVariance: 0,
          attendanceValues: []
        };
      }

      groupedData[key].totalSessions += 1;
      groupedData[key].totalCheckedIn += item.checkedIn;
      groupedData[key].totalRevenue += item.revenue;
      groupedData[key].totalCapacity += item.capacity;
      groupedData[key].totalEmpty += item.emptySessions;
      groupedData[key].totalLateCancelled += item.lateCancelled;
      groupedData[key].dates.add(item.date);
      groupedData[key].attendanceValues.push(item.checkedIn);
    });

    // Calculate derived metrics and apply session/attendance filters
    const rankings = Object.values(groupedData)
      .filter((item: any) => {
        return item.totalSessions >= filters.minSessions && 
               item.totalSessions <= filters.maxSessions &&
               item.totalCheckedIn >= filters.minCheckedIn && 
               item.totalCheckedIn <= filters.maxCheckedIn;
      })
      .map((item: any) => {
        const classAverage = item.totalSessions > 0 ? item.totalCheckedIn / item.totalSessions : 0;
        const fillRate = item.totalCapacity > 0 ? (item.totalCheckedIn / item.totalCapacity) * 100 : 0;
        const revenuePerSession = item.totalSessions > 0 ? item.totalRevenue / item.totalSessions : 0;
        
        // Calculate consistency (lower variance = more consistent)
        const mean = classAverage;
        const variance = item.attendanceValues.length > 1 
          ? item.attendanceValues.reduce((acc: number, val: number) => acc + Math.pow(val - mean, 2), 0) / item.attendanceValues.length
          : 0;
        const consistency = variance > 0 ? (1 / (1 + Math.sqrt(variance))) * 100 : 100;

        return {
          ...item,
          classAverage,
          fillRate,
          revenuePerSession,
          consistency,
          uniqueDates: item.dates.size,
          isProblematic: fillRate < 30 || item.totalEmpty > 5 || classAverage < 3
        };
      });

    // Filter problematic sessions
    if (selectedRanking === 'problematic') {
      return rankings.filter(item => item.isProblematic);
    }

    // Sort based on selected metric
    const sortedRankings = rankings.sort((a, b) => {
      let aValue, bValue;
      
      switch (selectedMetric) {
        case 'classAverage':
          aValue = a.classAverage;
          bValue = b.classAverage;
          break;
        case 'fillRate':
          aValue = a.fillRate;
          bValue = b.fillRate;
          break;
        case 'revenue':
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
          break;
        case 'revenuePerSession':
          aValue = a.revenuePerSession;
          bValue = b.revenuePerSession;
          break;
        case 'totalSessions':
          aValue = a.totalSessions;
          bValue = b.totalSessions;
          break;
        case 'emptySessions':
          aValue = a.totalEmpty;
          bValue = b.totalEmpty;
          break;
        case 'lateCancellations':
          aValue = a.totalLateCancelled;
          bValue = b.totalLateCancelled;
          break;
        case 'consistency':
          aValue = a.consistency;
          bValue = b.consistency;
          break;
        default:
          aValue = a.classAverage;
          bValue = b.classAverage;
      }

      // For negative metrics, reverse the sort
      const isNegativeMetric = selectedMetric === 'emptySessions' || selectedMetric === 'lateCancellations';
      if (isNegativeMetric) {
        return showTop ? aValue - bValue : bValue - aValue;
      }
      
      return showTop ? bValue - aValue : aValue - bValue;
    });

    return sortedRankings.slice(0, 10);
  }, [data, selectedRanking, selectedMetric, showTop, filters]);

  const getMetricValue = (item: any) => {
    switch (selectedMetric) {
      case 'classAverage': return item.classAverage;
      case 'fillRate': return item.fillRate;
      case 'revenue': return item.totalRevenue;
      case 'revenuePerSession': return item.revenuePerSession;
      case 'totalSessions': return item.totalSessions;
      case 'emptySessions': return item.totalEmpty;
      case 'lateCancellations': return item.totalLateCancelled;
      case 'consistency': return item.consistency;
      default: return item.classAverage;
    }
  };

  const formatMetricValue = (item: any) => {
    const value = getMetricValue(item);
    switch (selectedMetric) {
      case 'revenue': 
      case 'revenuePerSession': 
        return formatCurrency(value);
      case 'fillRate': 
      case 'consistency': 
        return `${value.toFixed(1)}%`;
      case 'classAverage':
        return value.toFixed(1);
      default: 
        return formatNumber(value);
    }
  };

  const getMetricIcon = () => {
    switch (selectedMetric) {
      case 'classAverage': return <Users className="w-4 h-4" />;
      case 'fillRate': return <Star className="w-4 h-4" />;
      case 'revenue': 
      case 'revenuePerSession': 
        return <TrendingUp className="w-4 h-4" />;
      case 'totalSessions': return <Calendar className="w-4 h-4" />;
      case 'emptySessions': return <AlertTriangle className="w-4 h-4" />;
      case 'lateCancellations': return <Clock className="w-4 h-4" />;
      case 'consistency': return <Star className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const isNegativeMetric = selectedMetric === 'emptySessions' || selectedMetric === 'lateCancellations';

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Star className="w-6 h-6 text-purple-600" />
            Interactive Rankings
          </CardTitle>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
        
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="minSessions">Min Sessions</Label>
                <Input
                  id="minSessions"
                  type="number"
                  value={filters.minSessions}
                  onChange={(e) => setFilters(prev => ({ ...prev, minSessions: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="maxSessions">Max Sessions</Label>
                <Input
                  id="maxSessions"
                  type="number"
                  value={filters.maxSessions}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxSessions: parseInt(e.target.value) || 1000 }))}
                />
              </div>
              <div>
                <Label htmlFor="minCheckedIn">Min Total Checked In</Label>
                <Input
                  id="minCheckedIn"
                  type="number"
                  value={filters.minCheckedIn}
                  onChange={(e) => setFilters(prev => ({ ...prev, minCheckedIn: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="maxCheckedIn">Max Total Checked In</Label>
                <Input
                  id="maxCheckedIn"
                  type="number"
                  value={filters.maxCheckedIn}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxCheckedIn: parseInt(e.target.value) || 1000 }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="excludedClasses">Exclude Classes</Label>
              <Select 
                value={filters.excludedClasses.join(',')} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  excludedClasses: value ? value.split(',') : [] 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select classes to exclude" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueClasses.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
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
              { key: 'classAverage', label: 'Class Average' },
              { key: 'fillRate', label: 'Fill Rate' },
              { key: 'revenue', label: 'Total Revenue' },
              { key: 'revenuePerSession', label: 'Revenue/Session' },
              { key: 'totalSessions', label: 'Total Sessions' },
              { key: 'consistency', label: 'Consistency' },
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
                      Avg: {item.classAverage.toFixed(1)} • {item.fillRate.toFixed(1)}% fill • {item.totalEmpty} empty
                    </div>
                  )}
                  <div className="text-xs text-slate-500">
                    {item.totalSessions} sessions • {item.totalCheckedIn} total checked in • {item.location}
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
                  <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                    <div>Avg: {item.classAverage.toFixed(1)} per session</div>
                    <div>Consistency: {item.consistency.toFixed(1)}%</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {processedRankings.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No data available for the selected criteria and filters
          </div>
        )}
      </CardContent>
    </Card>
  );
};
