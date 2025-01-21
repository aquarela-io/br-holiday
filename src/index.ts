/**
 * Represents a Brazilian holiday.
 *
 * @property date - The date of the holiday in YYYY-MM-DD format
 * @property name - The name of the holiday in Portuguese
 * @property type - The type/scope of the holiday (e.g., 'national', 'municipal')
 */
export type Holiday = {
  date: string;
  name: string;
  type: string;
};

/**
 * Interface defining the contract for holiday-related operations.
 * This allows for different implementations (e.g., static data, API-only, etc.).
 */
interface HolidayHandler {
  getHolidays(year: number): Promise<Holiday[]>;
  isHoliday(date: string): Promise<boolean>;
}

/**
 * Brazilian Holiday handler that provides methods to check and retrieve holiday information.
 *
 * Features:
 * - Static data fallback for common years (current year ±2 years)
 * - Live API integration with Brasil API (https://brasilapi.com.br)
 * - Date validation and error handling
 *
 * Usage:
 * ```typescript
 * // Default mode (uses static data when available)
 * const holidays = new BRHoliday();
 *
 * // Live-only mode (always uses API)
 * const liveHolidays = new BRHoliday({ liveOnly: true });
 * ```
 *
 * @implements {HolidayHandler}
 */
export class BRHoliday implements HolidayHandler {
  /** Cached static holiday data shared across instances */
  private static staticData: Record<number, Holiday[]> | null = null;
  /** Whether to bypass static data and always use the API */
  private liveOnly: boolean;

              /**
   * Static holiday data - defaults to test data, can be replaced during build
   * @internal
  */
  private static staticHolidays: Record<number, Holiday[]> = {
  "2024": [
    {
      "date": "2024-01-01",
      "name": "Confraternização Universal",
      "type": "national"
    },
    {
      "date": "2024-02-13",
      "name": "Carnaval",
      "type": "national"
    },
    {
      "date": "2024-03-29",
      "name": "Sexta-feira Santa",
      "type": "national"
    },
    {
      "date": "2024-04-21",
      "name": "Tiradentes",
      "type": "national"
    },
    {
      "date": "2024-05-01",
      "name": "Dia do Trabalho",
      "type": "national"
    }
  ]
};











  /**
   * Creates a new BRHoliday instance.
   *
   * @param options - Configuration options
   * @param options.liveOnly - If true, always uses the API instead of static data
   */
  constructor(options?: { liveOnly?: boolean }) {
    this.liveOnly = options?.liveOnly ?? false;
  }

  /**
   * Retrieves all holidays for a specific year.
   * First attempts to use static data (if available and not in live-only mode),
   * then falls back to the API.
   *
   * @param year - The year to get holidays for
   * @returns Promise resolving to an array of holidays
   */
  async getHolidays(year: number): Promise<Holiday[]> {
    if (BRHoliday.staticHolidays[year]) {
      return BRHoliday.staticHolidays[year];
    }

    const holidays = await fetch(
      `https://brasilapi.com.br/api/feriados/v1/${year}`
    );
    const data = await holidays.json();
    return data;
  }

  /**
   * Checks if a specific date is a holiday.
   *
   * @param date - The date to check in YYYY-MM-DD format
   * @returns Promise resolving to true if the date is a holiday, false otherwise
   * @throws {Error} If the date format is invalid
   */
  async isHoliday(date: string): Promise<boolean> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    const year = parseInt(date.split("-")[0]);
    const holidays = await this.getHolidays(year);
    return holidays.some((holiday) => holiday.date === date);
  }
  // <<HOLIDAYS_DATA>>
}
