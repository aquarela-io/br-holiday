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

// Store static data outside of the class to avoid memory bloat
const STATIC_HOLIDAYS: Readonly<Record<number, Holiday[]>> = Object.freeze({
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
    },
    {
      "date": "2024-12-25",
      "name": "Natal",
      "type": "national"
    }
  ],
  "2025": [
    {
      "date": "2025-01-01",
      "name": "Test Holiday 1",
      "type": "national"
    },
    {
      "date": "2025-12-25",
      "name": "Test Holiday 2",
      "type": "national"
    }
  ],
  "2026": [
    {
      "date": "2026-01-01",
      "name": "Test Holiday 1",
      "type": "national"
    },
    {
      "date": "2026-12-25",
      "name": "Test Holiday 2",
      "type": "national"
    }
  ]
});

// Global cache with TTL to prevent unbounded growth
interface CacheEntry {
  data: Holiday[];
  timestamp: number;
}

const API_CACHE = new Map<number, CacheEntry>();
const CACHE_TTL_FUTURE = 1000 * 60 * 60 * 24 * 30; // 30 days for future years
const CACHE_TTL_CURRENT = 1000 * 60 * 60 * 24 * 7; // 7 days for current year
// Past years are cached indefinitely since they won't change

// Cache size limits
const CACHE_MAX_SIZE = 100;
const CACHE_CLEANUP_TARGET = 80;
const CACHE_IMMEDIATE_CLEANUP_THRESHOLD = 50;
const CACHE_IMMEDIATE_CLEANUP_TARGET = 30;

// Time intervals
const CACHE_CLEANUP_INTERVAL = 1000 * 60 * 60 * 24; // 24 hours

// Date handling
const YEAR_PRESERVATION_WINDOW = 2; // Years to preserve around current year
const YEAR_START_INDEX = 0;
const YEAR_LENGTH = 4;

// Clean up old cache entries periodically
let cacheCleanupTimer: NodeJS.Timeout | null = null;

function getCacheTTL(year: number): number | null {
  const currentYear = new Date().getFullYear();
  
  if (year < currentYear) {
    // Past years: cache indefinitely
    return null;
  } else if (year === currentYear) {
    // Current year: cache for 7 days
    return CACHE_TTL_CURRENT;
  } else {
    // Future years: cache for 30 days
    return CACHE_TTL_FUTURE;
  }
}

/**
 * Reduces cache size by removing oldest entries
 * @param maxSize - Maximum allowed cache size
 * @param targetSize - Target size after cleanup
 * @param preserveRecentYears - If true, preserves entries within YEAR_PRESERVATION_WINDOW years of current year
 */
function reduceCacheSize(maxSize: number, targetSize: number, preserveRecentYears: boolean = false) {
  if (API_CACHE.size <= maxSize) {
    return;
  }

  const entries = Array.from(API_CACHE.entries());
  
  // Sort by timestamp (oldest first)
  entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
  
  while (API_CACHE.size > targetSize && entries.length > 0) {
    const [year] = entries.shift()!;
    
    if (preserveRecentYears) {
      const currentYear = new Date().getFullYear();
      // Only remove if it's not a commonly used year
      if (Math.abs(year - currentYear) > YEAR_PRESERVATION_WINDOW) {
        API_CACHE.delete(year);
      }
    } else {
      API_CACHE.delete(year);
    }
  }
}

function startCacheCleanup() {
  if (!cacheCleanupTimer) {
    // Run cleanup every 24 hours
    cacheCleanupTimer = setInterval(() => {
      const now = Date.now();
      
      for (const [year, entry] of API_CACHE.entries()) {
        const ttl = getCacheTTL(year);
        
        // Only clean up entries that have a TTL (not past years)
        if (ttl !== null && now - entry.timestamp > ttl) {
          API_CACHE.delete(year);
        }
      }
      
      // Reduce cache size if needed, preserving recent years
      reduceCacheSize(CACHE_MAX_SIZE, CACHE_CLEANUP_TARGET, true);
    }, CACHE_CLEANUP_INTERVAL); // Run every 24 hours
    
    // Allow process to exit even if timer is active
    if (cacheCleanupTimer.unref) {
      cacheCleanupTimer.unref();
    }
  }
}

/**
 * Brazilian Holiday handler that provides methods to check and retrieve holiday information.
 *
 * Features:
 * - Static data fallback for recent years (varies based on build)
 * - Live API integration with Brasil API (https://brasilapi.com.br)
 * - Date validation and error handling
 * - Memory-efficient caching with TTL
 *
 * Usage:
 * ```typescript
 * // Default mode (uses static data when available)
 * const holidays = new BRHoliday();
 *
 * // Live-only mode (always uses API)
 * const liveHolidays = new BRHoliday({ skipStatic: true });
 * ```
 *
 * @implements {HolidayHandler}
 */
export class BRHoliday implements HolidayHandler {
  /** Whether to bypass static data and always use the API */
  private skipStatic: boolean;

  /**
   * Creates a new BRHoliday instance.
   *
   * @param options - Configuration options
   * @param options.skipStatic - If true, always uses the API instead of static data
   */
  constructor(options?: { skipStatic?: boolean }) {
    this.skipStatic = options?.skipStatic ?? false;
    
    // Start cache cleanup timer
    startCacheCleanup();
  }

  /**
   * Retrieves all holidays for a specific year.
   * First attempts to use static data (if available and not in live-only mode),
   * then falls back to the API with caching.
   *
   * @param year - The year to get holidays for
   * @returns Promise resolving to an array of holidays
   */
  async getHolidays(year: number): Promise<Holiday[]> {
    // Check static data first
    if (!this.skipStatic && STATIC_HOLIDAYS[year]) {
      // Return a copy to prevent external modifications
      return [...STATIC_HOLIDAYS[year]];
    }

    // Check cache
    const cached = API_CACHE.get(year);
    const ttl = getCacheTTL(year);

    if (cached) {
      // If TTL is null (past years), always return from cache
      // Otherwise check if cache is still valid
      if (ttl === null || Date.now() - cached.timestamp < ttl) {
        return [...cached.data];
      }
    }

    // Fetch from API
    try {
      const response = await fetch(
        `https://brasilapi.com.br/api/feriados/v1/${year}`
      );
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      API_CACHE.set(year, {
        data,
        timestamp: Date.now()
      });
      
      // Limit cache size to prevent unbounded growth
      reduceCacheSize(CACHE_IMMEDIATE_CLEANUP_THRESHOLD, CACHE_IMMEDIATE_CLEANUP_TARGET);
      
      return data;
    } catch (error) {
      // Clear invalid cache entry
      API_CACHE.delete(year);
      throw error;
    }
  }

  /**
   * Checks if a specific date is a holiday.
   * Uses optimized lookup for static data to avoid array allocation.
   *
   * @param date - The date to check in YYYY-MM-DD format
   * @returns Promise resolving to true if the date is a holiday, false otherwise
   * @throws {Error} If the date format is invalid
   */
  async isHoliday(date: string): Promise<boolean> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    const year = parseInt(date.substring(YEAR_START_INDEX, YEAR_LENGTH), 10);
    
    // Optimized check for static data
    if (!this.skipStatic && STATIC_HOLIDAYS[year]) {
      const holidays = STATIC_HOLIDAYS[year];
      for (let i = 0; i < holidays.length; i++) {
        if (holidays[i].date === date) {
          return true;
        }
      }
      return false;
    }

    // Fall back to getHolidays for API data
    const holidays = await this.getHolidays(year);
    for (let i = 0; i < holidays.length; i++) {
      if (holidays[i].date === date) {
        return true;
      }
    }
    return false;
  }
}

// Clean up on process exit
if (typeof process !== 'undefined' && process.on) {
  process.on('exit', () => {
    if (cacheCleanupTimer) {
      clearInterval(cacheCleanupTimer);
      cacheCleanupTimer = null;
    }
    API_CACHE.clear();
  });
}
