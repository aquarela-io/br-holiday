# br-holiday

A lightweight TypeScript library for checking Brazilian holidays. Simple, fast, and memory-safe.

## Features

- 🚀 **Lightweight**: Simple functions, no classes or singletons
- 📦 **Zero Runtime Dependencies**: Only uses native fetch API
- 🗓️ **Smart Data Strategy**: Static data for current/next year, API fallback for others
- 🔍 **TypeScript Support**: Full type definitions included
- 💾 **Memory Safe**: No global state, caches, or timers

## Installation

```bash
npm install br-holiday
```

## Usage

```typescript
import { getHolidays, isHoliday } from 'br-holiday';

// Get all holidays for a year
const holidays2024 = await getHolidays(2024);
console.log(holidays2024);
// [
//   { date: '2024-01-01', name: 'Confraternização mundial', type: 'national' },
//   { date: '2024-02-13', name: 'Carnaval', type: 'national' },
//   ...
// ]

// Check if a specific date is a holiday
await isHoliday('2024-01-01');                    // true
await isHoliday(new Date('2024-01-01'));          // true
await isHoliday('2024-01-01T00:00:00.000Z');     // true
await isHoliday('2024-01-02');                    // false
```

## API

### `getHolidays(year: number): Promise<Holiday[]>`

Retrieves all holidays for a specific year.

**Parameters:**
- `year`: Year to get holidays for (1900-2100)

**Returns:** Promise resolving to an array of Holiday objects

**Example:**
```typescript
const holidays = await getHolidays(2024);
```

### `isHoliday(date: string | Date): Promise<boolean>`

Checks if a specific date is a Brazilian holiday.

**Parameters:**
- `date`: Date to check. Accepts:
  - Date object
  - ISO string (e.g., "2024-01-01T00:00:00.000Z")
  - Date string in YYYY-MM-DD format (e.g., "2024-01-01")

**Returns:** Promise resolving to `true` if the date is a holiday, `false` otherwise

**Example:**
```typescript
const isNewYear = await isHoliday('2024-01-01'); // true
```

### Types

```typescript
interface Holiday {
  date: string;  // YYYY-MM-DD format
  name: string;  // Holiday name in Portuguese
  type: string;  // Holiday type (e.g., 'national')
}
```

## How It Works

1. **Static Data**: The library includes pre-built holiday data for the current year and next year, providing instant responses without API calls.

2. **API Fallback**: For other years, it fetches data from the [Brasil API](https://brasilapi.com.br/).

3. **No Caching**: Each function call is independent. If you need caching, implement it in your application layer.

## Error Handling

The library throws descriptive errors for invalid inputs:

```typescript
try {
  await isHoliday('invalid-date');
} catch (error) {
  // InvalidDateError: Invalid date format. Use Date object, ISO string, or YYYY-MM-DD format
}

try {
  await getHolidays(1800);
} catch (error) {
  // InvalidYearError: Year must be between 1900 and 2100, got 1800
}
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Generate static holiday data
npm run build:static
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or pull request.