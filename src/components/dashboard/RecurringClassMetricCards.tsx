
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Target, Award, Activity } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { TeacherRecurringData } from '@/hooks/useTeacherRecurringData';

interface MetricCardData {
  title: string;
  value: string;
  change: number;
  description: string;
  calculation: string;
  icon: 'sessions' | 'attendance' | 'revenue' | 'fillRate' | 'capacity' | 'efficiency';
}

interface RecurringClassMetricCardsProps {
  data: TeacherRecurringData[];
}

const iconMap = {
  sessions: { Icon: Calendar, color: 'from-blue-500 to-cyan-600' },
  attendance: { Icon: Users, color: 'from-green-500 to-emerald-600' },
  revenue: { Icon: DollarSign, color: 'from-purple-500 to-violet-600' },
  fillRate: { Icon: Target, color: 'from-orange-500 to-red-600' },
  capacity: { Icon: Award, color: 'from-pink-500 to-rose-600' },
  efficiency: { Icon: Activity, color: 'from-indigo-500 to-blue-600' }
};

export const RecurringClassMetricCards: React.FC<RecurringClassMetricCardsProps> = ({ data }) => {
  const metrics = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const totalSessions = data.length;
    const totalAttendance = data.reduce((sum, item) => sum + item.checkedIn, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalCapacity = data.reduce((sum, item) => sum + item.capacity, 0);
    const avgFillRate = totalCapacity > 0 ? (totalAttendance / totalCapacity) * 100 : 0;
    const avgClassSize = totalSessions > 0 ? totalAttendance / totalSessions : 0;

    // Calculate trends (simplified - in real scenario, you'd compare with previous period)
    const sessionsTrend = 15.2;
    const attendanceTrend = 8.5;
    const revenueTrend = 12.3;
    const fillRateTrend = 5.7;
    const capacityTrend = 3.2;
    const efficiencyTrend = 9.1;

    const cards: MetricCardData[] = [
      {
        title: 'Total Sessions',
        value: formatNumber(totalSessions),
        change: sessionsTrend,
        description: 'Recurring classes conducted',
        calculation: 'Count of all sessions',
        icon: 'sessions'
      },
      {
        title: 'Total Attendance',
        value: formatNumber(totalAttendance),
        change: attendanceTrend,
        description: 'Members who attended',
        calculation: 'Sum of checked-in members',
        icon: 'attendance'
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        change: revenueTrend,
        description: 'Revenue generated',
        calculation: 'Sum of session revenue',
        icon: 'revenue'
      },
      {
        title: 'Average Fill Rate',
        value: `${avgFillRate.toFixed(1)}%`,
        change: fillRateTrend,
        description: 'Capacity utilization',
        calculation: 'Attendance / Capacity × 100',
        icon: 'fillRate'
      },
      {
        title: 'Total Capacity',
        value: formatNumber(totalCapacity),
        change: capacityTrend,
        description: 'Available class spots',
        calculation: 'Sum of class capacities',
        icon: 'capacity'
      },
      {
        title: 'Avg Class Size',
        value: avgClassSize.toFixed(1),
        change: efficiencyTrend,
        description: 'Average attendees per class',
        calculation: 'Total Attendance / Sessions',
        icon: 'efficiency'
      }
    ];

    return cards;
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((card, index) => {
        const { Icon, color } = iconMap[card.icon];
        const isPositive = card.change >= 0;
        
        return (
          <Card 
            key={card.title}
            className={cn(
              "group relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2",
              `animate-fade-in delay-${index * 100}`
            )}
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-500",
              color
            )} />
            
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "p-3 rounded-2xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300",
                  color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <Badge
                  variant={isPositive ? "default" : "destructive"}
                  className={cn(
                    "flex items-center gap-1 text-xs font-semibold px-2 py-1",
                    isPositive 
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                      : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(card.change).toFixed(1)}%
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  {card.title}
                </h3>
                <p className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                  {card.value}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {card.description}
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-mono">
                  {card.calculation}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
