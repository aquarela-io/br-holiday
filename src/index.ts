import { Holiday, InvalidDateError, InvalidYearError } from './types';
import { fetchHolidaysFromAPI } from './api';
import { STATIC_HOLIDAYS } from './static-data';

function normalizeDate(date: Date | string): string {
  let dateObj: Date;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    // Handle YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      dateObj = new Date(date + 'T00:00:00');
    } else {
      // Try to parse ISO or other date strings
      dateObj = new Date(date);
    }
  } else {
    throw new InvalidDateError('Invalid date format. Use Date object, ISO string, or YYYY-MM-DD format');
  }
  
  if (isNaN(dateObj.getTime())) {
    throw new InvalidDateError('Invalid date format. Use Date object, ISO string, or YYYY-MM-DD format');
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export async function getHolidays(year: number): Promise<Holiday[]> {
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new InvalidYearError(`Year must be between 1900 and 2100, got ${year}`);
  }
  
  // Check if we have static data for this year
  if (STATIC_HOLIDAYS[year]) {
    return [...STATIC_HOLIDAYS[year]];
  }
  
  // Fall back to API
  return fetchHolidaysFromAPI(year);
}

export async function isHoliday(date: string | Date): Promise<boolean> {
  const normalizedDate = normalizeDate(date);
  const year = parseInt(normalizedDate.substring(0, 4));
  
  const holidays = await getHolidays(year);
  
  return holidays.some(holiday => holiday.date === normalizedDate);
}

// Export types
export type { Holiday } from './types';