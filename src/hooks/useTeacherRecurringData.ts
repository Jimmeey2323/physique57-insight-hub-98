
import { useState, useEffect } from 'react';

export interface TeacherRecurringData {
  trainerId: string;
  firstName: string;
  lastName: string;
  trainer: string;
  sessionId: string;
  sessionName: string;
  capacity: number;
  checkedIn: number;
  lateCancelled: number;
  booked: number;
  complimentary: number;
  location: string;
  date: string;
  day: string;
  time: string;
  revenue: number;
  nonPaid: number;
  uniqueId1: string;
  uniqueId2: string;
  memberships: number;
  packages: number;
  introOffers: number;
  singleClasses: number;
  type: string;
  class: string;
  classes: number;
  totalSessions: number;
  emptySessions: number;
  nonEmptySessions: number;
  totalCheckedInSum: number;
  totalCapacitySum: number;
  totalRevenueSum: number;
  classAvgInclEmpty: number;
  classAvgExclEmpty: number;
  fillRate: string;
  weightedAverage: number;
}

const GOOGLE_CONFIG = {
  CLIENT_ID: "416630995185-g7b0fm679lb4p45p5lou070cqscaalaf.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//0gT2uoYBlNdGXCgYIARAAGBASNwF-L9IrBK_ijYwpce6-TdqDfji4GxYuc4uxIBKasdgoZBPm-tu_EU0xS34cNirqfLgXbJ8_NMk",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

const SPREADSHEET_ID = "149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI";

export const useTeacherRecurringData = () => {
  const [data, setData] = useState<TeacherRecurringData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = async () => {
    try {
      const response = await fetch(GOOGLE_CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CONFIG.CLIENT_ID,
          client_secret: GOOGLE_CONFIG.CLIENT_SECRET,
          refresh_token: GOOGLE_CONFIG.REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      });

      const tokenData = await response.json();
      return tokenData.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };

  const parseNumericValue = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (!value || value === '') return 0;
    
    const cleaned = value.toString().replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const fetchTeacherRecurringData = async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Teacher Recurring?alt=json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch teacher recurring data');
      }

      const result = await response.json();
      const rows = result.values || [];
      
      if (rows.length < 2) {
        setData([]);
        return;
      }

      const recurringData: TeacherRecurringData[] = rows.slice(1).map((row: any[]) => ({
        trainerId: row[0] || '',
        firstName: row[1] || '',
        lastName: row[2] || '',
        trainer: row[3] || '',
        sessionId: row[4] || '',
        sessionName: row[5] || '',
        capacity: parseNumericValue(row[6]),
        checkedIn: parseNumericValue(row[7]),
        lateCancelled: parseNumericValue(row[8]),
        booked: parseNumericValue(row[9]),
        complimentary: parseNumericValue(row[10]),
        location: row[11] || '',
        date: row[12] || '',
        day: row[13] || '',
        time: row[14] || '',
        revenue: parseNumericValue(row[15]),
        nonPaid: parseNumericValue(row[16]),
        uniqueId1: row[17] || '',
        uniqueId2: row[18] || '',
        memberships: parseNumericValue(row[19]),
        packages: parseNumericValue(row[20]),
        introOffers: parseNumericValue(row[21]),
        singleClasses: parseNumericValue(row[22]),
        type: row[23] || '',
        class: row[24] || '',
        classes: parseNumericValue(row[25]),
        totalSessions: parseNumericValue(row[26]),
        emptySessions: parseNumericValue(row[27]),
        nonEmptySessions: parseNumericValue(row[28]),
        totalCheckedInSum: parseNumericValue(row[29]),
        totalCapacitySum: parseNumericValue(row[30]),
        totalRevenueSum: parseNumericValue(row[31]),
        classAvgInclEmpty: parseNumericValue(row[32]),
        classAvgExclEmpty: parseNumericValue(row[33]),
        fillRate: row[34] || '',
        weightedAverage: parseNumericValue(row[35])
      }));

      setData(recurringData);
      setError(null);
    } catch (err) {
      console.error('Error fetching teacher recurring data:', err);
      setError('Failed to load teacher recurring data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherRecurringData();
  }, []);

  return { data, loading, error, refetch: fetchTeacherRecurringData };
};
