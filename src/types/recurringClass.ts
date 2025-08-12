
export interface RecurringClassFilterOptions {
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
  minRevenue?: number;
  maxRevenue?: number;
  showEmptyOnly?: boolean;
  showProblematicOnly?: boolean;
}
