import type { Holiday } from "..";

/**
 * Static holidays data structure for Brazilian holidays.
 *
 * This object is populated during build time by the generate-static-data script,
 * which fetches holiday data for a 5-year range (current year ±2 years).
 * The data is pre-compiled to reduce API calls and provide faster access to
 * commonly requested years.
 *
 * The static data is used as a fallback before making API calls, which helps to:
 * 1. Reduce unnecessary API requests
 * 2. Provide offline capability for common years
 * 3. Improve response times for frequently accessed years
 *
 * @see scripts/generate-static-data.js for the generation process
 *
 * Structure:
 * {
 *   [year: number]: Array<{
 *     date: string;     // YYYY-MM-DD format
 *     name: string;     // Holiday name in Portuguese
 *     type: string;     // Holiday type (e.g., 'national', 'municipal')
 *   }>
 * }
 */
export const staticHolidays: Record<number, Holiday[]> = {};
