
import React, { useEffect, useState, useMemo } from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { useTeacherRecurringData } from '@/hooks/useTeacherRecurringData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Calendar, BarChart3, Users, Target, Database, Eye } from 'lucide-react';
import { Footer } from '@/components/ui/footer';
import { SourceDataModal } from '@/components/ui/SourceDataModal';
import { RecurringClassMetricCards } from '@/components/dashboard/RecurringClassMetricCards';
import { RecurringClassLocationSelector } from '@/components/dashboard/RecurringClassLocationSelector';
import { RecurringClassFilterSection } from '@/components/dashboard/RecurringClassFilterSection';
import { RecurringClassMonthOnMonthTable } from '@/components/dashboard/RecurringClassMonthOnMonthTable';
import { RecurringClassYearOnYearTable } from '@/components/dashboard/RecurringClassYearOnYearTable';
import { RecurringClassTopBottomLists } from '@/components/dashboard/RecurringClassTopBottomLists';
import { formatNumber } from '@/utils/formatters';

const ClassAttendance = () => {
  const { data, loading, error } = useTeacherRecurringData();
  const { isLoading, setLoading } = useGlobalLoading();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('month-on-month');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [openSource, setOpenSource] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    location: [] as string[],
    trainer: [] as string[],
    classType: [] as string[],
    dayOfWeek: [] as string[],
    timeSlot: [] as string[],
    minCapacity: undefined as number | undefined,
    maxCapacity: undefined as number | undefined,
    minFillRate: undefined as number | undefined,
    maxFillRate: undefined as number | undefined
  });

  useEffect(() => {
    setLoading(loading, 'Processing recurring class performance analytics...');
  }, [loading, setLoading]);

  // Filter data based on location and other filters
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    let filtered = data;

    // Apply location filter
    if (selectedLocation !== 'all') {
      const locationMappings = {
        'kwality': 'Kwality House, Kemps Corner',
        'supreme': 'Supreme HQ, Bandra',
        'kenkere': 'Kenkere House'
      };
      
      const targetLocation = locationMappings[selectedLocation as keyof typeof locationMappings];
      if (targetLocation) {
        filtered = filtered.filter(item => 
          item.location === targetLocation || 
          item.location?.toLowerCase().includes(targetLocation.toLowerCase())
        );
      }
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.trainer?.toLowerCase().includes(searchLower) ||
        item.sessionName?.toLowerCase().includes(searchLower) ||
        item.location?.toLowerCase().includes(searchLower) ||
        item.type?.toLowerCase().includes(searchLower) ||
        item.class?.toLowerCase().includes(searchLower)
      );
    }

    // Apply other filters
    if (filters.location.length > 0) {
      filtered = filtered.filter(item => filters.location.includes(item.location));
    }

    if (filters.trainer.length > 0) {
      filtered = filtered.filter(item => filters.trainer.includes(item.trainer));
    }

    if (filters.classType.length > 0) {
      filtered = filtered.filter(item => filters.classType.includes(item.type));
    }

    if (filters.dayOfWeek.length > 0) {
      filtered = filtered.filter(item => filters.dayOfWeek.includes(item.day));
    }

    if (filters.dateRange.start || filters.dateRange.end) {
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

      filtered = filtered.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      });
    }

    if (filters.minCapacity !== undefined) {
      filtered = filtered.filter(item => item.capacity >= filters.minCapacity!);
    }

    if (filters.maxCapacity !== undefined) {
      filtered = filtered.filter(item => item.capacity <= filters.maxCapacity!);
    }

    if (filters.minFillRate !== undefined) {
      filtered = filtered.filter(item => {
        const fillRate = parseFloat(item.fillRate.replace('%', '')) || 0;
        return fillRate >= filters.minFillRate!;
      });
    }

    if (filters.maxFillRate !== undefined) {
      filtered = filtered.filter(item => {
        const fillRate = parseFloat(item.fillRate.replace('%', '')) || 0;
        return fillRate <= filters.maxFillRate!;
      });
    }

    return filtered;
  }, [data, selectedLocation, filters, searchTerm]);

  // Calculate header metrics
  const headerMetrics = useMemo(() => {
    const totalClasses = filteredData.length;
    const totalAttendance = filteredData.reduce((sum, item) => sum + item.checkedIn, 0);
    const totalCapacity = filteredData.reduce((sum, item) => sum + item.capacity, 0);
    const avgFillRate = totalCapacity > 0 ? Math.round((totalAttendance / totalCapacity) * 100) : 0;

    return {
      totalClasses: formatNumber(totalClasses),
      totalAttendance: formatNumber(totalAttendance),
      avgFillRate: `${avgFillRate}%`
    };
  }, [filteredData]);

  if (isLoading) {
    return <RefinedLoader subtitle="Processing recurring class performance analytics..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-10 w-24 h-24 bg-indigo-300/20 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-10 left-20 w-40 h-40 bg-purple-300/10 rounded-full animate-pulse delay-500"></div>
        </div>
        
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                size="sm" 
                className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
            </div>
            
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20 animate-fade-in-up">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Recurring Class Analytics</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent animate-fade-in-up delay-200">
                Recurring Class Performance
              </h1>
              
              <p className="text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
                Comprehensive analysis of recurring class performance, trainer effectiveness, and attendance patterns
              </p>
              
              <div className="flex items-center justify-center gap-12 mt-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{headerMetrics.totalClasses}</div>
                  <div className="text-sm text-slate-300 font-medium">Total Classes</div>
                </div>
                <div className="w-px h-16 bg-white/20" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{headerMetrics.totalAttendance}</div>
                  <div className="text-sm text-slate-300 font-medium">Total Attendance</div>
                </div>
                <div className="w-px h-16 bg-white/20" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{headerMetrics.avgFillRate}</div>
                  <div className="text-sm text-slate-300 font-medium">Avg Fill Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Data Source Info */}
        <div className="flex justify-between items-center mb-6 animate-fade-in">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-slate-700">Data Source: Teacher Recurring Sheet</span>
            <Badge variant="outline" className="text-indigo-700 border-indigo-200">
              149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
            onClick={() => setOpenSource(true)}
          >
            <Eye className="w-4 h-4" />
            View Source Data
          </Button>
        </div>

        {/* Location Selector */}
        <div className="mb-8">
          <RecurringClassLocationSelector
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
          />
        </div>

        {/* Filter Section */}
        <div className="mb-8">
          <RecurringClassFilterSection
            data={data || []}
            filters={filters}
            onFiltersChange={setFilters}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isCollapsed={isFiltersCollapsed}
            onToggleCollapse={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
          />
        </div>

        {/* Overview Cards */}
        <div className="mb-8">
          <RecurringClassMetricCards data={filteredData} />
        </div>

        {/* Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1 rounded-xl shadow-sm h-14">
            <TabsTrigger
              value="month-on-month"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
            >
              <Calendar className="w-4 h-4" />
              Month-on-Month
            </TabsTrigger>
            <TabsTrigger
              value="year-on-year"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
            >
              <BarChart3 className="w-4 h-4" />
              Year-on-Year
            </TabsTrigger>
            <TabsTrigger
              value="rankings"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
            >
              <Target className="w-4 h-4" />
              Rankings & Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="month-on-month" className="space-y-8">
            <RecurringClassMonthOnMonthTable data={filteredData} />
          </TabsContent>

          <TabsContent value="year-on-year" className="space-y-8">
            <RecurringClassYearOnYearTable data={filteredData} />
          </TabsContent>

          <TabsContent value="rankings" className="space-y-8">
            <RecurringClassTopBottomLists data={filteredData} />
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />

      {/* Source Data Modal */}
      <SourceDataModal
        open={openSource}
        onOpenChange={setOpenSource}
        sources={[{
          name: 'Teacher Recurring',
          sheetName: 'Teacher Recurring',
          spreadsheetId: '149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI',
          data: data || []
        }]}
      />

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};

export default ClassAttendance;
