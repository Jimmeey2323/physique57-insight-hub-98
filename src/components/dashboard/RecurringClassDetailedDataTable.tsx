
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Search, Download, Users, MapPin, Clock, Calendar, Target, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';
import { TeacherRecurringData } from '@/hooks/useTeacherRecurringData';

interface RecurringClassDetailedDataTableProps {
  data: TeacherRecurringData[];
  title?: string;
}

export const RecurringClassDetailedDataTable: React.FC<RecurringClassDetailedDataTableProps> = ({
  data,
  title = "Recurring Class Performance Data"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        item.trainer?.toLowerCase().includes(searchLower) ||
        item.sessionName?.toLowerCase().includes(searchLower) ||
        item.location?.toLowerCase().includes(searchLower) ||
        item.type?.toLowerCase().includes(searchLower) ||
        item.class?.toLowerCase().includes(searchLower)
      );
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof TeacherRecurringData];
      let bValue: any = b[sortField as keyof TeacherRecurringData];

      // Handle numeric fields
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Trainer',
      'Session Name',
      'Location',
      'Date',
      'Day',
      'Time',
      'Capacity',
      'Checked In',
      'Booked',
      'Fill Rate',
      'Revenue',
      'Class Type',
      'Class Average'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredAndSortedData.map(item => [
        `"${item.trainer}"`,
        `"${item.sessionName}"`,
        `"${item.location}"`,
        `"${item.date}"`,
        `"${item.day}"`,
        `"${item.time}"`,
        item.capacity,
        item.checkedIn,
        item.booked,
        `"${item.fillRate}"`,
        item.revenue,
        `"${item.type}"`,
        item.classAvgExclEmpty
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `recurring-class-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      key: 'trainer',
      header: 'Trainer Details',
      render: (value: string, item: TeacherRecurringData) => (
        <div className="space-y-1">
          <div className="font-semibold text-slate-900">{value || 'Unknown'}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(item.date)}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {item.location || 'No location'}
          </div>
        </div>
      ),
      className: 'min-w-[200px]',
      sortable: true
    },
    {
      key: 'sessionName',
      header: 'Session Info',
      render: (value: string, item: TeacherRecurringData) => (
        <div className="space-y-1">
          <div className="font-medium text-slate-800 text-sm">{value}</div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
              {item.type}
            </Badge>
            {item.class && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                {item.class}
              </Badge>
            )}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {item.day} {item.time}
          </div>
        </div>
      ),
      className: 'min-w-[250px]',
      sortable: true
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (value: number) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-800">{formatNumber(value)}</div>
          <div className="text-xs text-slate-500">spots</div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'checkedIn',
      header: 'Attendance',
      render: (value: number, item: TeacherRecurringData) => (
        <div className="space-y-1">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-700 flex items-center justify-center gap-1">
              <Users className="w-4 h-4" />
              {formatNumber(value)}
            </div>
            <div className="text-xs text-slate-500">checked in</div>
          </div>
          {item.booked !== value && (
            <div className="text-xs text-slate-500 text-center">
              {formatNumber(item.booked)} booked
            </div>
          )}
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'fillRate',
      header: 'Fill Rate',
      render: (value: string, item: TeacherRecurringData) => {
        const fillPercentage = parseFloat(value.replace('%', '')) || 0;
        const getColorClass = (percentage: number) => {
          if (percentage >= 80) return 'text-green-700 bg-green-50 border-green-200';
          if (percentage >= 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
          if (percentage >= 40) return 'text-orange-700 bg-orange-50 border-orange-200';
          return 'text-red-700 bg-red-50 border-red-200';
        };
        
        return (
          <div className="text-center space-y-1">
            <Badge className={`text-sm font-semibold ${getColorClass(fillPercentage)}`}>
              <Target className="w-3 h-3 mr-1" />
              {value}
            </Badge>
            <div className="text-xs text-slate-500">
              {formatNumber(item.checkedIn)}/{formatNumber(item.capacity)}
            </div>
          </div>
        );
      },
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (value: number) => (
        <div className="text-center space-y-1">
          <div className="text-lg font-semibold text-purple-700 flex items-center justify-center gap-1">
            <DollarSign className="w-4 h-4" />
            {formatCurrency(value)}
          </div>
          <div className="text-xs text-slate-500">session revenue</div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'classAvgExclEmpty',
      header: 'Class Average',
      render: (value: number, item: TeacherRecurringData) => (
        <div className="text-center space-y-1">
          <div className="text-lg font-semibold text-indigo-700">{value.toFixed(1)}</div>
          <div className="text-xs text-slate-500">avg attendees</div>
          {item.classAvgInclEmpty !== value && (
            <div className="text-xs text-slate-400">
              {item.classAvgInclEmpty.toFixed(1)} (incl empty)
            </div>
          )}
        </div>
      ),
      align: 'center' as const,
      sortable: true
    }
  ];

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            {title}
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search classes, trainers, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-80 bg-white border-gray-200"
              />
            </div>
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="gap-2 text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {formatNumber(filteredAndSortedData.length)} sessions
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {formatNumber(filteredAndSortedData.reduce((sum, item) => sum + item.checkedIn, 0))} total attendance
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {formatCurrency(filteredAndSortedData.reduce((sum, item) => sum + item.revenue, 0))} total revenue
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ModernDataTable
          data={filteredAndSortedData}
          columns={columns}
          headerGradient="from-blue-600 to-blue-700"
          maxHeight="600px"
          stickyHeader
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </CardContent>
    </Card>
  );
};
