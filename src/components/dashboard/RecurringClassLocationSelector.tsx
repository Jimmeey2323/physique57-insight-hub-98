
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Building2 } from 'lucide-react';

const locations = [
  { id: 'all', name: 'All Locations', fullName: 'All Locations' },
  { id: 'kwality', name: 'Kwality House, Kemps Corner', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ, Bandra', fullName: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
];

interface RecurringClassLocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

export const RecurringClassLocationSelector: React.FC<RecurringClassLocationSelectorProps> = ({
  selectedLocation,
  onLocationChange
}) => {
  return (
    <Tabs value={selectedLocation} onValueChange={onLocationChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 p-1 rounded-xl shadow-sm h-16">
        {locations.map((location) => (
          <TabsTrigger
            key={location.id}
            value={location.id}
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
          >
            {location.id === 'all' ? <Building2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            <div className="text-center">
              <div className="font-bold text-xs leading-tight">{location.name}</div>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
