
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2 } from 'lucide-react';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionLocationSelectorProps {
  data: NewClientData[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

export const ClientConversionLocationSelector: React.FC<ClientConversionLocationSelectorProps> = ({
  data,
  selectedLocation,
  onLocationChange
}) => {
  const locationCounts = React.useMemo(() => {
    // Use the correct location names as specified
    const mainLocations = ['Kwality House, Kemps Corner', 'Supreme HQ, Bandra', 'Kenkere House, Bengaluru'];
    
    const counts = data.reduce((acc, client) => {
      const location = client.firstVisitLocation || client.homeLocation || 'Unknown';
      if (mainLocations.includes(location)) {
        acc[location] = (acc[location] || 0) + 1;
      } else {
        acc['Other'] = (acc['Other'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalCount = data.length;
    counts['All Locations'] = totalCount;

    return counts;
  }, [data]);

  const locations = [
    { key: 'All Locations', display: 'All Locations' },
    { key: 'Kwality House, Kemps Corner', display: 'Kemps Corner' },
    { key: 'Supreme HQ, Bandra', display: 'Bandra' },
    { key: 'Kenkere House, Bengaluru', display: 'Bengaluru' }
  ];

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Location Analysis</h3>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {locations.map(location => {
            const count = locationCounts[location.key] || 0;
            const isSelected = selectedLocation === location.key;
            
            return (
              <Button
                key={location.key}
                variant={isSelected ? "default" : "outline"}
                onClick={() => onLocationChange(location.key)}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  isSelected 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-0' 
                    : 'hover:bg-blue-50 text-gray-700 border-gray-200 hover:border-blue-300'
                }`}
              >
                <MapPin className="w-4 h-4" />
                {location.display}
                <Badge 
                  variant={isSelected ? "secondary" : "outline"}
                  className={`ml-1 ${
                    isSelected 
                      ? "bg-white/20 text-white border-white/30" 
                      : "text-gray-600 border-gray-300"
                  }`}
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
