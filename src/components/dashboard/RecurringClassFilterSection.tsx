import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TeacherRecurringData } from '@/hooks/useTeacherRecurringData';
import { RecurringClassFilterOptions } from '@/types/recurringClass';
import { Filter, ChevronDown, ChevronUp, Search, X, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecurringClassFilterSectionProps {
  data: TeacherRecurringData[];
  onFiltersChange: (filters: RecurringClassFilterOptions) => void;
  className?: string;
}

export const RecurringClassFilterSection: React.FC<RecurringClassFilterSectionProps> = ({
  data,
  onFiltersChange,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters] = useState<RecurringClassFilterOptions>({
    dateRange: { start: '', end: '' },
    location: [],
    trainer: [],
    classType: [],
    dayOfWeek: [],
    timeSlot: [],
    minCapacity: undefined,
    maxCapacity: undefined,
    minFillRate: undefined,
    maxFillRate: undefined,
    minRevenue: undefined,
    maxRevenue: undefined,
    showEmptyOnly: false,
    showProblematicOnly: false
  });

  // Extract unique values from data
  const uniqueLocations = Array.from(new Set(data.map(item => item.location))).sort();
  const uniqueTrainers = Array.from(new Set(data.map(item => item.trainer))).sort();
  const uniqueClassTypes = Array.from(new Set(data.map(item => item.class))).sort();
  const uniqueDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['Early Morning', 'Morning', 'Afternoon', 'Evening', 'Night'];

  // Filter options based on search term
  const filteredLocations = uniqueLocations.filter(loc => 
    loc.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredTrainers = uniqueTrainers.filter(trainer => 
    trainer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredClassTypes = uniqueClassTypes.filter(classType => 
    classType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleArrayFilterChange = (
    key: keyof Pick<RecurringClassFilterOptions, 'location' | 'trainer' | 'classType' | 'dayOfWeek' | 'timeSlot'>,
    value: string,
    checked: boolean
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...prev[key], value]
        : prev[key].filter(item => item !== value)
    }));
  };

  const handleNumberFilterChange = (
    key: keyof Pick<RecurringClassFilterOptions, 'minCapacity' | 'maxCapacity' | 'minFillRate' | 'maxFillRate' | 'minRevenue' | 'maxRevenue'>,
    value: string
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : Number(value)
    }));
  };

  const handleBooleanFilterChange = (
    key: keyof Pick<RecurringClassFilterOptions, 'showEmptyOnly' | 'showProblematicOnly'>,
    checked: boolean
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      location: [],
      trainer: [],
      classType: [],
      dayOfWeek: [],
      timeSlot: [],
      minCapacity: undefined,
      maxCapacity: undefined,
      minFillRate: undefined,
      maxFillRate: undefined,
      minRevenue: undefined,
      maxRevenue: undefined,
      showEmptyOnly: false,
      showProblematicOnly: false
    });
    setSearchTerm('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    count += filters.location.length;
    count += filters.trainer.length;
    count += filters.classType.length;
    count += filters.dayOfWeek.length;
    count += filters.timeSlot.length;
    if (filters.minCapacity !== undefined) count++;
    if (filters.maxCapacity !== undefined) count++;
    if (filters.minFillRate !== undefined) count++;
    if (filters.maxFillRate !== undefined) count++;
    if (filters.minRevenue !== undefined) count++;
    if (filters.maxRevenue !== undefined) count++;
    if (filters.showEmptyOnly) count++;
    if (filters.showProblematicOnly) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className={cn("bg-white shadow-lg border-0", className)}>
      <CardHeader 
        className="cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-slate-800">Comprehensive Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAllFilters();
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
                Clear All
              </Button>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            )}
          </div>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search trainers, locations, or class types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Date Range */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Calendar className="w-4 h-4" />
                Date Range
              </Label>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="text-sm"
                />
                <Input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MapPin className="w-4 h-4" />
                Locations ({filters.location.length})
              </Label>
              <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                {filteredLocations.map(location => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={filters.location.includes(location)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('location', location, checked as boolean)
                      }
                    />
                    <Label htmlFor={`location-${location}`} className="text-sm cursor-pointer">
                      {location}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Trainer Filter */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Users className="w-4 h-4" />
                Trainers ({filters.trainer.length})
              </Label>
              <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                {filteredTrainers.map(trainer => (
                  <div key={trainer} className="flex items-center space-x-2">
                    <Checkbox
                      id={`trainer-${trainer}`}
                      checked={filters.trainer.includes(trainer)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('trainer', trainer, checked as boolean)
                      }
                    />
                    <Label htmlFor={`trainer-${trainer}`} className="text-sm cursor-pointer">
                      {trainer}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Class Type Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">
                Class Types ({filters.classType.length})
              </Label>
              <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                {filteredClassTypes.map(classType => (
                  <div key={classType} className="flex items-center space-x-2">
                    <Checkbox
                      id={`class-${classType}`}
                      checked={filters.classType.includes(classType)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('classType', classType, checked as boolean)
                      }
                    />
                    <Label htmlFor={`class-${classType}`} className="text-sm cursor-pointer">
                      {classType}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Day of Week Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">
                Days of Week ({filters.dayOfWeek.length})
              </Label>
              <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                {uniqueDays.map(day => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={filters.dayOfWeek.includes(day)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('dayOfWeek', day, checked as boolean)
                      }
                    />
                    <Label htmlFor={`day-${day}`} className="text-sm cursor-pointer">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Slot Filter */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock className="w-4 h-4" />
                Time Slots ({filters.timeSlot.length})
              </Label>
              <div className="space-y-2">
                {timeSlots.map(slot => (
                  <div key={slot} className="flex items-center space-x-2">
                    <Checkbox
                      id={`time-${slot}`}
                      checked={filters.timeSlot.includes(slot)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('timeSlot', slot, checked as boolean)
                      }
                    />
                    <Label htmlFor={`time-${slot}`} className="text-sm cursor-pointer">
                      {slot}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Numeric Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Capacity Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minCapacity || ''}
                  onChange={(e) => handleNumberFilterChange('minCapacity', e.target.value)}
                  className="text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxCapacity || ''}
                  onChange={(e) => handleNumberFilterChange('maxCapacity', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Fill Rate % Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min %"
                  value={filters.minFillRate || ''}
                  onChange={(e) => handleNumberFilterChange('minFillRate', e.target.value)}
                  className="text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max %"
                  value={filters.maxFillRate || ''}
                  onChange={(e) => handleNumberFilterChange('maxFillRate', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Revenue Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minRevenue || ''}
                  onChange={(e) => handleNumberFilterChange('minRevenue', e.target.value)}
                  className="text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxRevenue || ''}
                  onChange={(e) => handleNumberFilterChange('maxRevenue', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Special Filters */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="empty-only"
                checked={filters.showEmptyOnly}
                onCheckedChange={(checked) => 
                  handleBooleanFilterChange('showEmptyOnly', checked as boolean)
                }
              />
              <Label htmlFor="empty-only" className="text-sm cursor-pointer font-medium">
                Show Empty Sessions Only
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="problematic-only"
                checked={filters.showProblematicOnly}
                onCheckedChange={(checked) => 
                  handleBooleanFilterChange('showProblematicOnly', checked as boolean)
                }
              />
              <Label htmlFor="problematic-only" className="text-sm cursor-pointer font-medium">
                Show Problematic Sessions Only
              </Label>
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Active Filters ({activeFilterCount}):
              </p>
              <div className="flex flex-wrap gap-2">
                {filters.location.map(loc => (
                  <Badge key={`loc-${loc}`} variant="secondary" className="bg-blue-100 text-blue-800">
                    Location: {loc}
                  </Badge>
                ))}
                {filters.trainer.map(trainer => (
                  <Badge key={`trainer-${trainer}`} variant="secondary" className="bg-green-100 text-green-800">
                    Trainer: {trainer}
                  </Badge>
                ))}
                {filters.classType.map(type => (
                  <Badge key={`class-${type}`} variant="secondary" className="bg-purple-100 text-purple-800">
                    Class: {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
