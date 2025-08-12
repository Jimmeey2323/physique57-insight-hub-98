
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { TeacherRecurringData } from '@/hooks/useTeacherRecurringData';
import { Award, TrendingDown, Users, DollarSign, Target, AlertTriangle } from 'lucide-react';

interface RecurringClassTopBottomListsProps {
  data: TeacherRecurringData[];
}

export const RecurringClassTopBottomLists: React.FC<RecurringClassTopBottomListsProps> = ({
  data
}) => {
  const analysisData = useMemo(() => {
    if (!data.length) return { topTrainers: [], bottomTrainers: [], topClasses: [], problematicSessions: [] };

    // Aggregate by trainer
    const trainerStats = data.reduce((acc, item) => {
      if (!acc[item.trainer]) {
        acc[item.trainer] = {
          name: item.trainer,
          location: item.location,
          totalSessions: 0,
          totalAttendance: 0,
          totalRevenue: 0,
          totalCapacity: 0,
          totalEmpty: 0,
          totalLateCancelled: 0,
          classFormats: new Set()
        };
      }
      
      acc[item.trainer].totalSessions += 1;
      acc[item.trainer].totalAttendance += item.checkedIn;
      acc[item.trainer].totalRevenue += item.revenue;
      acc[item.trainer].totalCapacity += item.capacity;
      acc[item.trainer].totalEmpty += item.emptySessions;
      acc[item.trainer].totalLateCancelled += item.lateCancelled;
      acc[item.trainer].classFormats.add(item.class);
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and calculate metrics
    const trainers = Object.values(trainerStats).map((trainer: any) => ({
      ...trainer,
      fillRate: trainer.totalCapacity > 0 ? (trainer.totalAttendance / trainer.totalCapacity) * 100 : 0,
      avgClassSize: trainer.totalSessions > 0 ? trainer.totalAttendance / trainer.totalSessions : 0,
      revenuePerSession: trainer.totalSessions > 0 ? trainer.totalRevenue / trainer.totalSessions : 0,
      formatCount: trainer.classFormats.size
    }));

    // Top performers by revenue
    const topTrainers = [...trainers]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // Bottom performers (need improvement)
    const bottomTrainers = [...trainers]
      .filter(t => t.totalSessions >= 3) // Only include trainers with meaningful data
      .sort((a, b) => a.fillRate - b.fillRate)
      .slice(0, 5);

    // Aggregate by class type
    const classStats = data.reduce((acc, item) => {
      if (!acc[item.class]) {
        acc[item.class] = {
          name: item.class,
          type: item.type,
          totalSessions: 0,
          totalAttendance: 0,
          totalRevenue: 0,
          totalCapacity: 0,
          locations: new Set()
        };
      }
      
      acc[item.class].totalSessions += 1;
      acc[item.class].totalAttendance += item.checkedIn;
      acc[item.class].totalRevenue += item.revenue;
      acc[item.class].totalCapacity += item.capacity;
      acc[item.class].locations.add(item.location);
      
      return acc;
    }, {} as Record<string, any>);

    // Top classes by attendance
    const topClasses = Object.values(classStats)
      .map((cls: any) => ({
        ...cls,
        fillRate: cls.totalCapacity > 0 ? (cls.totalAttendance / cls.totalCapacity) * 100 : 0,
        avgClassSize: cls.totalSessions > 0 ? cls.totalAttendance / cls.totalSessions : 0,
        locationCount: cls.locations.size
      }))
      .sort((a: any, b: any) => b.totalAttendance - a.totalAttendance)
      .slice(0, 5);

    // Problematic sessions (empty or low attendance)
    const problematicSessions = data
      .filter(item => item.checkedIn === 0 || parseFloat(item.fillRate.replace('%', '')) < 20)
      .sort((a, b) => parseFloat(a.fillRate.replace('%', '')) - parseFloat(b.fillRate.replace('%', '')))
      .slice(0, 10);

    return { topTrainers, bottomTrainers, topClasses, problematicSessions };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Trainers */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Award className="w-5 h-5" />
            Top Performing Trainers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysisData.topTrainers.map((trainer: any, index: number) => (
            <div key={trainer.name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-800">#{index + 1}</Badge>
                <div>
                  <div className="font-medium text-green-900">{trainer.name}</div>
                  <div className="text-sm text-green-600">{trainer.location}</div>
                  <div className="text-xs text-green-500">{trainer.formatCount} formats</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-900">{formatCurrency(trainer.totalRevenue)}</div>
                <div className="text-sm text-green-600">{trainer.fillRate.toFixed(1)}% fill rate</div>
                <div className="text-xs text-green-500">{formatNumber(trainer.totalSessions)} sessions</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bottom Trainers (Need Improvement) */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <TrendingDown className="w-5 h-5" />
            Improvement Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysisData.bottomTrainers.map((trainer: any, index: number) => (
            <div key={trainer.name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100">
              <div className="flex items-center gap-3">
                <Badge className="bg-orange-100 text-orange-800">#{index + 1}</Badge>
                <div>
                  <div className="font-medium text-orange-900">{trainer.name}</div>
                  <div className="text-sm text-orange-600">{trainer.location}</div>
                  <div className="text-xs text-orange-500">{trainer.formatCount} formats</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-orange-900">{trainer.fillRate.toFixed(1)}%</div>
                <div className="text-sm text-orange-600">{formatCurrency(trainer.totalRevenue)}</div>
                <div className="text-xs text-orange-500">{formatNumber(trainer.totalSessions)} sessions</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Classes */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Users className="w-5 h-5" />
            Most Popular Classes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysisData.topClasses.map((cls: any, index: number) => (
            <div key={cls.name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-100 text-blue-800">#{index + 1}</Badge>
                <div>
                  <div className="font-medium text-blue-900">{cls.name}</div>
                  <div className="text-sm text-blue-600">{cls.type}</div>
                  <div className="text-xs text-blue-500">{cls.locationCount} locations</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-900">{formatNumber(cls.totalAttendance)}</div>
                <div className="text-sm text-blue-600">{cls.fillRate.toFixed(1)}% fill rate</div>
                <div className="text-xs text-blue-500">{formatNumber(cls.totalSessions)} sessions</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Problematic Sessions */}
      <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            Sessions Needing Attention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {analysisData.problematicSessions.map((session: any, index: number) => (
            <div key={session.uniqueId1} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100">
              <div className="flex items-center gap-3">
                <Badge className="bg-red-100 text-red-800">#{index + 1}</Badge>
                <div>
                  <div className="font-medium text-red-900 text-sm">{session.sessionName}</div>
                  <div className="text-xs text-red-600">{session.trainer}</div>
                  <div className="text-xs text-red-500">{session.date} • {session.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-red-900">{session.fillRate}</div>
                <div className="text-sm text-red-600">{formatNumber(session.checkedIn)}/{formatNumber(session.capacity)}</div>
                <div className="text-xs text-red-500">{session.location}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
