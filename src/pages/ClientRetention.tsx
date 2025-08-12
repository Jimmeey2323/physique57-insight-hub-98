import React, { useEffect, useState } from 'react';
import { useNewClientData } from '@/hooks/useNewClientData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users } from 'lucide-react';
import { Footer } from '@/components/ui/footer';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Target, Users as UsersIcon, Eye, Calendar, Filter, PieChart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { NewClientFilterOptions } from '@/types/dashboard';

// Import enhanced components
import { ClientConversionLocationSelector } from '@/components/dashboard/ClientConversionLocationSelector';
import { EnhancedClientConversionFilterSection } from '@/components/dashboard/EnhancedClientConversionFilterSection';
import { ClientConversionDetailedDataTable } from '@/components/dashboard/ClientConversionDetailedDataTable';
import { EnhancedClientConversionMetrics } from '@/components/dashboard/EnhancedClientConversionMetrics';
import { ClientConversionTopBottomLists } from '@/components/dashboard/ClientConversionTopBottomLists';
import { ClientConversionCharts } from '@/components/dashboard/ClientConversionCharts';
import { ClientConversionMonthOnMonthTable } from '@/components/dashboard/ClientConversionMonthOnMonthTable';
import { ClientConversionYearOnYearTable } from '@/components/dashboard/ClientConversionYearOnYearTable';
import { ClientConversionMembershipTable } from '@/components/dashboard/ClientConversionMembershipTable';
import { ClientConversionEntityTable } from '@/components/dashboard/ClientConversionEntityTable';

const ClientRetention = () => {
  const { data, loading } = useNewClientData();
  const { isLoading, setLoading } = useGlobalLoading();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filters state
  const [filters, setFilters] = useState<NewClientFilterOptions>({
    dateRange: { start: '', end: '' },
    location: [],
    homeLocation: [],
    trainer: [],
    paymentMethod: [],
    retentionStatus: [],
    conversionStatus: [],
    isNew: [],
    minLTV: undefined,
    maxLTV: undefined
  });

  useEffect(() => {
    setLoading(loading, 'Analyzing client conversion and retention patterns...');
  }, [loading, setLoading]);

  // Get unique values for filters (only 3 main locations)
  const uniqueLocations = React.useMemo(() => {
    const mainLocations = ['Kwality House, Kemps Corner', 'Supreme HQ, Bandra', 'Kenkere House, Bengaluru'];
    const locations = new Set<string>();
    data.forEach(client => {
      if (client.firstVisitLocation && mainLocations.includes(client.firstVisitLocation)) {
        locations.add(client.firstVisitLocation);
      }
      if (client.homeLocation && mainLocations.includes(client.homeLocation)) {
        locations.add(client.homeLocation);
      }
    });
    return Array.from(locations).filter(Boolean);
  }, [data]);

  const uniqueTrainers = React.useMemo(() => {
    const trainers = new Set<string>();
    data.forEach(client => {
      if (client.trainerName) trainers.add(client.trainerName);
    });
    return Array.from(trainers).filter(Boolean);
  }, [data]);

  const uniqueMembershipTypes = React.useMemo(() => {
    const memberships = new Set<string>();
    data.forEach(client => {
      if (client.membershipUsed) memberships.add(client.membershipUsed);
    });
    return Array.from(memberships).filter(Boolean);
  }, [data]);

  // Filter data by selected location and filters
  const filteredData = React.useMemo(() => {
    console.log('Filtering data. Total records:', data.length, 'Selected location:', selectedLocation);
    
    let filtered = data;
    
    // Apply location filter
    if (selectedLocation !== 'All Locations') {
      filtered = filtered.filter(client => {
        const clientLocation = client.firstVisitLocation || client.homeLocation || 'Unknown';
        return clientLocation === selectedLocation;
      });
    }
    
    // Apply additional filters
    if (filters.location.length > 0) {
      filtered = filtered.filter(client => 
        filters.location.includes(client.firstVisitLocation || '') ||
        filters.location.includes(client.homeLocation || '')
      );
    }
    
    if (filters.trainer.length > 0) {
      filtered = filtered.filter(client => 
        filters.trainer.includes(client.trainerName || '')
      );
    }

    // Apply other filters
    if (filters.conversionStatus.length > 0) {
      filtered = filtered.filter(client => 
        filters.conversionStatus.includes(client.conversionStatus || '')
      );
    }

    if (filters.retentionStatus.length > 0) {
      filtered = filtered.filter(client => 
        filters.retentionStatus.includes(client.retentionStatus || '')
      );
    }

    if (filters.paymentMethod.length > 0) {
      filtered = filtered.filter(client => 
        filters.paymentMethod.includes(client.paymentMethod || '')
      );
    }

    if (filters.isNew.length > 0) {
      filtered = filtered.filter(client => 
        filters.isNew.includes(client.isNew || '')
      );
    }

    // Apply LTV filters
    if (filters.minLTV !== undefined) {
      filtered = filtered.filter(client => (client.ltv || 0) >= filters.minLTV!);
    }
    if (filters.maxLTV !== undefined) {
      filtered = filtered.filter(client => (client.ltv || 0) <= filters.maxLTV!);
    }
    
    console.log('Filtered data:', filtered.length, 'records');
    return filtered;
  }, [data, selectedLocation, filters]);

  if (isLoading) {
    return <RefinedLoader subtitle="Analyzing client conversion and retention patterns..." />;
  }

  console.log('Rendering ClientRetention with data:', data.length, 'records, filtered:', filteredData.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      {/* Animated Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-900 via-teal-800 to-blue-900 text-white">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-10 w-24 h-24 bg-green-300/20 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-10 left-20 w-40 h-40 bg-teal-300/10 rounded-full animate-pulse delay-500"></div>
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
                <Users className="w-5 h-5" />
                <span className="font-medium">Client Analytics</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-green-100 to-blue-100 bg-clip-text text-transparent animate-fade-in-up delay-200">
                Client Conversion & Retention
              </h1>
              
              <p className="text-xl text-green-100 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
                Comprehensive client acquisition and retention analysis across all customer touchpoints
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          {/* Location Selector */}
          <ClientConversionLocationSelector
            data={data}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
          />

          {/* Enhanced Filter Section */}
          <EnhancedClientConversionFilterSection
            filters={filters}
            onFiltersChange={setFilters}
            locations={uniqueLocations}
            trainers={uniqueTrainers}
            membershipTypes={uniqueMembershipTypes}
          />

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-4">
                <TabsList className="grid w-full grid-cols-7 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger value="overview" className="text-sm font-medium">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="text-sm font-medium">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="charts" className="text-sm font-medium">
                    <PieChart className="w-4 h-4 mr-2" />
                    Charts
                  </TabsTrigger>
                  <TabsTrigger value="monthonmonth" className="text-sm font-medium">
                    <Calendar className="w-4 h-4 mr-2" />
                    Month-on-Month
                  </TabsTrigger>
                  <TabsTrigger value="yearonyear" className="text-sm font-medium">
                    <Calendar className="w-4 h-4 mr-2" />
                    Year-on-Year
                  </TabsTrigger>
                  <TabsTrigger value="memberships" className="text-sm font-medium">
                    <Target className="w-4 h-4 mr-2" />
                    Memberships
                  </TabsTrigger>
                  <TabsTrigger value="detailed" className="text-sm font-medium">
                    <Eye className="w-4 h-4 mr-2" />
                    Detailed View
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>

            <TabsContent value="overview" className="space-y-8">
              <EnhancedClientConversionMetrics data={filteredData} />
              <ClientConversionTopBottomLists data={filteredData} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-8">
              <EnhancedClientConversionMetrics data={filteredData} />
              <ClientConversionEntityTable data={filteredData} />
            </TabsContent>

            <TabsContent value="charts" className="space-y-8">
              <ClientConversionCharts data={filteredData} />
            </TabsContent>

            <TabsContent value="monthonmonth" className="space-y-8">
              <ClientConversionMonthOnMonthTable data={filteredData} />
            </TabsContent>

            <TabsContent value="yearonyear" className="space-y-8">
              <ClientConversionYearOnYearTable data={filteredData} />
            </TabsContent>

            <TabsContent value="memberships" className="space-y-8">
              <ClientConversionMembershipTable data={filteredData} />
            </TabsContent>

            <TabsContent value="detailed" className="space-y-8">
              <ClientConversionDetailedDataTable data={filteredData} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      <Footer />

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

export default ClientRetention;
