
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TeacherRecurringData } from '@/hooks/useTeacherRecurringData';
import { TrendingUp, TrendingDown, Users, Calendar, BarChart3, PieChart, Target, Activity } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line
} from 'recharts';

interface RecurringClassAnimatedChartsProps {
  data: TeacherRecurringData[];
}

type ChartType = 'attendance' | 'revenue' | 'fillRate' | 'trends';

export const RecurringClassAnimatedCharts: React.FC<RecurringClassAnimatedChartsProps> = ({
  data
}) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('attendance');

  const chartData = useMemo(() => {
    if (!data.length) return { attendanceData: [], revenueData: [], fillRateData: [], trendsData: [] };

    // Group by month for trends
    const monthlyData = data.reduce((acc, item) => {
      const month = new Date(item.date).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = {
          month,
          totalAttendance: 0,
          totalRevenue: 0,
          totalCapacity: 0,
          totalSessions: 0,
          uniqueClasses: new Set()
        };
      }
      acc[month].totalAttendance += item.checkedIn;
      acc[month].totalRevenue += item.revenue;
      acc[month].totalCapacity += item.capacity;
      acc[month].totalSessions += 1;
      acc[month].uniqueClasses.add(item.class);
      return acc;
    }, {} as Record<string, any>);

    const trendsData = Object.values(monthlyData)
      .map((month: any) => ({
        ...month,
        fillRate: month.totalCapacity > 0 ? (month.totalAttendance / month.totalCapacity) * 100 : 0,
        avgAttendance: month.totalSessions > 0 ? month.totalAttendance / month.totalSessions : 0,
        classCount: month.uniqueClasses.size,
        monthName: new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months

    // Top classes by attendance (checked in values)
    const classStats = data.reduce((acc, item) => {
      if (!acc[item.class]) {
        acc[item.class] = {
          name: item.class,
          totalAttendance: 0,
          totalRevenue: 0,
          totalCapacity: 0,
          totalSessions: 0
        };
      }
      acc[item.class].totalAttendance += item.checkedIn; // Using checkedIn for attendance
      acc[item.class].totalRevenue += item.revenue;
      acc[item.class].totalCapacity += item.capacity;
      acc[item.class].totalSessions += 1;
      return acc;
    }, {} as Record<string, any>);

    const attendanceData = Object.values(classStats)
      .map((cls: any) => ({
        ...cls,
        fillRate: cls.totalCapacity > 0 ? (cls.totalAttendance / cls.totalCapacity) * 100 : 0,
        avgAttendance: cls.totalSessions > 0 ? cls.totalAttendance / cls.totalSessions : 0
      }))
      .sort((a: any, b: any) => b.avgAttendance - a.avgAttendance) // Sort by class average
      .slice(0, 8);

    const revenueData = Object.values(classStats)
      .map((cls: any) => ({
        ...cls,
        avgRevenue: cls.totalSessions > 0 ? cls.totalRevenue / cls.totalSessions : 0
      }))
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 8);

    // Trainer performance
    const trainerStats = data.reduce((acc, item) => {
      if (!acc[item.trainer]) {
        acc[item.trainer] = {
          name: item.trainer,
          totalAttendance: 0,
          totalRevenue: 0,
          totalCapacity: 0,
          totalSessions: 0
        };
      }
      acc[item.trainer].totalAttendance += item.checkedIn; // Using checkedIn for attendance
      acc[item.trainer].totalRevenue += item.revenue;
      acc[item.trainer].totalCapacity += item.capacity;
      acc[item.trainer].totalSessions += 1;
      return acc;
    }, {} as Record<string, any>);

    const fillRateData = Object.values(trainerStats)
      .map((trainer: any) => ({
        ...trainer,
        fillRate: trainer.totalCapacity > 0 ? (trainer.totalAttendance / trainer.totalCapacity) * 100 : 0,
        avgAttendance: trainer.totalSessions > 0 ? trainer.totalAttendance / trainer.totalSessions : 0
      }))
      .sort((a: any, b: any) => b.fillRate - a.fillRate)
      .slice(0, 8);

    return { attendanceData, revenueData, fillRateData, trendsData };
  }, [data]);

  const chartColors = [
    '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#84cc16'
  ];

  const renderChart = () => {
    switch (selectedChart) {
      case 'attendance':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Class Attendance Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: '#1e40af' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#1e40af' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any, name: string) => [
                        name === 'totalAttendance' ? formatNumber(value) : value.toFixed(1),
                        name === 'totalAttendance' ? 'Total Checked In' : 'Avg per Session'
                      ]}
                    />
                    <Bar 
                      dataKey="totalAttendance" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      animationDuration={800}
                    />
                    <Bar 
                      dataKey="avgAttendance" 
                      fill="#06b6d4"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Class Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip 
                      formatter={(value: any) => [formatNumber(value), 'Total Checked In']}
                    />
                    <Legend />
                    <Pie
                      data={chartData.attendanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={100}
                      dataKey="totalAttendance"
                      animationDuration={1200}
                    >
                      {chartData.attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );

      case 'revenue':
        return (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Revenue Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dcfce7" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#166534' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#166534' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#f0fdf4', 
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: string) => [
                      name === 'totalRevenue' ? formatCurrency(value) : formatCurrency(value),
                      name === 'totalRevenue' ? 'Total Revenue' : 'Avg per Session'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalRevenue" 
                    stackId="1"
                    stroke="#16a34a" 
                    fill="#22c55e"
                    fillOpacity={0.6}
                    animationDuration={1000}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgRevenue" 
                    stackId="2"
                    stroke="#059669" 
                    fill="#10b981"
                    fillOpacity={0.4}
                    animationDuration={1200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case 'fillRate':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Trainer Fill Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.fillRateData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#c2410c' }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 10, fill: '#c2410c' }}
                      width={100}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value.toFixed(1)}%`, 'Fill Rate']}
                    />
                    <Bar 
                      dataKey="fillRate" 
                      fill="#f97316"
                      radius={[0, 4, 4, 0]}
                      animationDuration={800}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
              <CardHeader>
                <CardTitle className="text-cyan-800 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Fill Rate Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={chartData.fillRateData.slice(0, 5)}>
                    <RadialBar
                      label={{ position: 'insideStart', fill: '#fff' }}
                      background
                      dataKey="fillRate"
                      fill="#06b6d4"
                      animationDuration={1500}
                    />
                    <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Fill Rate']} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );

      case 'trends':
        return (
          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData.trendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="monthName" 
                    tick={{ fontSize: 12, fill: '#475569' }}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#475569' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="totalAttendance" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    name="Total Checked In"
                    animationDuration={1000}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="totalRevenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                    name="Total Revenue"
                    animationDuration={1200}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="fillRate" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                    name="Fill Rate %"
                    animationDuration={1400}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          Interactive Performance Charts
        </CardTitle>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { key: 'attendance', label: 'Attendance', icon: Users, color: 'blue' },
            { key: 'revenue', label: 'Revenue', icon: TrendingUp, color: 'green' },
            { key: 'fillRate', label: 'Fill Rates', icon: Target, color: 'orange' },
            { key: 'trends', label: 'Trends', icon: Calendar, color: 'purple' }
          ].map(({ key, label, icon: Icon, color }) => (
            <Button
              key={key}
              variant={selectedChart === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedChart(key as ChartType)}
              className={cn(
                "flex items-center gap-2",
                selectedChart === key 
                  ? `bg-${color}-600 hover:bg-${color}-700` 
                  : `hover:bg-${color}-50 hover:border-${color}-200`
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="animate-fade-in">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};
