
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Filter, RotateCcw, Search, Users, MapPin, User, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { TeacherRecurringData } from '@/hooks/useTeacherRecurringData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface RecurringClassFilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  location: string[];
  trainer: string[];
  classType: string[];
  dayOfWeek: string[];
  timeSlot: string[];
  minCapacity?: number;
  maxCapacity?: number;
  minFillRate?: number;
  maxFillRate?: number;
}

interface RecurringClassFilterSectionProps {
  data: TeacherRecurringData[];
  filters: RecurringClassFilterOptions;
  onFiltersChange: (filters: RecurringClassFilterOptions) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const RecurringClassFilterSection: React.FC<RecurringClassFilterSectionProps> = ({
  data,
  filters,
  onFiltersChange,
  searchTerm,
  onSearchChange,
  isCollapsed,
  onToggleCollapse
}) => {
  // Extract unique values for filter options
  const uniqueLocations = Array.from(new Set(data.map(item => item.location).filter(Boolean)));
  const uniqueTrainers = Array.from(new Set(data.map(item => item.trainer).filter(Boolean)));
  const uniqueClassTypes = Array.from(new Set(data.map(item => item.type).filter(Boolean)));
  const uniqueDaysOfWeek = Array.from(new Set(data.map(item => item.day).filter(Boolean)));
  
  const timeSlots = [
    'Early Morning (6:00-9:00)',
    'Morning (9:00-12:00)',
    'Afternoon (12:00-17:00)',
    'Evening (17:00-20:00)',
    'Night (20:00-23:00)'
  ];

  const handleFilterChange = (filterType: keyof RecurringClassFilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [filterType]: value
    });
  };

  const handleMultiSelectChange = (filterType: 'location' | 'trainer' | 'classType' | 'dayOfWeek' | 'timeSlot', value: string, checked: boolean) => {
    const currentValues = filters[filterType];
    if (checked) {
      handleFilterChange(filterType, [...currentValues, value]);
    } else {
      handleFilterChange(filterType, currentValues.filter(v => v !== value));
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { start: '', end: '' },
      location: [],
      trainer: [],
      classType: [],
      dayOfWeek: [],
      timeSlot: [],
      minCapacity: undefined,
      maxCapacity: undefined,
      minFillRate: undefined,
      maxFillRate: undefined
    });
    onSearchChange('');
  };

  const activeFiltersCount = [
    filters.location.length,
    filters.trainer.length,
    filters.classType.length,
    filters.dayOfWeek.length,
    filters.timeSlot.length,
    filters.dateRange.start ? 1 : 0,
    filters.dateRange.end ? 1 : 0,
    filters.minCapacity ? 1 : 0,
    filters.maxCapacity ? 1 : 0,
    filters.minFillRate ? 1 : 0,
    filters.maxFillRate ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  return (
    <Card className="bg-gradient-to-br from-white via-blue-50/30 to-white border-0 shadow-xl">
      <Collapsible open={!isCollapsed} onOpenChange={() => onToggleCollapse()}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-4 cursor-pointer hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent flex items-center gap-2">
                <Filter className="w-6 h-6 text-blue-600" />
                Advanced Filters & Search
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 ml-2">
                    {activeFiltersCount} active
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {!isCollapsed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilters();
                    }}
                    className="gap-2 text-slate-600 hover:text-slate-800"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear All
                  </Button>
                )}
                {isCollapsed ? (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Classes & Trainers
              </Label>
              <Input
                placeholder="Search by class name, trainer, or location..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">End Date</Label>
                <Input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                  className="bg-white border-slate-200"
                />
              </div>
            </div>

            {/* Multi-select Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-white">
                      {filters.location.length > 0 ? `${filters.location.length} selected` : 'All locations'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 bg-white">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {uniqueLocations.map((location) => (
                        <div key={location} className="flex items-center space-x-2">
                          <Checkbox
                            id={`location-${location}`}
                            checked={filters.location.includes(location)}
                            onCheckedChange={(checked) => handleMultiSelectChange('location', location, !!checked)}
                          />
                          <Label htmlFor={`location-${location}`} className="text-sm">{location}</Label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Trainer Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Trainer
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-white">
                      {filters.trainer.length > 0 ? `${filters.trainer.length} selected` : 'All trainers'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 bg-white">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {uniqueTrainers.map((trainer) => (
                        <div key={trainer} className="flex items-center space-x-2">
                          <Checkbox
                            id={`trainer-${trainer}`}
                            checked={filters.trainer.includes(trainer)}
                            onCheckedChange={(checked) => handleMultiSelectChange('trainer', trainer, !!checked)}
                          />
                          <Label htmlFor={`trainer-${trainer}`} className="text-sm">{trainer}</Label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Class Type Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Class Type
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-white">
                      {filters.classType.length > 0 ? `${filters.classType.length} selected` : 'All types'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 bg-white">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {uniqueClassTypes.map((classType) => (
                        <div key={classType} className="flex items-center space-x-2">
                          <Checkbox
                            id={`classType-${classType}`}
                            checked={filters.classType.includes(classType)}
                            onCheckedChange={(checked) => handleMultiSelectChange('classType', classType, !!checked)}
                          />
                          <Label htmlFor={`classType-${classType}`} className="text-sm">{classType}</Label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Day of Week Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Day of Week
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-white">
                      {filters.dayOfWeek.length > 0 ? `${filters.dayOfWeek.length} selected` : 'All days'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 bg-white">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {uniqueDaysOfWeek.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${day}`}
                            checked={filters.dayOfWeek.includes(day)}
                            onCheckedChange={(checked) => handleMultiSelectChange('dayOfWeek', day, !!checked)}
                          />
                          <Label htmlFor={`day-${day}`} className="text-sm">{day}</Label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Numeric Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Min Capacity</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minCapacity || ''}
                  onChange={(e) => handleFilterChange('minCapacity', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Max Capacity</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={filters.maxCapacity || ''}
                  onChange={(e) => handleFilterChange('maxCapacity', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Min Fill Rate %</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minFillRate || ''}
                  onChange={(e) => handleFilterChange('minFillRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Max Fill Rate %</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={filters.maxFillRate || ''}
                  onChange={(e) => handleFilterChange('maxFillRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="bg-white border-slate-200"
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
