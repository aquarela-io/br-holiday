import { Holiday, APIError } from './types';

export async function fetchHolidaysFromAPI(year: number): Promise<Holiday[]> {
  try {
    const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);
    
    if (!response.ok) {
      throw new APIError(`Failed to fetch holidays for year ${year}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return data.map((holiday: any) => ({
      date: holiday.date,
      name: holiday.name,
      type: holiday.type || 'national'
    }));
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(`Network error fetching holidays for year ${year}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}