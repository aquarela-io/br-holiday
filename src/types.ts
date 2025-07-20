export interface Holiday {
  date: string;  // YYYY-MM-DD format
  name: string;  // Holiday name in Portuguese
  type: string;  // Holiday type (e.g., 'national')
}

export class InvalidDateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDateError';
  }
}

export class InvalidYearError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidYearError';
  }
}

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}