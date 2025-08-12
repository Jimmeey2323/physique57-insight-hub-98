import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TeacherRecurringData } from '@/hooks/useTeacherRecurringData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, RadialBarChart, RadialBar
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface RecurringClassAnimatedChartsProps {
  data: TeacherRecurringData[];
}

type ChartType = 'trends' | 'distribution' | 'performance' | 'comparison';

export const RecurringClassAnimatedCharts: React.FC<RecurringClassAnimatedChartsProps> = ({
  data
}) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('trends');

  // Process data for trend analysis (monthly)
  const trendData = useMemo(() => {
    const monthlyData: Record<string, any> = {};
    
    data.forEach(item => {
      const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          sessions: 0,
          attendance: 0,
          revenue: 0,
          capacity: 0,
          emptySessions: 0
        };
      }
      
      monthlyData[month].sessions += 1;
      monthlyData[month].attendance += item.checkedIn;
      monthlyData[month].revenue += item.revenue;
      monthlyData[month].capacity += item.capacity;
      monthlyData[month].emptySessions += item.emptySessions;
    });

    return Object.values(monthlyData)
      .map((month: any) => ({
        ...month,
        fillRate: month.capacity > 0 ? (month.attendance / month.capacity) * 100 : 0,
        avgAttendance: month.sessions > 0 ? month.attendance / month.sessions : 0
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [data]);

  // Process data for class format distribution
  const formatDistribution = useMemo(() => {
    const formatData: Record<string, any> = {};
    
    data.forEach(item => {
      if (!formatData[item.class]) {
        formatData[item.class] = {
          name: item.class,
          sessions: 0,
          attendance: 0,
          revenue: 0,
          capacity: 0
        };
      }
      
      formatData[item.class].sessions += 1;
      formatData[item.class].attendance += item.checkedIn;
      formatData[item.class].revenue += item.revenue;
      formatData[item.class].capacity += item.capacity;
    });

    return Object.values(formatData).map((format: any) => ({
      ...format,
      fillRate: format.capacity > 0 ? (format.attendance / format.capacity) * 100 : 0
    }));
  }, [data]);

  // Process data for trainer performance
  const trainerPerformance = useMemo(() => {
    const trainerData: Record<string, any> = {};
    
    data.forEach(item => {
      if (!trainerData[item.trainer]) {
        trainerData[item.trainer] = {
          name: item.trainer,
          sessions: 0,
          attendance: 0,
          revenue: 0,
          capacity: 0,
          emptySessions: 0
        };
      }
      
      trainerData[item.trainer].sessions += 1;
      trainerData[item.trainer].attendance += item.checkedIn;
      trainerData[item.trainer].revenue += item.revenue;
      trainerData[item.trainer].capacity += item.capacity;
      trainerData[item.trainer].emptySessions += item.emptySessions;
    });

    return Object.values(trainerData)
      .map((trainer: any) => ({
        ...trainer,
        fillRate: trainer.capacity > 0 ? (trainer.attendance / trainer.capacity) * 100 : 0,
        avgAttendance: trainer.sessions > 0 ? trainer.attendance / trainer.sessions : 0,
        revenuePerSession: trainer.sessions > 0 ? trainer.revenue / trainer.sessions : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [data]);

  // Time slot comparison
  const timeSlotData = useMemo(() => {
    const timeSlots: Record<string, any> = {};
    
    data.forEach(item => {
      const hour = parseInt(item.time.split(':')[0]);
      let timeSlot: string;
      
      if (hour < 8) timeSlot = 'Early Morning';
      else if (hour < 12) timeSlot = 'Morning';
      else if (hour < 17) timeSlot = 'Afternoon';
      else if (hour < 21) timeSlot = 'Evening';
      else timeSlot = 'Night';
      
      if (!timeSlots[timeSlot]) {
        timeSlots[timeSlot] = {
          timeSlot,
          sessions: 0,
          attendance: 0,
          capacity: 0,
          revenue: 0
        };
      }
      
      timeSlots[timeSlot].sessions += 1;
      timeSlots[timeSlot].attendance += item.checkedIn;
      timeSlots[timeSlot].capacity += item.capacity;
      timeSlots[timeSlot].revenue += item.revenue;
    });

    return Object.values(timeSlots).map((slot: any) => ({
      ...slot,
      fillRate: slot.capacity > 0 ? (slot.attendance / slot.capacity) * 100 : 0
    }));
  }, [data]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {
                entry.dataKey === 'revenue' ? formatCurrency(entry.value) :
                entry.dataKey === 'fillRate' ? `${entry.value.toFixed(1)}%` :
                formatNumber(entry.value)
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (selectedChart) {
      case 'trends':
        return (
          <div className="space-y-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="attendance"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorAttendance)"
                    animationDuration={1500}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="fillRate" 
                    stroke="#ff7300" 
                    strokeWidth={3}
                    dot={{ fill: '#ff7300', strokeWidth: 2, r: 6 }}
                    animationDuration={2000}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgAttendance" 
                    stroke="#8dd1e1" 
                    strokeWidth={3}
                    dot={{ fill: '#8dd1e1', strokeWidth: 2, r: 6 }}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'distribution':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80">
              <h4 className="text-lg font-semibold mb-4 text-center">Class Format Distribution</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formatDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sessions"
                    animationDuration={1500}
                    animationBegin={0}
                  >
                    {formatDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="h-80">
              <h4 className="text-lg font-semibold mb-4 text-center">Time Slot Performance</h4>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={timeSlotData}>
                  <RadialBar
                    label={{ position: 'insideStart', fill: '#fff' }}
                    background
                    clockWise
                    dataKey="fillRate"
                    fill="#8884d8"
                    animationDuration={2000}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainerPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  yAxisId="left"
                  dataKey="attendance" 
                  fill="#8884d8"
                  animationDuration={1500}
                  animationBegin={0}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="revenue" 
                  fill="#82ca9d"
                  animationDuration={1500}
                  animationBegin={300}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'comparison':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80">
              <h4 className="text-lg font-semibold mb-4 text-center">Fill Rate by Format</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="fillRate" 
                    fill="#ffc658"
                    animationDuration={2000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-80">
              <h4 className="text-lg font-semibold mb-4 text-center">Revenue per Session</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trainerPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="revenuePerSession" 
                    fill="#ff7300"
                    animationDuration={2000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          Advanced Analytics Charts
        </CardTitle>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { key: 'trends', label: 'Trends', icon: TrendingUp },
            { key: 'distribution', label: 'Distribution', icon: PieChartIcon },
            { key: 'performance', label: 'Performance', icon: BarChart3 },
            { key: 'comparison', label: 'Comparison', icon: Activity }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={selectedChart === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedChart(key as ChartType)}
              className={`flex items-center gap-2 ${
                selectedChart === key 
                  ? "bg-indigo-600 hover:bg-indigo-700" 
                  : "hover:bg-indigo-50"
              }`}
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
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{formatNumber(data.length)}</div>
            <div className="text-sm text-blue-700">Total Sessions</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(data.reduce((sum, item) => sum + item.checkedIn, 0))}
            </div>
            <div className="text-sm text-green-700">Total Attendance</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
            </div>
            <div className="text-sm text-purple-700">Total Revenue</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {((data.reduce((sum, item) => sum + item.checkedIn, 0) / 
                 data.reduce((sum, item) => sum + item.capacity, 0)) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-orange-700">Avg Fill Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
